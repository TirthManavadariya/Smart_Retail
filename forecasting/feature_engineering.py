"""
Feature engineering for demand forecasting.
Merges POS data with weather, promotions, events, and calendar features.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
from config.settings import POS_DATA_DIR


def load_pos_data() -> pd.DataFrame:
    """Load POS transaction data."""
    path = POS_DATA_DIR / "pos_transactions.csv"
    if path.exists():
        df = pd.read_csv(path, parse_dates=["date"])
        return df
    return pd.DataFrame()


def load_weather_data() -> pd.DataFrame:
    """Load weather and event data."""
    path = POS_DATA_DIR / "weather_data.csv"
    if path.exists():
        df = pd.read_csv(path, parse_dates=["date"])
        return df
    return pd.DataFrame()


def engineer_features(pos_df: pd.DataFrame, weather_df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features for demand forecasting.

    Adds calendar features, lag features, rolling stats, and weather data.
    """
    if pos_df.empty:
        return pos_df

    df = pos_df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    # ── Collapse to ONE row per (store, sku, day) BEFORE lagging ──────────
    # POS data has many transactions per SKU per day. If we lag/roll over the
    # raw rows, shift(1) means "previous transaction", not "yesterday". Daily
    # aggregation first makes shift(n)/rolling(n) mean n calendar days.
    agg: dict = {"quantity_sold": "sum"}
    if "revenue" in df.columns:
        agg["revenue"] = "sum"
    if "unit_price" in df.columns:
        agg["unit_price"] = "mean"
    if "promotion_flag" in df.columns:
        agg["promotion_flag"] = "max"
    for col in ["product_name", "category"]:
        if col in df.columns:
            agg[col] = "first"
    daily = df.groupby(["store_id", "sku_id", "date"], as_index=False).agg(agg)

    # ── Reindex each series to a gap-free daily range ────────────────────
    # Missing days become explicit zero-demand days so lag_7 truly is "7 days
    # ago" even when the store had no sale on some intervening day.
    frames = []
    for (store_id, sku_id), grp in daily.groupby(["store_id", "sku_id"], sort=False):
        grp = grp.set_index("date").sort_index()
        full_range = pd.date_range(grp.index.min(), grp.index.max(), freq="D")
        grp = grp.reindex(full_range)
        grp["store_id"] = store_id
        grp["sku_id"] = sku_id
        grp["quantity_sold"] = grp["quantity_sold"].fillna(0)
        if "revenue" in grp.columns:
            grp["revenue"] = grp["revenue"].fillna(0)
        if "promotion_flag" in grp.columns:
            grp["promotion_flag"] = grp["promotion_flag"].fillna(0)
        if "unit_price" in grp.columns:
            grp["unit_price"] = grp["unit_price"].ffill().bfill()
        for col in ["product_name", "category"]:
            if col in grp.columns:
                grp[col] = grp[col].ffill().bfill()
        frames.append(grp.rename_axis("date").reset_index())
    df = pd.concat(frames, ignore_index=True)
    df = df.sort_values(["store_id", "sku_id", "date"]).reset_index(drop=True)

    # Calendar features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_month"] = df["date"].dt.day
    df["month"] = df["date"].dt.month
    df["quarter"] = df["date"].dt.quarter
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["is_month_start"] = df["date"].dt.is_month_start.astype(int)
    df["is_month_end"] = df["date"].dt.is_month_end.astype(int)
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)

    # Lag features (per SKU per store) — now shift by calendar day
    grouped = df.groupby(["store_id", "sku_id"])["quantity_sold"]
    for lag in [1, 7, 14, 28]:
        df[f"lag_{lag}"] = grouped.shift(lag)

    # Rolling statistics — windows now count days, not transaction rows
    for window in [7, 14, 30]:
        df[f"rolling_mean_{window}"] = (
            df.groupby(["store_id", "sku_id"])["quantity_sold"]
            .transform(lambda x: x.rolling(window, min_periods=1).mean())
        )
        df[f"rolling_std_{window}"] = (
            df.groupby(["store_id", "sku_id"])["quantity_sold"]
            .transform(lambda x: x.rolling(window, min_periods=2).std())
        )

    # Merge weather data
    if not weather_df.empty:
        weather_df["date"] = pd.to_datetime(weather_df["date"])
        weather_cols = [
            "date", "store_id", "temperature_c", "precipitation_mm",
            "humidity_pct", "is_holiday",
        ]
        # Include event columns if present (CHANGE 7)
        for ecol in ["is_local_event", "event_type", "event_magnitude"]:
            if ecol in weather_df.columns:
                weather_cols.append(ecol)
        weather_subset = weather_df[weather_cols].drop_duplicates(subset=["date", "store_id"])
        df = df.merge(weather_subset, on=["date", "store_id"], how="left")

        # One-hot encode event_type for use as regressors (CHANGE 7)
        if "event_type" in df.columns:
            event_dummies = pd.get_dummies(df["event_type"], prefix="evt").astype(int)
            df = pd.concat([df, event_dummies], axis=1)

    # Fill NaN values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)

    return df


