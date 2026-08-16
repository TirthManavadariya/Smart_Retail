"""
Alerts endpoints — Inbox, assign, acknowledge, task workflow, associates.
Extracts logic from dashboard/views/alerts_page.py
"""
from flask import Blueprint, jsonify, request
import numpy as np
from datetime import datetime, timedelta

alerts_bp = Blueprint("alerts", __name__)

# In-memory state (would be DB-backed in production)
_assigned_alerts = {}
_manual_tasks = []


@alerts_bp.route("/api/alerts/inbox")
def alert_inbox():
    store_id = request.args.get("store_id", "STORE01")
    try:
        from alerts.alert_manager import AlertManager
        mgr = AlertManager()
        live = mgr.generate_sample_alerts(store_id=store_id, count=5)
        impact_labels = {5: "HIGH IMPACT", 4: "HIGH IMPACT", 3: "MED IMPACT", 2: "LOW IMPACT", 1: "LOW IMPACT"}
        alerts = []
        for a in live[:5]:
            try:
                d = datetime.fromisoformat(a.created_at)
                mins = max(1, int((datetime.now() - d).total_seconds() / 60))
                time_str = f"{mins}m ago"
            except Exception:
                time_str = "just now"
            alerts.append({
                "id": a.alert_id, "impact": f"{impact_labels.get(a.severity, 'ALERT')} — ${a.revenue_impact:,.0f}",
                "severity": a.severity, "time_ago": time_str, "title": a.message,
                "detail": f"{a.sku_id} • {a.aisle_id}/{a.shelf_id}",
                "corrective": a.corrective_action or a.suggested_action,
                "assigned_to": _assigned_alerts.get(f"alert_{a.alert_id}"),
            })
        return jsonify({"alerts": alerts, "manual_tasks": _manual_tasks})
    except Exception:
        fallback = [
            {"id": 1, "impact": "HIGH IMPACT — $1,200", "severity": 5, "time_ago": "2m ago",
             "title": "Shelf Stockout: Premium Gin", "detail": "SKU: 004829 • Aisle 4B",
             "corrective": "Restock Premium Gin at Aisle 4B. Suggested reorder qty: 12 units.", "assigned_to": None},
            {"id": 2, "impact": "MED IMPACT — $450", "severity": 3, "time_ago": "14m ago",
             "title": "Misplaced Inventory", "detail": "SKU: 119203 • Aisle 12",
             "corrective": "Move product to correct planogram position.", "assigned_to": None},
            {"id": 3, "impact": "LOW IMPACT — $85", "severity": 1, "time_ago": "45m ago",
             "title": "Price Tag Mismatch", "detail": "SKU: 092831 • Aisle 22",
             "corrective": "Update price tag to match system price.", "assigned_to": None},
        ]
        return jsonify({"alerts": fallback, "manual_tasks": _manual_tasks})


@alerts_bp.route("/api/alerts/assign", methods=["POST"])
def assign_alert():
    data = request.get_json()
    alert_key = f"alert_{data.get('alert_id')}"
    associates = ["Priya M.", "Rajesh D.", "Amit K.", "Kavita L.", "Sneha R.", "Vikram S."]
    import random
    assignee = random.choice(associates)
    _assigned_alerts[alert_key] = assignee
    return jsonify({"status": "assigned", "assignee": assignee})


@alerts_bp.route("/api/alerts/tasks")
def task_workflow():
    return jsonify({
        "todo": [
            {"title": "Restock: Organic Milk", "location": "Dairy Section", "assignee": None, "due": "15m"},
            {"title": "Fix Display: End Cap 5", "location": "Front Store", "assignee": None, "due": "Urgent"},
        ],
        "in_progress": [
            {"title": "Spill Cleanup", "assignee": "Rajesh D.", "progress": 80, "started": "12m ago"},
        ],
        "completed": [
            {"title": "Restock: Pet Food", "assignee": "Arjun S.", "verified": True},
        ],
        "manual_tasks": _manual_tasks,
    })


@alerts_bp.route("/api/alerts/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    task = {
        "title": data.get("title", ""), "desc": data.get("desc", ""),
        "assignee": data.get("assignee", ""), "urgency": data.get("urgency", "Medium"),
        "location": data.get("location", ""), "created": datetime.now().strftime("%H:%M"),
    }
    _manual_tasks.append(task)
    return jsonify({"status": "created", "task": task})


@alerts_bp.route("/api/alerts/associates")
def associate_performance():
    np.random.seed(55)
    associates = [
        {"name": "Priya M.", "status": "Active", "tasks_done": int(np.random.randint(10, 25)),
         "avg_resp": f"{np.random.uniform(2, 5):.1f}m"},
        {"name": "Rajesh D.", "status": "Active", "tasks_done": int(np.random.randint(10, 25)),
         "avg_resp": f"{np.random.uniform(2, 5):.1f}m"},
        {"name": "Amit K.", "status": "Break", "tasks_done": int(np.random.randint(5, 15)),
         "avg_resp": f"{np.random.uniform(3, 8):.1f}m"},
        {"name": "Kavita L.", "status": "Active", "tasks_done": int(np.random.randint(15, 30)),
         "avg_resp": f"{np.random.uniform(2, 4):.1f}m"},
    ]
    np.random.seed(hash("alerts_kpi") % 2**31)
    return jsonify({
        "associates": associates,
        "avg_response_time": round(float(np.random.uniform(3, 6)), 1),
        "tasks_resolved": int(np.random.randint(100, 200)),
    })
