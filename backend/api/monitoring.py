"""
Monitoring endpoints — Shelf status, aisle detail, planogram compliance, traffic.
Extracts logic from dashboard/views/shelf_monitoring.py
"""
from flask import Blueprint, jsonify, request
import numpy as np

monitoring_bp = Blueprint("monitoring", __name__)


@monitoring_bp.route("/api/monitoring/shelf-status")
def shelf_status():
    """Aisle data for the floor plan."""
    store_id = request.args.get("store_id", "STORE01")
    aisles = [
        {"name": "Aisle 01: Produce", "status": "optimal", "sections": 4},
        {"name": "Aisle 02: Bakery", "status": "optimal", "sections": 3},
        {"name": "Aisle 03: Beverages", "status": "critical", "sections": 5},
        {"name": "Aisle 04: Snacks", "status": "low", "sections": 3},
        {"name": "Frozen Foods", "status": "optimal", "sections": 2},
    ]
    return jsonify(aisles)


@monitoring_bp.route("/api/monitoring/aisle-detail")
def aisle_detail():
    """Aisle detail panel data: stock %, compliance, detections."""
    np.random.seed(99)
    stock_pct = round(float(np.random.uniform(60, 85)), 1)
    compliance_pct = int(np.random.randint(82, 96))
    violations = int(np.random.randint(1, 5))
    delta_pct = round(float(np.random.uniform(2, 8)), 1)

    detections = [
        {"icon": "critical", "emoji": "⚠", "sku": "Soda 12pk - SKU 8821",
         "msg": "Level Critical: 0 units remaining on shelf.", "time": "14:22:11"},
        {"icon": "warning", "emoji": "📦", "sku": "Iced Tea 1L - SKU 4432",
         "msg": "Planogram mismatch detected (Position 4B).", "time": "14:19:45"},
        {"icon": "success", "emoji": "👁", "sku": "Mineral Water - SKU 1109",
         "msg": "Product replenished. Status: Optimal.", "time": "14:15:02"},
        {"icon": "info", "emoji": "👤", "sku": "Customer Engagement",
         "msg": "High dwell time detected near energy drinks section.", "time": "14:12:30"},
    ]

    return jsonify({
        "stock_pct": stock_pct,
        "compliance_pct": compliance_pct,
        "violations": violations,
        "delta_pct": delta_pct,
        "detections": detections,
    })


@monitoring_bp.route("/api/monitoring/planogram")
def planogram_compliance():
    """Planogram compliance percentages by aisle."""
    store_id = request.args.get("store_id", "STORE01")
    np.random.seed(hash(store_id + "plano") % 2**31)
    aisles = [
        {"name": "Aisle 01: Produce", "pct": int(np.random.randint(92, 99))},
        {"name": "Aisle 02: Bakery", "pct": int(np.random.randint(88, 96))},
        {"name": "Aisle 03: Dairy", "pct": int(np.random.randint(65, 82))},
        {"name": "Aisle 04: Meat & Seafood", "pct": int(np.random.randint(85, 95))},
        {"name": "Aisle 05: Beverages", "pct": int(np.random.randint(90, 98))},
        {"name": "Aisle 06: Snacks", "pct": int(np.random.randint(85, 95))},
    ]
    return jsonify(aisles)


@monitoring_bp.route("/api/monitoring/traffic")
def customer_traffic():
    """Customer traffic heatmap data."""
    store_id = request.args.get("store_id", "STORE01")
    np.random.seed(hash(store_id + "traffic") % 2**31)
    zones = ["Entrance", "Produce", "Aisles 1-2", "Aisles 3-4", "Checkout"]
    hours = [f"{h}:00" for h in range(8, 22)]
    traffic = np.random.poisson(8, (len(zones), len(hours))).astype(float)
    traffic[0, :] += np.random.uniform(5, 15, len(hours))
    traffic[-1, :] += np.random.uniform(3, 10, len(hours))
    return jsonify({"zones": zones, "hours": hours, "data": traffic.round(1).tolist()})
