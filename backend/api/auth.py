"""
Auth endpoints — login, logout, current user.
Uses Flask session for auth state.
"""
from flask import Blueprint, jsonify, request, session
from functools import wraps

auth_bp = Blueprint("auth", __name__)


def login_required(f):
    """Decorator: require a logged-in user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated


def manager_required(f):
    """Decorator: require a logged-in manager."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required"}), 401
        if session.get("role") != "manager":
            return jsonify({"error": "Manager access required"}), 403
        return f(*args, **kwargs)
    return decorated


@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    from database.db_manager import db
    user = db.fetch_one("users", "username = ? AND is_active = 1", (username,))

    if not user or user["password"] != password:
        return jsonify({"error": "Invalid username or password"}), 401

    session["user_id"] = user["user_id"]
    session["username"] = user["username"]
    session["role"] = user["role"]
    session["full_name"] = user["full_name"]

    return jsonify({
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
            "full_name": user["full_name"],
            "email": user["email"],
        }
    })


@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "logged_out"})


@auth_bp.route("/api/auth/me")
def me():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify({
        "user": {
            "user_id": session["user_id"],
            "username": session["username"],
            "role": session["role"],
            "full_name": session["full_name"],
        }
    })
