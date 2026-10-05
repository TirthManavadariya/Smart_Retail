"""
Task endpoints — manager assigns tasks to staff, staff views own tasks and marks done.
"""
from flask import Blueprint, jsonify, request, session
from datetime import datetime
from .auth import login_required, manager_required

tasks_bp = Blueprint("tasks", __name__)


@tasks_bp.route("/api/tasks")
@login_required
def list_tasks():
    """
    Manager sees all tasks.
    Staff sees only their own tasks.
    """
    from database.db_manager import db
    role = session.get("role")
    user_id = session.get("user_id")

    if role == "manager":
        rows = db.execute(
            "SELECT t.*, u.full_name as assignee_name, m.full_name as assigner_name "
            "FROM tasks t "
            "JOIN users u ON t.assigned_to = u.user_id "
            "JOIN users m ON t.assigned_by = m.user_id "
            "ORDER BY t.created_at DESC"
        )
    else:
        rows = db.execute(
            "SELECT t.*, u.full_name as assignee_name, m.full_name as assigner_name "
            "FROM tasks t "
            "JOIN users u ON t.assigned_to = u.user_id "
            "JOIN users m ON t.assigned_by = m.user_id "
            "WHERE t.assigned_to = ? "
            "ORDER BY t.created_at DESC",
            (user_id,)
        )

    return jsonify({"tasks": rows})


@tasks_bp.route("/api/tasks", methods=["POST"])
@manager_required
def create_task():
    """Manager creates and assigns a task to a staff member."""
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    assigned_to = data.get("assigned_to")
    priority = data.get("priority", "medium")
    location = data.get("location", "").strip()
    due_date = data.get("due_date", "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400
    if not assigned_to:
        return jsonify({"error": "assigned_to (staff user_id) is required"}), 400

    from database.db_manager import db
    # Verify the assignee is an active staff member
    staff = db.fetch_one("users", "user_id = ? AND role = 'staff' AND is_active = 1", (assigned_to,))
    if not staff:
        return jsonify({"error": "Invalid staff member"}), 400

    task_id = db.insert("tasks", {
        "title": title,
        "description": description,
        "assigned_to": assigned_to,
        "assigned_by": session["user_id"],
        "status": "pending",
        "priority": priority,
        "location": location,
        "due_date": due_date,
    })

    return jsonify({
        "status": "created",
        "task": {
            "task_id": task_id,
            "title": title,
            "description": description,
            "assigned_to": assigned_to,
            "assignee_name": staff["full_name"],
            "status": "pending",
            "priority": priority,
            "location": location,
            "due_date": due_date,
            "created_at": datetime.now().isoformat(),
        }
    })


@tasks_bp.route("/api/tasks/<int:task_id>", methods=["PUT"])
@login_required
def update_task(task_id):
    """
    Manager can update any task.
    Staff can only update their own tasks (e.g., mark as done, change status).
    """
    from database.db_manager import db
    role = session.get("role")
    user_id = session.get("user_id")

    task = db.fetch_one("tasks", "task_id = ?", (task_id,))
    if not task:
        return jsonify({"error": "Task not found"}), 404

    # Staff can only modify their own tasks
    if role == "staff" and task["assigned_to"] != user_id:
        return jsonify({"error": "You can only update your own tasks"}), 403

    data = request.get_json(silent=True) or {}
    updates = {}

    if role == "manager":
        # Manager can reassign, change priority, location, due date, title, desc
        if "title" in data:
            updates["title"] = data["title"].strip()
        if "description" in data:
            updates["description"] = data["description"].strip()
        if "assigned_to" in data:
            staff = db.fetch_one("users", "user_id = ? AND role = 'staff' AND is_active = 1", (data["assigned_to"],))
            if not staff:
                return jsonify({"error": "Invalid staff member"}), 400
            updates["assigned_to"] = data["assigned_to"]
        if "priority" in data:
            updates["priority"] = data["priority"]
        if "location" in data:
            updates["location"] = data["location"].strip()
        if "due_date" in data:
            updates["due_date"] = data["due_date"].strip()

    # Both manager and staff can update status
    if "status" in data:
        new_status = data["status"]
        if new_status not in ("pending", "in_progress", "completed"):
            return jsonify({"error": "Invalid status"}), 400
        updates["status"] = new_status
        if new_status == "completed":
            updates["completed_at"] = datetime.now().isoformat()
        else:
            updates["completed_at"] = None

    if updates:
        db.update("tasks", updates, "task_id = ?", (task_id,))

    updated = db.fetch_one(
        "SELECT t.*, u.full_name as assignee_name, m.full_name as assigner_name "
        "FROM tasks t JOIN users u ON t.assigned_to = u.user_id "
        "JOIN users m ON t.assigned_by = m.user_id WHERE t.task_id = ?",
        (task_id,)
    )
    return jsonify({"status": "updated", "task": updated})


@tasks_bp.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@manager_required
def delete_task(task_id):
    """Manager deletes a task."""
    from database.db_manager import db
    task = db.fetch_one("tasks", "task_id = ?", (task_id,))
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
    return jsonify({"status": "deleted", "task_id": task_id})


@tasks_bp.route("/api/tasks/stats")
@login_required
def task_stats():
    """Get task statistics for the current user."""
    from database.db_manager import db
    role = session.get("role")
    user_id = session.get("user_id")

    if role == "manager":
        total = db.count("tasks")
        pending = db.count("tasks", "status = 'pending'")
        in_progress = db.count("tasks", "status = 'in_progress'")
        completed = db.count("tasks", "status = 'completed'")
    else:
        total = db.count("tasks", "assigned_to = ?", (user_id,))
        pending = db.count("tasks", "assigned_to = ? AND status = 'pending'", (user_id,))
        in_progress = db.count("tasks", "assigned_to = ? AND status = 'in_progress'", (user_id,))
        completed = db.count("tasks", "assigned_to = ? AND status = 'completed'", (user_id,))

    return jsonify({
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
    })
