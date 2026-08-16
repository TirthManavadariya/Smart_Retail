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

from flask import Flask, send_from_directory
from flask_cors import CORS

# ── Import blueprints ────────────────────────────────────────────────
from api.stores import stores_bp
from api.overview import overview_bp
from api.monitoring import monitoring_bp
from api.detection import detection_bp
from api.forecast import forecast_bp
from api.alerts import alerts_bp
from api.optimizer import optimizer_bp
from api.analytics import analytics_bp


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    CORS(app)  # Allow all origins during development

    # ── Register API blueprints ──────────────────────────────────────
    app.register_blueprint(stores_bp)
    app.register_blueprint(overview_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(detection_bp)
    app.register_blueprint(forecast_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(optimizer_bp)
    app.register_blueprint(analytics_bp)

    # ── Serve frontend static files ──────────────────────────────────
    FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

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
        file_path = FRONTEND_DIR / path
        if file_path.exists() and file_path.is_file():
            return send_from_directory(str(FRONTEND_DIR), path)
        return send_from_directory(str(FRONTEND_DIR), "index.html")

    # ── Global error handler ─────────────────────────────────────────
    @app.errorhandler(Exception)
    def handle_error(e):
        return {"error": str(e)}, getattr(e, "code", 500)

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n  >> ShelfIQ API running at http://localhost:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
