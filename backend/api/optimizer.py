"""
Optimizer endpoints — Results, run, top performers, categories, downloads.
Extracts logic from dashboard/views/shelf_optimizer_page.py
"""
from flask import Blueprint, jsonify, request, send_file
from pathlib import Path
import numpy as np
import pandas as pd
import json, io

optimizer_bp = Blueprint("optimizer", __name__)

from config.settings import (STORE_CONFIG, OPTIMIZER_OUTPUT_DIR, EYE_LEVEL_SHELVES,
                              SHELF_VISIBILITY_MULTIPLIER, DATABASE_PATH, POS_DATA_DIR)


@optimizer_bp.route("/api/optimizer/results")
def optimizer_results():
    store_id = request.args.get("store_id", "STORE01")
    planogram = _load_planogram(store_id)
    sales_df = _load_sku_metrics(store_id)
    if planogram is None or sales_df.empty:
        return jsonify({"available": False})

    config = STORE_CONFIG[store_id]
    total_slots = config["aisles"] * config["shelves_per_aisle"] * config["sections_per_shelf"]
    filled, eye_level_skus, all_placed = 0, set(), {}
    for aisle in planogram.get("aisles", []):
        for shelf in aisle.get("shelves", []):
            for sec in shelf.get("sections", []):
                if sec.get("sku_id", "EMPTY") != "EMPTY":
                    filled += 1
                    all_placed[sec["sku_id"]] = shelf["shelf_number"]
                    if shelf["shelf_number"] in EYE_LEVEL_SHELVES:
                        eye_level_skus.add(sec["sku_id"])

    merged = _build_merged_df(sales_df, store_id)
    p80 = float(merged["composite"].quantile(0.80))
    p50 = float(merged["composite"].quantile(0.50))
    merged["tier"] = merged["composite"].apply(lambda x: "Premium" if x >= p80 else "Standard" if x >= p50 else "Economy")

    premium_ct = int((merged["tier"] == "Premium").sum())
    standard_ct = int((merged["tier"] == "Standard").sum())
    economy_ct = int((merged["tier"] == "Economy").sum())
    premium_skus = set(merged[merged["tier"] == "Premium"]["sku_id"])
    premium_eye = len(premium_skus & eye_level_skus)
    eye_pct = int(premium_eye / max(len(premium_skus), 1) * 100)

    avg_vis = float(np.mean(list(SHELF_VISIBILITY_MULTIPLIER.values())))
    baseline = float(sum(merged["sales_velocity"] * merged["unit_price"] * avg_vis))
    optimized = 0.0
    for _, row in merged.iterrows():
        base = row["sales_velocity"] * row["unit_price"]
        vis = SHELF_VISIBILITY_MULTIPLIER.get(all_placed.get(row["sku_id"], 0), avg_vis)
        optimized += base * vis
    lift = ((optimized - baseline) / baseline * 100) if baseline > 0 else 0

    return jsonify({
        "available": True,
        "kpis": {"lift_pct": round(lift, 1), "lift_value": round(optimized - baseline, 0),
                 "filled": filled, "total_slots": total_slots,
                 "premium_eye": premium_eye, "premium_count": premium_ct,
                 "eye_pct": eye_pct, "optimized_rev": round(optimized, 0),
                 "baseline_rev": round(baseline, 0)},
        "tiers": {"premium": premium_ct, "standard": standard_ct, "economy": economy_ct,
                  "total": len(merged)},
    })


@optimizer_bp.route("/api/optimizer/run", methods=["POST"])
def run_optimizer():
    store_id = request.args.get("store_id", "STORE01")
    try:
        from optimization.shelf_optimizer import optimize_store, PlanogramBuilder
        planogram_obj, _ = optimize_store(store_id)
        PlanogramBuilder().save_planogram(planogram_obj)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@optimizer_bp.route("/api/optimizer/top-performers")
def top_performers():
    store_id = request.args.get("store_id", "STORE01")
    sales_df = _load_sku_metrics(store_id)
    if sales_df.empty:
        return jsonify([])
    merged = _build_merged_df(sales_df, store_id)
    p80 = float(merged["composite"].quantile(0.80))
    p50 = float(merged["composite"].quantile(0.50))
    merged["tier"] = merged["composite"].apply(lambda x: "Premium" if x >= p80 else "Standard" if x >= p50 else "Economy")
    top = merged.nlargest(10, "composite")
    result = []
    for _, r in top.iterrows():
        result.append({"sku_id": r["sku_id"], "product_name": r["product_name"],
                       "tier": r["tier"], "score": round(float(r["composite"]), 3),
                       "revenue": round(float(r["total_revenue"]), 0)})
    return jsonify(result)