def prepare_prophet_data(df: pd.DataFrame, sku_id: str, store_id: str) -> pd.DataFrame:
    """
    Prepare data in Prophet format (ds, y + regressors) for a specific SKU and store.
    """
    mask = (df["sku_id"] == sku_id) & (df["store_id"] == store_id)
    subset = df[mask].copy()

    if subset.empty or "quantity_sold" not in subset.columns:
        return pd.DataFrame(columns=["ds", "y"])

    # Aggregate daily — only include promotion_flag if the column exists.
    agg_map = {"quantity_sold": "sum"}
    has_promo = "promotion_flag" in subset.columns
    if has_promo:
        agg_map["promotion_flag"] = "max"
    daily = subset.groupby("date").agg(agg_map).reset_index()
    daily.columns = ["ds", "y", "promotion"] if has_promo else ["ds", "y"]
    if not has_promo:
        daily["promotion"] = 0

    # Add regressors if available
    if "temperature_c" in subset.columns:
        temp = subset.groupby("date")["temperature_c"].first().reset_index()
        temp.columns = ["ds", "temperature"]
        daily = daily.merge(temp, on="ds", how="left")
        daily["temperature"] = daily["temperature"].fillna(daily["temperature"].median())

    if "is_holiday" in subset.columns:
        hol = subset.groupby("date")["is_holiday"].max().reset_index()
        hol.columns = ["ds", "holiday_flag"]
        daily = daily.merge(hol, on="ds", how="left")
        daily["holiday_flag"] = daily["holiday_flag"].fillna(0)

    # Event regressors (CHANGE 7)
    if "is_local_event" in subset.columns:
        evt = subset.groupby("date")["is_local_event"].max().reset_index()
        evt.columns = ["ds", "is_local_event"]
        daily = daily.merge(evt, on="ds", how="left")
        daily["is_local_event"] = daily["is_local_event"].fillna(0)

    if "event_magnitude" in subset.columns:
        mag = subset.groupby("date")["event_magnitude"].max().reset_index()
        mag.columns = ["ds", "event_magnitude"]
        daily = daily.merge(mag, on="ds", how="left")
        daily["event_magnitude"] = daily["event_magnitude"].fillna(0)

    return daily.sort_values("ds").reset_index(drop=True)


if __name__ == "__main__":
    print("Testing feature engineering...")
    pos_df = load_pos_data()
    weather_df = load_weather_data()

    if not pos_df.empty:
        featured = engineer_features(pos_df, weather_df)
        print(f"  ✓ Features: {featured.shape[1]} columns, {len(featured):,} rows")
        print(f"  Columns: {list(featured.columns)}")

        prophet_data = prepare_prophet_data(featured, "SKU001", "STORE01")
        print(f"  ✓ Prophet data for SKU001/STORE01: {len(prophet_data)} rows")
    else:
        print("  ⚠ No POS data found. Run seed_data.py first.")
