"""
Staff management endpoints — manager only.
CRUD operations for staff members, directly in the database.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
from .auth import manager_required

staff_bp = Blueprint("staff", __name__)


@staff_bp.route("/api/staff/list")
@manager_required
def list_staff():
    """List all staff members (excluding password hashes)."""
    from database.db_manager import db
    rows = db.execute(
        "SELECT user_id, username, role, full_name, email, phone, is_active, created_at "
        "FROM users WHERE role = 'staff' ORDER BY full_name"
    )
    return jsonify({"staff": rows})


@staff_bp.route("/api/staff/add", methods=["POST"])
@manager_required
def add_staff():
    """Add a new staff member."""
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()

    if not username or not password or not full_name:
        return jsonify({"error": "username, password, and full_name are required"}), 400

    from database.db_manager import db
    existing = db.fetch_one("users", "username = ?", (username,))
    if existing:
        return jsonify({"error": f"Username '{username}' already exists"}), 409

    user_id = db.insert("users", {
        "username": username,
        "password": password,
        "role": "staff",
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "is_active": 1,
    })

    return jsonify({
        "status": "created",
        "user": {
            "user_id": user_id,
            "username": username,
            "role": "staff",
            "full_name": full_name,
            "email": email,
            "phone": phone,
        }
    })


@staff_bp.route("/api/staff/<int:user_id>", methods=["PUT"])
@manager_required
def update_staff(user_id):
    """Update a staff member's details."""
    data = request.get_json(silent=True) or {}
    from database.db_manager import db

    existing = db.fetch_one("users", "user_id = ? AND role = 'staff'", (user_id,))
    if not existing:
        return jsonify({"error": "Staff member not found"}), 404

    updates = {}
    if "full_name" in data:
        updates["full_name"] = data["full_name"].strip()
    if "email" in data:
        updates["email"] = data["email"].strip()
    if "phone" in data:
        updates["phone"] = data["phone"].strip()
    if "password" in data and data["password"]:
        updates["password"] = data["password"]
    if "is_active" in data:
        updates["is_active"] = 1 if data["is_active"] else 0

    if updates:
        updates["updated_at"] = datetime.now().isoformat()
        db.update("users", updates, "user_id = ?", (user_id,))

    updated = db.fetch_one(
        "users", "user_id = ?", (user_id,)
    )
    return jsonify({
        "status": "updated",
        "user": {
            "user_id": updated["user_id"],
            "username": updated["username"],
            "role": updated["role"],
            "full_name": updated["full_name"],
            "email": updated["email"],
            "phone": updated["phone"],
            "is_active": updated["is_active"],
        }
    })


@staff_bp.route("/api/staff/<int:user_id>", methods=["DELETE"])
@manager_required
def delete_staff(user_id):
    """Delete (deactivate) a staff member."""
    from database.db_manager import db

    existing = db.fetch_one("users", "user_id = ? AND role = 'staff'", (user_id,))
    if not existing:
        return jsonify({"error": "Staff member not found"}), 404

    # Soft delete — deactivate instead of hard delete
    db.update("users", {"is_active": 0, "updated_at": datetime.now().isoformat()}, "user_id = ?", (user_id,))

    return jsonify({"status": "deactivated", "user_id": user_id})
