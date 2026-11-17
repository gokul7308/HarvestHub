# HarvestHub – Machine Learning Evaluation Summary

**Milestone:** Review 3 Final Evaluation Evidence  
**Model Name:** HarvestHub Agricultural Price Predictor (Random Forest Regressor v3.0)  
**Dataset:** AGMARKNET Daily Mandi Wholesale Price Series (January 2025 to June 2026)  
**Total Records:** 15,480 post-warmup records across 5 commodities and 6 wholesale mandis  

---

## 1. Metric Evaluation Table

| Model / Baseline | MAE (INR/Q) | RMSE (INR/Q) | $R^2$ Score | MAPE (%) | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Baseline 2: Commodity Mean** | 376.10 | 500.29 | 0.6223 | 21.18% | Static crop average computed on train set |
| **Baseline 1: Lag-1 Price** | 118.43 | 170.95 | 0.9559 | 6.31% | Yesterday's known modal market price |
| **Baseline 3: 7-Day Moving Avg** | 100.43 | 148.36 | 0.9668 | 5.32% | Trailing weekly average modal price |
| **Linear Regression** | 97.57 | 143.65 | 0.9689 | 5.20% | Ordinary least squares baseline |
| **Gradient Boosting Regressor** | 97.41 | 142.59 | 0.9693 | 5.21% | Sequential boosting ensemble |
| **Random Forest Regressor** | **96.80** | **140.46** | **0.9702** | **5.13%** | **SELECTED BEST MODEL (v3.0.0)** |

---

## 2. Key Findings & Performance Highlights

1. **Beating the Strongest Baseline:** The selected Random Forest Regressor beat the best moving average baseline by **3.61% MAE reduction** and persisting persistence model by **18.26%**.
2. **High Explanatory Power:** An $R^2$ of **0.9702** demonstrates that 97.02% of real price fluctuations across diverse wholesale markets are captured by the engineered feature set.
3. **Temporal Generalization:** Tested on 3,120 completely unobserved chronological days (March 19, 2026 to June 30, 2026) without data leakage.
4. **Primary Feature Drivers:** Gini importance rankings demonstrate that `Lag_1`, `RollMean_7`, and `Commodity` are the three most critical predictive drivers, followed by seasonal `Month` and `Lag_30`.

---

## 3. Evaluation Artifact References

* **Actual vs Predicted Plot:** `evaluation/ai/actual_vs_predicted.png`
* **Residuals Distribution:** `evaluation/ai/residuals_distribution.png`
* **Model Comparison:** `evaluation/ai/model_comparison.png`
* **Feature Importance:** `evaluation/ai/feature_importance.png`
* **Machine-Readable Metrics:** `evaluation/ai/model-metrics.json`

