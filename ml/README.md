# HarvestHub Machine Learning Pipeline (Review 3 Final)

This directory contains the machine learning regression pipeline for agricultural commodity price forecasting on the HarvestHub platform.

---

## 1. Dataset & Calibration Provenance
* **Dataset Generator:** `ml/prepare_dataset.py` creates `ml/data/2026.csv`.
* **Provenance Disclosure:** The dataset is **synthetically generated using domain-calibrated mathematical models** modeled after official **AGMARKNET** (Agricultural Marketing Information Network, Ministry of Agriculture & Farmers Welfare, Government of India) daily wholesale mandi reporting distributions.
* **Volume:** 16,380 raw records spanning January 1, 2025 to June 30, 2026 (546 consecutive days). Post-lag warmup yield: **15,480 valid rows** (12,360 train / 3,120 test).
* **Commodities:** Onion, Potato, Tomato, Wheat, Rice across 6 regional wholesale mandis (Pune, Nashik, Lasalgaon, Mumbai, Azadpur, Bangalore).
* **Storage Policy:** `ml/data/*.csv` and binary `ml/artifacts/*.joblib` are excluded from Git version control via `.gitignore` to preserve repository lightweightness. All evaluation metrics and plots are tracked in `ml/artifacts/`.

---

## 2. Feature Engineering & Target Leakage Prevention
* **Temporal Cyclicality:** `Month`, `DayOfWeek`, `Quarter`.
* **Spatial & Categorical:** One-Hot Encoded `State`, `Market`, `Commodity`.
* **Autoregressive Lags:** `Lag_1`, `Lag_7`, `Lag_30` using strict `.shift(1)` backward values.
* **Rolling Moving Averages:** `RollMean_7`, `RollMean_30` calculated strictly on lagged observations.
* **Zero Target Leakage:** Every feature for date $t$ relies exclusively on data from dates $\le t-1$.

---

## 3. Train / Test Splitting Strategy
* **Split Type:** Strict chronological temporal split (80/20).
* **Split Date:** `2026-03-19`.
* **Training Partition:** 12,360 rows (2025-01-31 to 2026-03-18).
* **Testing Partition:** 3,120 rows (2026-03-19 to 2026-06-30).
* **Overlap:** Zero date overlap between training and testing sets (`max(train_date) < min(test_date)`).

---

## 4. Model Benchmarking & Performance Metrics

| Model / Baseline Heuristic | MAE (INR/Q) | RMSE (INR/Q) | $R^2$ Score | MAPE (%) |
|:---|:---:|:---:|:---:|:---:|
| Commodity Mean Baseline | 376.10 | 500.29 | 0.6223 | 21.18% |
| Naive Lag-1 Persistent | 118.43 | 170.95 | 0.9559 | 6.31% |
| 7-Day Rolling Mean Baseline | 100.43 | 148.36 | 0.9668 | 5.32% |
| Linear Regression (OLS) | 97.57 | 143.65 | 0.9689 | 5.20% |
| Gradient Boosting Regressor | 97.41 | 142.59 | 0.9693 | 5.21% |
| **Random Forest Regressor (Best)** | **96.80** | **140.46** | **0.9702** | **5.13%** |

* **Selected Production Model:** `RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42)`
* **Improvement:** **3.61% lower MAE** compared to 7-day rolling mean heuristic.

---

## 5. Local Setup & Reproduction Instructions

```bash
# 1. Navigate to ML directory
cd ml

# 2. Create virtual environment & install dependencies
python3 -m venv venv312
source venv312/bin/activate
pip install -r requirements.txt

# 3. Ingest and generate the calibrated AGMARKNET dataset
python prepare_dataset.py

# 4. Train models, evaluate benchmarks, and export plots
python train.py

# 5. Run the automated Pytest ML test suite
pytest tests/ -v

# 6. Launch the FastAPI live inference microservice
python serve.py
# Interactive API documentation: http://localhost:8000/docs
```
