"""
Overview endpoints — Store Health Dashboard data.
Extracts all data-processing logic from dashboard/views/overview_page.py
"""
from flask import Blueprint, jsonify, request, send_file
import numpy as np
from datetime import datetime, timedelta
import io

overview_bp = Blueprint("overview", __name__)

# ── Store display names ──────────────────────────────────────────────
STORE_OPTIONS = {
    "STORE01": "Mumbai — Flagship Store",
    "STORE02": "Ahmedabad — CG Road",
    "STORE03": "Delhi — Connaught Place",
}


def _get_kpi_data(store_id: str) -> dict:
    """Generate KPI values for this store (seeded for consistency)."""
    np.random.seed(hash(store_id) % 2**31)
    return {
        "shelf_health": round(float(np.random.uniform(90, 97)), 1),
        "shelf_delta": round(float(np.random.uniform(1, 4)), 1),
        "oos_units": int(np.random.randint(8, 25)),
        "revenue_recovered": f"{np.random.randint(8, 18):,},480",
        "forecast_accuracy": round(float(np.random.uniform(95, 99)), 1),
    }


@overview_bp.route("/api/overview/kpis")
def overview_kpis():
    store_id = request.args.get("store_id", "STORE01")
    kpi = _get_kpi_data(store_id)
    return jsonify(kpi)


@overview_bp.route("/api/overview/floor-plan")
def overview_floor_plan():
    store_id = request.args.get("store_id", "STORE01")
    data = _get_floor_plan_data(store_id, num_aisles=5, sections_per_aisle=3)

    # Aggregate counts
    full_ct = sum(1 for d in data if d["status"] == "FULL")
    low_ct = sum(1 for d in data if d["status"] == "LOW")
    empty_ct = sum(1 for d in data if d["status"] == "EMPTY")
    viol_ct = sum(1 for d in data if d["status"] == "VIOLATION")

    return jsonify({
        "sections": data,
        "summary": {"full": full_ct, "low": low_ct, "empty": empty_ct, "violation": viol_ct},
    })


@overview_bp.route("/api/overview/alerts")
def overview_alerts():
    store_id = request.args.get("store_id", "STORE01")
    try:
        from alerts.alert_manager import AlertManager
        mgr = AlertManager()
        live = mgr.generate_sample_alerts(store_id=store_id, count=3)
        alerts_out = []
        for a in live[:3]:
            try:
                import datetime as dt_mod
                d = dt_mod.datetime.fromisoformat(a.created_at)
                mins = max(1, int((dt_mod.datetime.now() - d).total_seconds() / 60))
                time_str = f"{mins}m ago"
            except Exception:
                time_str = "just now"
            alerts_out.append({
                "message": a.message,
                "sku_id": a.sku_id,
                "aisle_id": a.aisle_id,
                "shelf_id": a.shelf_id,
                "severity": a.severity,
                "revenue_impact": a.revenue_impact,
                "time_ago": time_str,
            })
        return jsonify(alerts_out)
    except Exception:
        return jsonify([
            {"message": "Premium Greek Yogurt - 500g", "detail": "Shelf E4-2 • 0 units left",
             "badge": "Loss Warning", "severity": 5, "time_ago": "2m ago",
             "metric_label": "Est. Daily Loss", "revenue_impact": 1420},
            {"message": "Energy Drink Multi-pack (x6)", "detail": "Aisle 09 • Misplaced Item Alert",
             "badge": "Compliance", "severity": 3, "time_ago": "14m ago",
             "metric_label": "Sales Risk", "revenue_impact": 890},
            {"message": "Organic Cage-Free Eggs Large", "detail": "Shelf F1-1 • High Velocity",
             "badge": "Out of Stock", "severity": 5, "time_ago": "28m ago",
             "metric_label": "Est. Daily Loss", "revenue_impact": 2100},
        ])


@overview_bp.route("/api/overview/oos-trends")
def overview_oos_trends():
    """24-hour out-of-stock trend data."""
    now = datetime.now()
    hours = [(now - timedelta(hours=23 - i)).strftime("%H:%M") for i in range(24)]
    values = [12, 10, 8, 6, 5, 4, 5, 8, 14, 18, 22, 28, 25, 20, 18, 22, 30, 35, 28, 22, 18, 14, 10, 8]
    return jsonify({"labels": hours, "values": values})


@overview_bp.route("/api/overview/compliance")
def overview_compliance():
    """Planogram compliance by aisle."""
    np.random.seed(42)
    avg = int(np.random.randint(88, 96))
    aisles = [
        {"name": "Aisle 01: Produce", "pct": 98},
        {"name": "Aisle 02: Bakery", "pct": 94},
        {"name": "Aisle 03: Dairy", "pct": 78},
        {"name": "Aisle 04: Meat & Seafood", "pct": 91},
        {"name": "Aisle 05: Beverages", "pct": 96},
    ]
    return jsonify({"average": avg, "aisles": aisles})


@overview_bp.route("/api/reports/pdf")
def download_pdf():
    """Generate and return PDF report."""
    store_id = request.args.get("store_id", "STORE01")
    kpi = _get_kpi_data(store_id)
    pdf_bytes = _generate_pdf_report(store_id, STORE_OPTIONS, kpi)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"ShelfIQ_Report_{store_id}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf",
    )


# ── Helper functions (extracted from overview_page.py) ───────────────

