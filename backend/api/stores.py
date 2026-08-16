"""
Store endpoints — list available stores.
"""
from flask import Blueprint, jsonify
from config.settings import STORE_CONFIG

stores_bp = Blueprint("stores", __name__)


@stores_bp.route("/api/stores")
def list_stores():
    """Return the list of configured stores."""
    stores = []
    for store_id, cfg in STORE_CONFIG.items():
        stores.append({
            "store_id": store_id,
            "name": cfg["name"],
            "aisles": cfg["aisles"],
            "shelves_per_aisle": cfg["shelves_per_aisle"],
            "sections_per_shelf": cfg["sections_per_shelf"],
        })
    return jsonify(stores)
