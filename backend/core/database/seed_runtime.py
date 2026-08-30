"""
Idempotent runtime seeding.

Called once at server startup. Ensures the core tables exist and fills any
EMPTY auxiliary tables (customer_engagement, detections, alerts) with sample
rows so the DB-backed endpoints return real data instead of always falling
back to synthetic values. Every step is guarded so a failure in one table can
never prevent the rest — or the server — from coming up.
"""
from __future__ import annotations

import random
from datetime import datetime, timedelta
from pathlib import Path


def seed_if_empty() -> None:
    """Seed sample data into empty tables. Safe to call repeatedly."""
    from database.db_manager import db  # singleton import creates tables
    from config.settings import STORE_CONFIG, POS_DATA_DIR

    _seed_stores(db, STORE_CONFIG)
    _seed_engagement(db, Path(POS_DATA_DIR))
    _seed_detections(db, STORE_CONFIG)
    _seed_alerts(db, STORE_CONFIG)


def _count(db, table: str) -> int:
    try:
        return db.count(table)
    except Exception:
        return -1  # treat "unknown" as "don't seed" to stay safe


def _existing_ids(db, table: str, column: str) -> set:
    try:
        return {row[column] for row in db.execute(f"SELECT {column} FROM {table}")}
    except Exception:
        return set()


# ── Stores ───────────────────────────────────────────────────────────
def _seed_stores(db, store_config: dict) -> None:
    existing = _existing_ids(db, "stores", "store_id")
    rows = []
    for store_id, cfg in store_config.items():
        if store_id in existing:
            continue
        rows.append({
            "store_id": store_id,
            "store_name": cfg["name"],
            "num_aisles": cfg["aisles"],
            "shelves_per_aisle": cfg["shelves_per_aisle"],
            "sections_per_shelf": cfg["sections_per_shelf"],
            "address": "",
        })
    if rows:
        try:
            db.insert_many("stores", rows)
        except Exception as exc:
            print(f"  ⚠ store seeding skipped: {exc}")


# ── Customer engagement (from CSV) ───────────────────────────────────
def _seed_engagement(db, pos_data_dir: Path) -> None:
    if _count(db, "customer_engagement") != 0:
        return
    csv_path = pos_data_dir / "customer_engagement.csv"
    if not csv_path.exists():
        return
    try:
        import pandas as pd

        df = pd.read_csv(csv_path)
        valid_skus = _existing_ids(db, "products", "sku_id")
        valid_stores = _existing_ids(db, "stores", "store_id")
        rows = []
        for _, r in df.iterrows():
            sku = str(r.get("sku_id", ""))
            store = str(r.get("store_id", ""))
            # Respect foreign keys — skip rows that reference unknown parents.
            if valid_skus and sku not in valid_skus:
                continue
            if valid_stores and store not in valid_stores:
                continue
            rows.append({
                "store_id": store,
                "sku_id": sku,
                "category": str(r.get("category", "")),
                "impression_count": int(r.get("impression_count", 0) or 0),
                "pick_count": int(r.get("pick_count", 0) or 0),
                "conversion_rate": float(r.get("conversion_rate", 0.0) or 0.0),
            })
        if rows:
            db.insert_many("customer_engagement", rows)
    except Exception as exc:
        print(f"  ⚠ engagement seeding skipped: {exc}")


# ── Detections ───────────────────────────────────────────────────────
def _seed_detections(db, store_config: dict) -> None:
    if _count(db, "detections") != 0:
        return
    sku_ids = sorted(_existing_ids(db, "products", "sku_id")) or [f"SKU{i:03d}" for i in range(1, 51)]
    rng = random.Random(42)
    now = datetime.now()
    levels = ["FULL", "FULL", "FULL", "LOW", "LOW", "EMPTY"]
    rows = []
    for store_id, cfg in store_config.items():
        aisles = min(cfg["aisles"], 6)
        sections = min(cfg["sections_per_shelf"], 4)
        for ai in range(aisles):
            for si in range(sections):
                # A few timestamps per section spread across the trading day.
                for _ in range(3):
                    day = now - timedelta(days=rng.randint(0, 2))
                    hh = rng.randint(8, 21)
                    mm = rng.randint(0, 59)
                    ts = f"{day.strftime('%Y-%m-%d')} {hh:02d}:{mm:02d}:00"
                    rows.append({
                        "store_id": store_id,
                        "aisle_id": f"A{ai + 1:02d}",
                        "shelf_id": f"SEC-{si + 1:02d}",
                        "sku_id": rng.choice(sku_ids),
                        "confidence": round(rng.uniform(0.75, 0.98), 3),
                        "bbox_x": rng.randint(0, 400), "bbox_y": rng.randint(0, 300),
                        "bbox_w": rng.randint(30, 120), "bbox_h": rng.randint(40, 160),
                        "stock_level": rng.choice(levels),
                        "detected_at": ts,
                        "image_path": "",
                    })
    if rows:
        try:
            db.insert_many("detections", rows)
        except Exception as exc:
            print(f"  ⚠ detection seeding skipped: {exc}")


# ── Alerts ───────────────────────────────────────────────────────────
def _seed_alerts(db, store_config: dict) -> None:
    if _count(db, "alerts") != 0:
        return
    rows = []
    # Prefer the real AlertManager templates; fall back to a small static set.
    try:
        from alerts.alert_manager import AlertManager

        mgr = AlertManager()
        for store_id in store_config:
            for a in mgr.generate_sample_alerts(store_id=store_id, count=4):
                rows.append({
                    "alert_type": a.alert_type,
                    "severity": int(a.severity),
                    "store_id": a.store_id,
                    "aisle_id": a.aisle_id or "",
                    "shelf_id": a.shelf_id or "",
                    "sku_id": a.sku_id or "",
                    "message": a.message,
                    "revenue_impact": float(a.revenue_impact or 0),
                    "suggested_action": a.suggested_action or "",
                    "priority_score": float(getattr(a, "priority_score", 0) or 0),
                    "acknowledged": 0,
                })
    except Exception:
        rng = random.Random(7)
        templates = [
            ("STOCKOUT", 5, "Shelf stockout detected"),
            ("LOW_STOCK", 3, "Low stock — replenish soon"),
            ("PLANOGRAM_VIOLATION", 2, "Planogram mismatch detected"),
            ("PRICE_MISMATCH", 1, "Price tag mismatch"),
        ]
        for store_id in store_config:
            for atype, sev, msg in templates:
                rows.append({
                    "alert_type": atype, "severity": sev, "store_id": store_id,
                    "aisle_id": f"A{rng.randint(1, 6):02d}", "shelf_id": f"SEC-{rng.randint(1, 4):02d}",
                    "sku_id": f"SKU{rng.randint(1, 50):03d}", "message": msg,
                    "revenue_impact": float(rng.randint(80, 2100)),
                    "suggested_action": "Review and resolve", "priority_score": float(sev),
                    "acknowledged": 0,
                })
    if rows:
        try:
            db.insert_many("alerts", rows)
        except Exception as exc:
            print(f"  ⚠ alert seeding skipped: {exc}")
