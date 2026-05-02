"""
Central configuration for Smart Retail Shelf Intelligence System.
Relocated to backend/core/config/settings.py
"""
import os
from pathlib import Path

# ─── Base Paths ───────────────────────────────────────────────
# This file lives at: backend/core/config/settings.py
# .parent       = backend/core/config/
# .parent.parent = backend/core/
# .parent.parent.parent = backend/    ← BACKEND_DIR (our root)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

# All data assets live under backend/core/
CORE_DIR  = BACKEND_DIR / "core"
DATA_DIR  = CORE_DIR / "data"
MODELS_DIR = CORE_DIR / "models"
WEIGHTS_DIR = MODELS_DIR / "weights"
SAMPLE_IMAGES_DIR = DATA_DIR / "sample_images"
PLANOGRAM_DIR     = DATA_DIR / "sample_planograms"
POS_DATA_DIR      = DATA_DIR / "pos_data"
DB_DIR            = CORE_DIR / "database"

# Create directories if they don't exist
for d in [DATA_DIR, WEIGHTS_DIR, SAMPLE_IMAGES_DIR, PLANOGRAM_DIR, POS_DATA_DIR, DB_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── Database ─────────────────────────────────────────────────
DATABASE_PATH = DB_DIR / "retail_shelf.db"

# ─── Redis ────────────────────────────────────────────────────
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_AVAILABLE = False  # Will be set dynamically

# ─── Computer Vision ─────────────────────────────────────────
_CUSTOM_WEIGHTS = WEIGHTS_DIR / "shelfiq_best.pt"
YOLO_MODEL = os.getenv(
    "YOLO_MODEL",
    str(_CUSTOM_WEIGHTS) if _CUSTOM_WEIGHTS.exists() else "yolov8n.pt"
)
YOLO_COCO_MODEL = os.getenv("YOLO_COCO_MODEL", "yolov8n.pt")
DETECTION_CONFIDENCE = 0.35
DETECTION_IOU_THRESHOLD = 0.45
IMAGE_SIZE = 640

# ─── Stock Level Thresholds ──────────────────────────────────
STOCK_FULL_THRESHOLD = 0.7
STOCK_LOW_THRESHOLD  = 0.3

# ─── Forecasting ─────────────────────────────────────────────
FORECAST_HORIZON_DAYS = 30
LEAD_TIME_DAYS = 3
SERVICE_LEVEL = 0.95
Z_SCORE_95 = 1.645
SEASONALITY_MODE = "multiplicative"

# ─── Alerts ───────────────────────────────────────────────────
ALERT_COOLDOWN_MINUTES = 30
ALERT_CHANNELS = ["dashboard", "email"]
STOCKOUT_SEVERITY = 5
LOW_STOCK_SEVERITY = 3
PLANOGRAM_VIOLATION_SEVERITY = 2
PRICE_MISMATCH_SEVERITY = 1

# ─── Email ────────────────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
ALERT_EMAIL_RECIPIENTS = os.getenv("ALERT_EMAIL_RECIPIENTS", "").split(",")

# ─── Store Layout ─────────────────────────────────────────────
STORE_CONFIG = {
    "STORE01": {"name": "Mumbai Flagship Store",           "aisles": 6, "shelves_per_aisle": 4, "sections_per_shelf": 5},
    "STORE02": {"name": "Ahmedabad CG Road Outlet",        "aisles": 4, "shelves_per_aisle": 3, "sections_per_shelf": 4},
    "STORE03": {"name": "Delhi Connaught Place Superstore", "aisles": 8, "shelves_per_aisle": 5, "sections_per_shelf": 6},
}

# ─── Product Catalog ─────────────────────────────────────────
CATEGORIES = [
    "Beverages", "Snacks", "Dairy", "Bakery", "Canned Goods",
    "Frozen Foods", "Personal Care", "Household", "Condiments", "Cereals"
]
NUM_SKUS = 50
NUM_STORES = 3
POS_HISTORY_DAYS = 730

# ─── Shelf Optimizer ─────────────────────────────────────────
OPTIMIZER_OUTPUT_DIR = DATA_DIR / "optimized_planograms"
OPTIMIZER_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
EYE_LEVEL_SHELVES: list[int] = [2, 3]
TOP_PERFORMER_PERCENTILE: float = 0.80
ENGAGEMENT_DATA_PATH = POS_DATA_DIR / "customer_engagement.csv"
SCORE_WEIGHT_VELOCITY: float = 0.40
SCORE_WEIGHT_PROFIT: float = 0.35
SCORE_WEIGHT_ENGAGEMENT: float = 0.25
SHELF_VISIBILITY_MULTIPLIER: dict[int, float] = {
    1: 0.7, 2: 1.3, 3: 1.5, 4: 1.0, 5: 0.8,
}
