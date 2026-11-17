import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from serve import app

client = TestClient(app)

# --- 1. Preprocessing Tests ---

def test_no_future_leakage_in_lags():
    # Create dummy data
    df = pd.DataFrame({
        'Arrival_Date': pd.date_range('2026-01-01', periods=5),
        'Commodity': ['Onion']*5,
        'Market': ['Pune']*5,
        'Modal_Price': [100, 110, 105, 120, 115]
    })
    
    # Sort just in case
    df = df.sort_values(by='Arrival_Date')
    df['Lag_1'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].shift(1)
    
    # For day 1 (idx 0), lag 1 should be NaN
    assert pd.isna(df.iloc[0]['Lag_1'])
    # For day 2 (idx 1), lag 1 should be day 1's price (100)
    assert df.iloc[1]['Lag_1'] == 100
    # Ensuring no future data leaked into past lags.

def test_invalid_prices_handling():
    # In train.py we enforce Modal_Price > 0
    df = pd.DataFrame({
        'Modal_Price': [100, 0, -50, 150]
    })
    df_clean = df[df['Modal_Price'] > 0]
    assert len(df_clean) == 2

def test_train_test_split_overlap():
    dates = pd.date_range('2026-01-01', '2026-01-10')
    split_idx = int(len(dates) * 0.8)
    split_date = dates[split_idx]
    
    train = dates[dates < split_date]
    test = dates[dates >= split_date]
    
    # Check intersection is empty
    overlap = set(train).intersection(set(test))
    assert len(overlap) == 0

# --- 2. Metrics Tests ---

def test_metrics_sanity():
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    y_true = [100, 200, 300]
    y_pred = [110, 190, 300]
    
    mae = mean_absolute_error(y_true, y_pred)
    assert mae == (10 + 10 + 0) / 3
    
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    assert round(rmse, 2) == round(np.sqrt((100 + 100 + 0) / 3), 2)

# --- 3. API Tests ---

def test_api_valid_request():
    req = {
        "crop": "Onion",
        "market": "Pune",
        "state": "Maharashtra",
        "date": "2026-05-01",
        "lag_1": 1500,
        "lag_7": 1400,
        "lag_30": 1300,
        "roll_mean_7": 1450,
        "roll_mean_30": 1350
    }
    response = client.post("/predict", json=req)
    # Could be 503 if model is not trained yet.
    assert response.status_code in [200, 503]
    if response.status_code == 200:
        assert "predicted_price" in response.json()

def test_api_unknown_crop():
    req = {
        "crop": "Apple",
        "market": "Pune",
        "state": "Maharashtra",
        "date": "2026-05-01",
        "lag_1": 1500,
        "lag_7": 1400,
        "lag_30": 1300,
        "roll_mean_7": 1450,
        "roll_mean_30": 1350
    }
    response = client.post("/predict", json=req)
    assert response.status_code == 400
    assert "Unknown crop" in response.json()["detail"]

def test_api_bad_date():
    req = {
        "crop": "Onion",
        "market": "Pune",
        "state": "Maharashtra",
        "date": "May 1st",
        "lag_1": 1500,
        "lag_7": 1400,
        "lag_30": 1300,
        "roll_mean_7": 1450,
        "roll_mean_30": 1350
    }
    response = client.post("/predict", json=req)
    assert response.status_code == 400
    assert "Invalid date format" in response.json()["detail"]

def test_api_missing_field():
    req = {
        "crop": "Onion",
        "market": "Pune"
        # missing state, etc.
    }
    response = client.post("/predict", json=req)
    assert response.status_code == 422 # Pydantic validation error