@optimizer_bp.route("/api/optimizer/planogram-grid")
def planogram_grid():
    store_id = request.args.get("store_id", "STORE01")
    aisle_idx = int(request.args.get("aisle_idx", 0))
    planogram = _load_planogram(store_id)
    if not planogram:
        return jsonify({"error": "No planogram"}), 404
    aisles = planogram.get("aisles", [])
    aisle_names = [{"id": a["aisle_id"], "name": a["aisle_name"]} for a in aisles]
    if aisle_idx >= len(aisles):
        aisle_idx = 0
    aisle = aisles[aisle_idx]
    shelves = sorted(aisle.get("shelves", []), key=lambda s: s["shelf_number"], reverse=True)
    shelves_out = []
    for shelf in shelves:
        sections = []
        for sec in shelf.get("sections", []):
            sections.append({"sku_id": sec.get("sku_id", "EMPTY"),
                             "product_name": sec.get("product_name", "")})
        shelves_out.append({"shelf_number": shelf["shelf_number"],
                            "is_eye_level": shelf["shelf_number"] in EYE_LEVEL_SHELVES,
                            "sections": sections})
    return jsonify({"aisle_names": aisle_names, "shelves": shelves_out})


@optimizer_bp.route("/api/optimizer/download-planogram")
def download_planogram():
    store_id = request.args.get("store_id", "STORE01")
    path = OPTIMIZER_OUTPUT_DIR / f"optimized_planogram_{store_id.lower()}.json"
    if path.exists():
        return send_file(str(path), mimetype="application/json", as_attachment=True,
                         download_name=path.name)
    return jsonify({"error": "Not found"}), 404


# ── Helpers ──────────────────────────────────────────────────────────
def _load_planogram(store_id):
    path = OPTIMIZER_OUTPUT_DIR / f"optimized_planogram_{store_id.lower()}.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return None

def _load_sku_metrics(store_id):
    import sqlite3
    if not DATABASE_PATH.exists():
        return pd.DataFrame()
    conn = sqlite3.connect(str(DATABASE_PATH))
    try:
        return pd.read_sql_query(
            "SELECT pt.sku_id, pt.product_name, pt.category, AVG(pt.unit_price) AS unit_price, "
            "SUM(pt.quantity_sold) AS total_quantity, SUM(pt.revenue) AS total_revenue, "
            "COUNT(DISTINCT pt.date) AS num_days FROM pos_transactions pt "
            "WHERE pt.store_id = ? GROUP BY pt.sku_id, pt.product_name, pt.category "
            "ORDER BY total_revenue DESC", conn, params=(store_id,))
    except Exception:
        return pd.DataFrame()
    finally:
        conn.close()

def _build_merged_df(sales_df, store_id):
    merged = sales_df.copy()
    eng_path = POS_DATA_DIR / "customer_engagement.csv"
    if eng_path.exists():
        eng = pd.read_csv(str(eng_path))
        eng = eng[eng["store_id"] == store_id]
        merged = merged.merge(eng[["sku_id", "impression_count", "pick_count", "conversion_rate"]],
                              on="sku_id", how="left")
    for col in ["impression_count", "pick_count", "conversion_rate"]:
        if col not in merged.columns:
            merged[col] = 0
    merged = merged.fillna(0)
    num_weeks = max(merged["num_days"].max() / 7.0, 1.0)
    merged["sales_velocity"] = merged["total_quantity"] / num_weeks
    merged["profit_contribution"] = merged["total_quantity"] * merged["unit_price"]
    max_imp = max(merged["impression_count"].max(), 1)
    merged["engagement_score"] = 0.6 * merged["conversion_rate"] + 0.4 * (merged["impression_count"] / max_imp)
    for col in ["sales_velocity", "profit_contribution", "engagement_score"]:
        mx = merged[col].max()
        merged[f"{col}_norm"] = merged[col] / mx if mx > 0 else 0
    merged["composite"] = (0.4 * merged["sales_velocity_norm"] + 0.35 * merged["profit_contribution_norm"]
                           + 0.25 * merged["engagement_score_norm"])
    return merged
