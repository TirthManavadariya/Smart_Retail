"""
Forecast endpoints — Chart data, accuracy KPIs, replenishment table.
Extracts logic from dashboard/views/demand_forecast.py
"""
from flask import Blueprint, jsonify, request, send_file
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import io

forecast_bp = Blueprint("forecast", __name__)


@forecast_bp.route("/api/forecast/accuracy")
def forecast_accuracy():
    store_id = request.args.get("store_id", "STORE01")
    wmape, mae, rmse = _compute_forecast_metrics(store_id)
    return jsonify({"wmape": round(wmape, 1), "mae": round(mae, 1), "rmse": round(rmse, 1)})


@forecast_bp.route("/api/forecast/chart")
def forecast_chart():
    store_id = request.args.get("store_id", "STORE01")
    safety = int(request.args.get("safety", 15))
    horizon = request.args.get("horizon", "30D")
    freq = request.args.get("freq", "Daily")
    weather = request.args.get("weather", "true") == "true"
    holiday = request.args.get("holiday", "true") == "true"
    competitor = request.args.get("competitor", "false") == "true"

    horizon_map = {"7D": 7, "30D": 30, "90D": 90}
    horizon_days = horizon_map.get(horizon, 30)

    seed_val = 101 + safety + horizon_days
    np.random.seed(int(seed_val) % (2**31))
    today = datetime.now().date()
    hist_dates = pd.date_range(end=today - timedelta(days=1), periods=30, freq="D")
    fore_dates = pd.date_range(start=today, periods=horizon_days, freq="D")

    hist_values = (np.cumsum(np.random.randn(30) * 15 + 5) + 200).tolist()
    fore_base = (hist_values[-1] + np.cumsum(np.random.randn(horizon_days) * 10 + 8))
    if competitor:
        fore_base += np.random.randn(horizon_days) * 8
    band_scale = safety / 15.0
    fore_upper = (fore_base + np.random.uniform(20, 40, horizon_days) * band_scale).tolist()
    fore_lower = (fore_base - np.random.uniform(15, 30, horizon_days) * band_scale).tolist()
    fore_base = fore_base.tolist()

    return jsonify({
        "hist_dates": [d.strftime("%Y-%m-%d") for d in hist_dates],
        "hist_values": [round(v, 1) for v in hist_values],
        "fore_dates": [d.strftime("%Y-%m-%d") for d in fore_dates],
        "fore_base": [round(v, 1) for v in fore_base],
        "fore_upper": [round(v, 1) for v in fore_upper],
        "fore_lower": [round(v, 1) for v in fore_lower],
        "today": today.isoformat(),
        "horizon_days": horizon_days,
        "freq": freq,
    })


@forecast_bp.route("/api/forecast/replenishment")
def replenishment():
    items = [
        {"sku": "DRK-CL-500ML", "name": "Sparkling Water - Case of 12", "stock": 142,
         "stock_status": "Below Safety (250)", "stock_color": "#ffb4ab", "demand": 892,
         "min_max": "400 / 1200", "order": 1050, "has_action": True},
        {"sku": "SNK-CH-90G", "name": "Classic Sea Salt Chips", "stock": 580,
         "stock_status": "Healthy", "stock_color": "#6ee6ee", "demand": 320,
         "min_max": "200 / 800", "order": 0, "has_action": False},
        {"sku": "DAI-MK-2L", "name": "Whole Milk 2L Bottle", "stock": 85,
         "stock_status": "Expiring in 2D", "stock_color": "#cecb5b", "demand": 450,
         "min_max": "100 / 500", "order": 415, "has_action": True},
        {"sku": "CON-SU-1KG", "name": "Granulated Sugar 1kg", "stock": 1200,
         "stock_status": "Overstock", "stock_color": "#bcc9ca", "demand": 45,
         "min_max": "200 / 600", "order": 0, "has_action": False},
    ]
    return jsonify(items)


@forecast_bp.route("/api/forecast/export-csv")
def export_csv():
    items = [
        {"sku": "DRK-CL-500ML", "name": "Sparkling Water", "stock": 142, "demand": 892, "order": 1050},
        {"sku": "SNK-CH-90G", "name": "Sea Salt Chips", "stock": 580, "demand": 320, "order": 0},
        {"sku": "DAI-MK-2L", "name": "Whole Milk 2L", "stock": 85, "demand": 450, "order": 415},
        {"sku": "CON-SU-1KG", "name": "Granulated Sugar", "stock": 1200, "demand": 45, "order": 0},
    ]
    df = pd.DataFrame(items)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return send_file(buf, mimetype="text/csv", as_attachment=True,
                     download_name="replenishment_recommendations.csv")


def _compute_forecast_metrics(store_id):
    try:
        from database.db_manager import db
        rows = db.execute(
            "SELECT yhat, actual FROM forecasts WHERE store_id = ? AND actual IS NOT NULL AND actual > 0 LIMIT 500",
            (store_id,))
        if rows and len(rows) >= 10:
            actuals = np.array([r["actual"] for r in rows])
            preds = np.array([r["yhat"] for r in rows])
            abs_err = np.abs(actuals - preds)
            return (float(np.sum(abs_err) / np.sum(actuals) * 100),
                    float(np.mean(abs_err)), float(np.sqrt(np.mean((actuals - preds) ** 2))))
    except Exception:
        pass
    np.random.seed(hash(store_id + "wmape") % 2**31)
    wmape = float(np.random.uniform(15, 28))
    mae = float(np.random.uniform(8, 20))
    rmse = mae * float(np.random.uniform(1.2, 1.6))
    return wmape, mae, rmse
