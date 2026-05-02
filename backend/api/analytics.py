"""
Analytics & Settings endpoints.
Extracts logic from dashboard/views/analytics_page.py
"""
from flask import Blueprint, jsonify, request
import numpy as np

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/api/analytics/kpis")
def analytics_kpis():
    store_id = request.args.get("store_id", "STORE01")
    np.random.seed(hash(store_id + "analytics") % 2**31)
    return jsonify({
        "revenue_protected": f"₹{np.random.randint(80, 200)}K",
        "revenue_delta": f"+{np.random.randint(10, 30)}%",
        "compliance_score": int(np.random.randint(88, 98)),
        "stockout_events": int(np.random.randint(50, 150)),
        "stockout_delta": f"↓ {np.random.randint(15, 40)}%",
    })


@analytics_bp.route("/api/analytics/revenue-trend")
def revenue_trend():
    store_id = request.args.get("store_id", "STORE01")
    np.random.seed(hash(store_id + "analysis") % 2**31)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    values = [int(np.random.randint(20, 50)) for _ in months]
    return jsonify({"labels": months, "values": values})


@analytics_bp.route("/api/analytics/category-performance")
def category_performance():
    store_id = request.args.get("store_id", "STORE01")
    np.random.seed(hash(store_id + "analysis") % 2**31)
    cats = ["Beverages", "Dairy", "Produce", "Snacks", "Frozen", "Bakery"]
    vals = [int(np.random.randint(15, 45)) for _ in cats]
    colors = ["#6ee6ee", "#5ed8e0", "#4ecad2", "#3db8c0", "#cecb5b", "#bcc9ca"]
    return jsonify({"labels": cats, "values": vals, "colors": colors})


@analytics_bp.route("/api/analytics/stockout-heatmap")
def stockout_heatmap():
    store_id = request.args.get("store_id", "STORE01")
    data = _build_stockout_heatmap(store_id)
    return jsonify(data)


@analytics_bp.route("/api/settings/save", methods=["POST"])
def save_settings():
    data = request.get_json()
    # In production, persist to DB. For now, just acknowledge.
    return jsonify({"status": "saved", "settings": data})


def _build_stockout_heatmap(store_id):
    num_hours = 14
    default_aisles = [f"Aisle {i+1}" for i in range(6)]
    try:
        from database.db_manager import db
        rows = db.execute(
            "SELECT aisle_id, detected_at FROM detections "
            "WHERE store_id = ? AND stock_level = 'EMPTY' ORDER BY detected_at", (store_id,))
        if rows and len(rows) >= 10:
            aisle_set = sorted(set(r["aisle_id"] for r in rows))
            aisles = aisle_set if aisle_set else default_aisles
            aisle_idx = {a: i for i, a in enumerate(aisles)}
            matrix = np.zeros((len(aisles), num_hours), dtype=int)
            for r in rows:
                ts = r.get("detected_at", "")
                a = r.get("aisle_id", "")
                if not ts or a not in aisle_idx:
                    continue
                try:
                    hour = int(ts[11:13])
                except (ValueError, IndexError):
                    continue
                hour_bin = hour - 8
                if 0 <= hour_bin < num_hours:
                    matrix[aisle_idx[a], hour_bin] += 1
            return {"aisles": aisles, "hours": [f"{h}:00" for h in range(8, 22)],
                    "matrix": matrix.tolist()}
    except Exception:
        pass

    np.random.seed(hash(store_id + "stockout_heatmap") % 2**31)
    matrix = np.zeros((len(default_aisles), num_hours), dtype=float)
    for ai in range(len(default_aisles)):
        base = np.random.uniform(1, 4)
        for hi in range(num_hours):
            hour = hi + 8
            noon = 4.0 * np.exp(-0.5 * ((hour - 12) / 1.5) ** 2)
            eve = 3.5 * np.exp(-0.5 * ((hour - 18) / 1.5) ** 2)
            matrix[ai, hi] = max(0, int(base + noon + eve + np.random.poisson(1)))
    matrix[2, :] = (matrix[2, :] * 1.6).astype(int)
    matrix[3, :] = (matrix[3, :] * 1.3).astype(int)
    return {"aisles": default_aisles, "hours": [f"{h}:00" for h in range(8, 22)],
            "matrix": matrix.astype(int).tolist()}
