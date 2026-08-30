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
    # Tolerate malformed/non-integer values instead of raising a 500.
    try:
        safety = int(float(request.args.get("safety", 15)))
    except (TypeError, ValueError):
        safety = 15
    safety = max(0, min(safety, 100))
    horizon = request.args.get("horizon", "30D")
    competitor = request.args.get("competitor", "false") == "true"

    horizon_map = {"7D": 7, "30D": 30, "90D": 90}
    horizon_days = horizon_map.get(horizon, 30)

    # ── Aggregation interval ─────────────────────────────────────────────
    # Accept either ?freq=Daily|Weekly|Monthly or ?aggregation=daily|weekly|monthly.
    freq_key = (request.args.get("aggregation") or request.args.get("freq") or "Daily").lower()
    # rule = pandas resample rule, step_days = period length, hist = periods shown
    agg_cfg = {
        "daily":   ("D",   1,  30),
        "weekly":  ("W",   7,  26),
        "monthly": ("MS", 30,  12),
    }
    rule, step_days, hist_periods = agg_cfg.get(freq_key, agg_cfg["daily"])
    freq_label = {"daily": "Daily", "weekly": "Weekly", "monthly": "Monthly"}.get(freq_key, "Daily")
    fore_periods = max(1, round(horizon_days / step_days))

    today = datetime.now().date()

    # ── History: resample real POS demand by the chosen interval ─────────
    series = _load_demand_series(store_id, rule)
    if series is not None and len(series) >= 3:
        series = series[series.index <= pd.Timestamp(today)]
        hist = series.tail(hist_periods)
        hist_dates = list(hist.index)
        hist_values = [float(v) for v in hist.values]
    else:
        # Synthetic fallback generated at the correct cadence.
        np.random.seed((101 + safety + horizon_days) % (2**31))
        hist_dates = list(pd.date_range(end=pd.Timestamp(today), periods=hist_periods, freq=rule))
        base = {"D": 200, "W": 1400, "MS": 6000}[rule]
        scale = {"D": 15, "W": 80, "MS": 300}[rule]
        hist_values = (np.cumsum(np.random.randn(hist_periods) * scale) + base).clip(min=base * 0.3).tolist()

    # ── Forecast: extend the recent trend at the same cadence ────────────
    np.random.seed((7 + safety + horizon_days + len(hist_values)) % (2**31))
    hv = np.array(hist_values, dtype=float)
    last = float(hv[-1])
    window = hv[-min(len(hv), 8):]
    slope = float(np.polyfit(range(len(window)), window, 1)[0]) if len(window) >= 2 else 0.0
    steps = np.arange(1, fore_periods + 1)
    noise = np.random.randn(fore_periods) * (float(np.std(hv)) * 0.15 + 1.0)
    fore_base = last + slope * steps + noise
    if competitor:
        fore_base = fore_base + np.random.randn(fore_periods) * (float(np.std(hv)) * 0.1 + 1.0)
    fore_base = np.clip(fore_base, max(0.0, last * 0.2), None)

    # Confidence band widens with the safety-stock setting.
    band = (float(np.std(hv)) * 0.5 + last * 0.05) * (0.5 + safety / 15.0)
    fore_upper = fore_base + band
    fore_lower = np.clip(fore_base - band, 0, None)

    # Forecast dates continue one step past the last history point.
    fore_dates = list(pd.date_range(start=hist_dates[-1], periods=fore_periods + 1, freq=rule))[1:]
    today_marker = fore_dates[0].strftime("%Y-%m-%d") if fore_dates else today.isoformat()

    return jsonify({
        "hist_dates": [d.strftime("%Y-%m-%d") for d in hist_dates],
        "hist_values": [round(float(v), 1) for v in hist_values],
        "fore_dates": [d.strftime("%Y-%m-%d") for d in fore_dates],
        "fore_base": [round(float(v), 1) for v in fore_base],
        "fore_upper": [round(float(v), 1) for v in fore_upper],
        "fore_lower": [round(float(v), 1) for v in fore_lower],
        "today": today_marker,
        "horizon_days": horizon_days,
        "freq": freq_label,
    })


def _load_demand_series(store_id, rule):
    """
    Return a demand time series (summed quantity_sold) for a store, resampled
    by the given pandas rule ('D'/'W'/'MS'). Returns None when no data so the
    caller can fall back to a synthetic series.
    """
    try:
        from database.db_manager import db
        rows = db.execute(
            "SELECT date, SUM(quantity_sold) AS q FROM pos_transactions "
            "WHERE store_id = ? GROUP BY date ORDER BY date",
            (store_id,),
        )
        if not rows:
            return None
        df = pd.DataFrame(rows)
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"])
        if df.empty:
            return None
        series = df.set_index("date")["q"].astype(float).resample(rule).sum()
        return series[series > 0] if (series > 0).any() else series
    except Exception:
        return None


@forecast_bp.route("/api/forecast/replenishment")
def replenishment():
    items = [
        {"sku": "DRK-CL-500ML", "name": "Sparkling Water - Case of 12", "stock": 142,
         "stock_status": "Below Safety (250)", "stock_color": "#dc2626", "demand": 892,
         "min_max": "400 / 1200", "order": 1050, "has_action": True},
        {"sku": "SNK-CH-90G", "name": "Classic Sea Salt Chips", "stock": 580,
         "stock_status": "Healthy", "stock_color": "#16a34a", "demand": 320,
         "min_max": "200 / 800", "order": 0, "has_action": False},
        {"sku": "DAI-MK-2L", "name": "Whole Milk 2L Bottle", "stock": 85,
         "stock_status": "Expiring in 2D", "stock_color": "#d97706", "demand": 450,
         "min_max": "100 / 500", "order": 415, "has_action": True},
        {"sku": "CON-SU-1KG", "name": "Granulated Sugar 1kg", "stock": 1200,
         "stock_status": "Overstock", "stock_color": "#64748b", "demand": 45,
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