def _get_floor_plan_data(store_id: str, num_aisles: int = 5, sections_per_aisle: int = 3) -> list:
    """Get shelf status data. Tries DB, falls back to synthetic."""
    floor = []
    try:
        from data.generators.generate_pos_data import PRODUCT_NAMES
    except Exception:
        PRODUCT_NAMES = [f"Product {i}" for i in range(1, 51)]

    try:
        from database.db_manager import db
        detections = db.execute(
            "SELECT aisle_id, shelf_id, stock_level, sku_id "
            "FROM detections WHERE store_id = ? "
            "ORDER BY detected_at DESC LIMIT ?",
            (store_id, num_aisles * sections_per_aisle * 3),
        )
        violations = set()
        try:
            viol_rows = db.execute(
                "SELECT aisle_id, shelf_id FROM alerts "
                "WHERE store_id = ? AND alert_type = 'PLANOGRAM_VIOLATION' "
                "AND acknowledged = 0", (store_id,),
            )
            for v in viol_rows:
                violations.add((v.get("aisle_id", ""), v.get("shelf_id", "")))
        except Exception:
            pass

        if detections and len(detections) >= num_aisles:
            seen = {}
            for d in detections:
                key = (d.get("aisle_id", ""), d.get("shelf_id", ""))
                if key not in seen:
                    seen[key] = d
            for ai in range(num_aisles):
                for si in range(sections_per_aisle):
                    aid = f"A{ai+1:02d}"
                    sid = f"SEC-{si+1:02d}"
                    key = (aid, sid)
                    det = seen.get(key)
                    if det:
                        status = det.get("stock_level", "FULL")
                        sku = det.get("sku_id", "")
                        if key in violations:
                            status = "VIOLATION"
                        sku_idx = int(sku.replace("SKU", "")) - 1 if sku and sku.startswith("SKU") else 0
                        name = PRODUCT_NAMES[sku_idx % len(PRODUCT_NAMES)] if sku else "Unknown"
                    else:
                        status, name, sku = "FULL", "No data", ""
                    fill_pct = {"FULL": "85%", "LOW": "40%", "EMPTY": "0%", "VIOLATION": "—"}[status]
                    floor.append({"aisle_idx": ai, "section": si, "status": status,
                                  "label": f"A{ai+1} S{si+1}", "sku": sku, "name": name, "fill": fill_pct})
            if floor:
                return floor
    except Exception:
        pass

    # Synthetic fallback
    np.random.seed(hash(store_id + "floorplan") % 2**31)
    for ai in range(num_aisles):
        for si in range(sections_per_aisle):
            r = np.random.random()
            status = "FULL" if r < 0.55 else "LOW" if r < 0.75 else "EMPTY" if r < 0.88 else "VIOLATION"
            sku_num = int(np.random.randint(1, 51))
            sku_id = f"SKU{sku_num:03d}"
            name = PRODUCT_NAMES[(sku_num - 1) % len(PRODUCT_NAMES)]
            fill_pct = {"FULL": f"{np.random.randint(75,100)}%", "LOW": f"{np.random.randint(30,55)}%",
                        "EMPTY": f"{np.random.randint(0,15)}%", "VIOLATION": "—"}[status]
            floor.append({"aisle_idx": ai, "section": si, "status": status,
                          "label": f"A{ai+1} S{si+1}", "sku": sku_id, "name": name, "fill": fill_pct})
    return floor


def _pdf_safe(text: str) -> str:
    return (text.replace("\u2014", "-").replace("\u2013", "-").replace("\u2019", "'")
            .replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
            .replace("\u20b9", "Rs.").replace("\u2022", "*").replace("\u2026", "..."))


def _generate_pdf_report(store_id: str, store_options: dict, kpi: dict) -> bytes:
    try:
        from fpdf import FPDF
    except ImportError:
        content = (f"ShelfIQ Store Health Report\nStore: {store_options.get(store_id, store_id)}\n"
                   f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
                   f"Shelf Health Score: {kpi['shelf_health']}%\nOOS Units: {kpi['oos_units']}\n"
                   f"Revenue Recovered: Rs.{kpi['revenue_recovered']}\nForecast Accuracy: {kpi['forecast_accuracy']}%\n")
        return content.encode("utf-8")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(78, 202, 210)
    pdf.cell(0, 15, "ShelfIQ - Store Health Report", new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(120, 120, 140)
    pdf.cell(0, 8, f"Store: {_pdf_safe(store_options.get(store_id, store_id))}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)

    pdf.set_draw_color(78, 202, 210)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(30, 30, 60)
    pdf.cell(0, 10, "Key Performance Indicators", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    kpi_items = [
        ("Shelf Health Score", f"{kpi['shelf_health']}%"),
        ("Real-time Out-of-Stock", f"{kpi['oos_units']} units"),
        ("Revenue Recovered", f"Rs.{kpi['revenue_recovered']}"),
        ("Forecast Accuracy", f"{kpi['forecast_accuracy']}%"),
    ]
    pdf.set_font("Helvetica", "", 11)
    for label, value in kpi_items:
        pdf.set_text_color(80, 80, 100)
        pdf.cell(90, 8, _pdf_safe(label))
        pdf.set_text_color(30, 30, 60)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, _pdf_safe(value), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 170)
    pdf.cell(0, 6, "This report was auto-generated by ShelfIQ Retail Intelligence System.", align="C")

    return bytes(pdf.output())
