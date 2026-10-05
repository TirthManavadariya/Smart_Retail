"""
ShelfIQ — Flask REST API Backend
Entry point: registers all API blueprints, enables CORS,
and serves the frontend static files.
"""
import sys
from pathlib import Path

# ── backend/ and project root paths ─────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
sys.path.insert(0, str(ROOT_DIR))             # root modules (models, config, forecasting, etc.)
sys.path.insert(0, str(BACKEND_DIR))          # api.* imports
sys.path.insert(0, str(BACKEND_DIR / "core")) # config.*, database.*, etc.

import json
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

# ── Import blueprints ────────────────────────────────────────────────
from api.stores import stores_bp
from api.overview import overview_bp
from api.monitoring import monitoring_bp
from api.detection import detection_bp
from api.forecast import forecast_bp
from api.alerts import alerts_bp
from api.optimizer import optimizer_bp
from api.analytics import analytics_bp
from api.auth import auth_bp
from api.staff import staff_bp
from api.tasks import tasks_bp


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    app.secret_key = "shelfiq-secret-key-change-in-production"
    # Permissive CORS for the web frontend. The React dev server (Vite, :5173)
    # and any other origin may call the API during development.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Best-effort startup seeding ──────────────────────────────────
    # Creates tables (idempotent) and seeds sample rows into any empty
    # auxiliary tables so DB-backed endpoints return real data. Wrapped so a
    # seeding hiccup can never stop the server from coming up.
    try:
        from database.seed_runtime import seed_if_empty
        seed_if_empty()
    except Exception as exc:  # pragma: no cover - defensive
        print(f"  [WARN] Startup seeding skipped: {exc}")

    # ── Register API blueprints ──────────────────────────────────────
    app.register_blueprint(stores_bp)
    app.register_blueprint(overview_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(detection_bp)
    app.register_blueprint(forecast_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(optimizer_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(tasks_bp)

    # ── Serve frontend static files ──────────────────────────────────
    # Prefer the built React app in web/dist. If it hasn't been built yet
    # (no `npm run build`), fall back to the legacy vanilla-JS frontend/ so
    # the server still comes up with a working UI.
    REACT_DIST = ROOT_DIR / "web" / "dist"
    LEGACY_FRONTEND = ROOT_DIR / "frontend"
    FRONTEND_DIR = REACT_DIST if (REACT_DIST / "index.html").exists() else LEGACY_FRONTEND
    app.config["FRONTEND_DIR"] = str(FRONTEND_DIR)

    @app.route("/")
    def serve_index():
        return send_from_directory(str(FRONTEND_DIR), "index.html")

    @app.route("/sample-images/<path:filename>")
    def serve_sample_images(filename):
        sample_file = (BACKEND_DIR.parent / "data" / "sample_images" / filename).resolve()
        if sample_file.exists() and sample_file.is_file():
            return send_from_directory(str(sample_file.parent), sample_file.name)
        return {"error": "Sample image not found"}, 404

    @app.route("/<path:path>")
    def serve_static(path):
        # Unmatched API routes must return JSON (never the SPA shell) so the
        # client gets a clean 404 instead of an HTML parse failure.
        if path.startswith("api/"):
            return jsonify({"error": f"No such endpoint: /{path}"}), 404
        file_path = FRONTEND_DIR / path
        if file_path.exists() and file_path.is_file():
            return send_from_directory(str(FRONTEND_DIR), path)
        return send_from_directory(str(FRONTEND_DIR), "index.html")

    # ── Consistent JSON envelope ─────────────────────────────────────
    # Every JSON response is normalized to { success, data, message } so the
    # frontend has a single contract to parse. File/HTML responses (PDF, CSV,
    # images, the SPA shell) are passed through untouched.
    @app.after_request
    def wrap_json(response):
        if response.mimetype != "application/json" or response.direct_passthrough:
            return response
        try:
            payload = response.get_json(silent=True)
        except Exception:
            return response
        # Never double-wrap an already-enveloped body.
        if isinstance(payload, dict) and "success" in payload and "data" in payload:
            return response

        if response.status_code >= 400:
            message, detail = "Request failed", None
            if isinstance(payload, dict):
                message = payload.get("error") or payload.get("message") or message
                detail = payload.get("traceback") or payload.get("detail")
            body = {"success": False, "data": None, "message": message}
            if detail:
                body["detail"] = detail
        else:
            body = {"success": True, "data": payload, "message": ""}

        response.set_data(json.dumps(body))
        response.mimetype = "application/json"
        return response

    # ── Global error handler ─────────────────────────────────────────
    @app.errorhandler(Exception)
    def handle_error(e):
        # HTTPExceptions (404, 405, 415, …) carry their own status code;
        # everything else is an unexpected 500.
        code = e.code if isinstance(e, HTTPException) else 500
        return jsonify({"error": str(e)}), code

    return app


if __name__ == "__main__":
    app = create_app()
    served = Path(app.config["FRONTEND_DIR"])
    which = "React build (web/dist)" if served.name == "dist" else "legacy frontend/"
    print("\n  >> ShelfIQ API running at http://localhost:5000")
    print(f"  >> Serving UI from: {which}\n")
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
