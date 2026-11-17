import pandas as pd
import numpy as np
import json
import os
import joblib
import matplotlib.pyplot as plt
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit, RandomizedSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error

def evaluate(y_true, y_pred, name):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    print(f"--- {name} ---")
    print(f"MAE: {mae:.2f} | RMSE: {rmse:.2f} | R2: {r2:.4f} | MAPE: {mape:.2f}%")
    return {
        "MAE": round(float(mae), 2),
        "RMSE": round(float(rmse), 2),
        "R2": round(float(r2), 4),
        "MAPE": round(float(mape), 2)
    }

def main():
    os.makedirs('artifacts', exist_ok=True)
    os.makedirs('../ai/evaluation', exist_ok=True)
    os.makedirs('../evaluation/ai', exist_ok=True)
    
    # 1. Validate & Load
    data_path = 'data/2026.csv'
    if not os.path.exists(data_path):
        from prepare_dataset import generate_agmarknet_dataset
        generate_agmarknet_dataset(data_path)
        
    df = pd.read_csv(data_path)
    required_cols = ['Arrival_Date', 'State', 'Market', 'Commodity', 'Modal_Price']
    for c in required_cols:
        assert c in df.columns, f"Missing required column: {c}"
    
    df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'], dayfirst=True, errors='coerce')
    df = df.dropna(subset=['Arrival_Date'])
    
    df['Modal_Price'] = pd.to_numeric(df['Modal_Price'], errors='coerce')
    df = df[df['Modal_Price'] > 0]
    
    # 2. Clean & Deduplicate
    initial_rows = len(df)
    df = df.drop_duplicates()
    df = df.dropna(subset=['Modal_Price', 'State', 'Market', 'Commodity'])
    clean_rule_doc = f"Dropped missing targets/features and duplicates. Rows remaining: {len(df):,} (from {initial_rows:,})"
    
    # Filter target agricultural crops
    target_crops = ['Onion', 'Potato', 'Tomato', 'Wheat', 'Rice']
    df = df[df['Commodity'].isin(target_crops)]
    
    # Outlier clipping per commodity-market series (1st to 99th percentile)
    def clip_outliers(group):
        q1 = group['Modal_Price'].quantile(0.01)
        q99 = group['Modal_Price'].quantile(0.99)
        group['Modal_Price'] = group['Modal_Price'].clip(lower=q1, upper=q99)
        return group
    
    before_clip = df['Modal_Price'].copy()
    df = df.groupby(['Commodity', 'Market'], group_keys=False).apply(clip_outliers)
    clipped_rows = int((df['Modal_Price'] != before_clip).sum())
    outlier_rule_doc = f"Clipped prices to 1st-99th percentile within each Commodity+Market series. Affected rows: {clipped_rows}."
    
    # 3. Feature Engineering
    df = df.sort_values(by=['Commodity', 'Market', 'Arrival_Date'])
    
    df['Month'] = df['Arrival_Date'].dt.month
    df['DayOfWeek'] = df['Arrival_Date'].dt.dayofweek
    df['Quarter'] = df['Arrival_Date'].dt.quarter
    
    # Lag and Rolling features (strictly past values to prevent data leakage)
    df['Lag_1'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].shift(1)
    df['Lag_7'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].shift(7)
    df['Lag_30'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].shift(30)
    
    df['RollMean_7'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].transform(
        lambda x: x.shift(1).rolling(7, min_periods=1).mean()
    )
    df['RollMean_30'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].transform(
        lambda x: x.shift(1).rolling(30, min_periods=1).mean()
    )
    
    # Drop warm-up rows lacking sufficient lag history
    df = df.dropna(subset=['Lag_1', 'Lag_7', 'Lag_30', 'RollMean_7', 'RollMean_30'])
    
    # 4. Chronological Train/Test Split (Temporal Splitting)
    dates = df['Arrival_Date'].sort_values().unique()
    split_idx = int(len(dates) * 0.8)
    split_date = dates[split_idx]
    
    train_df = df[df['Arrival_Date'] < split_date].copy()
    test_df = df[df['Arrival_Date'] >= split_date].copy()
    
    print(f"\nChronological Split Date: {split_date.date()}")
    print(f"Training Set: {train_df['Arrival_Date'].min().date()} to {train_df['Arrival_Date'].max().date()} ({len(train_df):,} rows)")
    print(f"Testing Set:  {test_df['Arrival_Date'].min().date()} to {test_df['Arrival_Date'].max().date()} ({len(test_df):,} rows)\n")
    
    features = ['State', 'Market', 'Commodity', 'Month', 'DayOfWeek', 'Quarter', 'Lag_1', 'Lag_7', 'Lag_30', 'RollMean_7', 'RollMean_30']
    target = 'Modal_Price'
    
    X_train = train_df[features]
    y_train = train_df[target]
    X_test = test_df[features]
    y_test = test_df[target]
    
    # 5. Baselines
    # Baseline 1: Lag 1 (Last Known Market Price)
    b1_preds = test_df['Lag_1']
    res_b1 = evaluate(y_test, b1_preds, "Baseline 1: Lag-1 Last Known Price")
    
    # Baseline 2: Crop Historical Mean
    crop_means = train_df.groupby('Commodity')['Modal_Price'].mean()
    b2_preds = test_df['Commodity'].map(crop_means).fillna(train_df['Modal_Price'].mean())
    res_b2 = evaluate(y_test, b2_preds, "Baseline 2: Commodity Mean")
    
    # Baseline 3: 7-Day Moving Average
    b3_preds = test_df['RollMean_7']
    res_b3 = evaluate(y_test, b3_preds, "Baseline 3: 7-Day Moving Average")
    
    best_baseline_mae = min(res_b1['MAE'], res_b2['MAE'], res_b3['MAE'])
    best_baseline_rmse = min(res_b1['RMSE'], res_b2['RMSE'], res_b3['RMSE'])
    
    # 6. Candidate Regression Models
    categorical_features = ['State', 'Market', 'Commodity']
    numeric_features = ['Month', 'DayOfWeek', 'Quarter', 'Lag_1', 'Lag_7', 'Lag_30', 'RollMean_7', 'RollMean_30']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    candidate_models = {
        'LinearRegression': LinearRegression(),
        'RandomForest': RandomForestRegressor(random_state=42, n_jobs=-1),
        'GradientBoosting': GradientBoostingRegressor(random_state=42)
    }
    
    hyperparams = {
        'RandomForest': {'regressor__n_estimators': [50, 100], 'regressor__max_depth': [10, 20]},
        'GradientBoosting': {'regressor__n_estimators': [50, 100], 'regressor__learning_rate': [0.05, 0.1]}
    }
    
    results = {}
    best_rmse = float('inf')
    best_model_name = None
    best_model_pipeline = None
    best_preds = None
    
    tscv = TimeSeriesSplit(n_splits=3)
    
    for name, model in candidate_models.items():
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', model)])
        
        if name in hyperparams:
            search = RandomizedSearchCV(
                pipeline, 
                hyperparams[name], 
                cv=tscv, 
                scoring='neg_root_mean_squared_error', 
                n_iter=2, 
                random_state=42, 
                n_jobs=-1
            )
            search.fit(X_train, y_train)
            best_pipe = search.best_estimator_
        else:
            best_pipe = pipeline
            best_pipe.fit(X_train, y_train)
            
        preds = best_pipe.predict(X_test)
        res = evaluate(y_test, preds, f"Candidate Model: {name}")
        results[name] = res
        
        if res['RMSE'] < best_rmse:
            best_rmse = res['RMSE']
            best_model_name = name
            best_model_pipeline = best_pipe
            best_preds = preds
            
    print(f"\n==========================================")
    print(f"MODEL SELECTION RESULT: {best_model_name}")
    print(f"Selected RMSE: {best_rmse:.2f} (Baseline RMSE: {best_baseline_rmse:.2f})")
    print(f"Selected MAE:  {results[best_model_name]['MAE']:.2f} (Baseline MAE: {best_baseline_mae:.2f})")
    mae_improvement = ((best_baseline_mae - results[best_model_name]['MAE']) / best_baseline_mae) * 100
    print(f"MAE Improvement Over Best Baseline: {mae_improvement:.2f}%")
    print(f"==========================================\n")
    
    # 7. Metrics Consolidation & Export
    metrics = {
        "metadata": {
            "dataset": "AGMARKNET Daily Mandi Wholesale Price Series (2025-01-01 to 2026-06-30)",
            "commodities": target_crops,
            "markets": df['Market'].unique().tolist(),
            "total_records": len(df),
            "train_records": len(train_df),
            "test_records": len(test_df),
            "split_date": str(split_date.date()),
            "features": features
        },
        "baselines": {
            "lag_1_last_known": res_b1,
            "commodity_mean": res_b2,
            "rolling_7d_mean": res_b3
        },
        "models": results,
        "selection": {
            "best_model": best_model_name,
            "best_rmse": best_rmse,
            "best_mae": results[best_model_name]['MAE'],
            "best_r2": results[best_model_name]['R2'],
            "best_mape": results[best_model_name]['MAPE'],
            "baseline_best_rmse": best_baseline_rmse,
            "baseline_best_mae": best_baseline_mae,
            "mae_improvement_pct": round(mae_improvement, 2)
        }
    }
    
    # Save metrics JSON to all documented locations
    with open('results.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    with open('artifacts/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    with open('../ai/evaluation/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    with open('../evaluation/ai/model-metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    # Save Best Model Pipeline
    joblib.dump(best_model_pipeline, 'artifacts/model.joblib')
    print("Saved best model artifact to artifacts/model.joblib")
    
    # 8. Visualizations Generation
    # (a) Actual vs Predicted Plot
    plt.figure(figsize=(12, 6))
    sample_n = min(120, len(y_test))
    plt.plot(range(sample_n), y_test.values[:sample_n], label='Actual Mandi Price (INR/Q)', color='#1B5E20', linewidth=2, marker='o', markersize=4)
    plt.plot(range(sample_n), best_preds[:sample_n], label=f'Predicted ({best_model_name})', color='#2563EB', linewidth=2, linestyle='--', marker='x', markersize=4)
    plt.title(f'Actual vs Predicted Modal Prices ({best_model_name}) - First {sample_n} Test Days', fontsize=13, fontweight='bold')
    plt.xlabel('Test Sample Index (Chronological Order)', fontsize=11)
    plt.ylabel('Modal Price (INR / Quintal)', fontsize=11)
    plt.legend(frameon=True)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig('artifacts/actual_vs_predicted.png', dpi=200)
    plt.savefig('../evaluation/ai/actual_vs_predicted.png', dpi=200)
    plt.close()
    
    # (b) Residuals Distribution Plot
    residuals = y_test.values - best_preds
    plt.figure(figsize=(10, 5))
    plt.hist(residuals, bins=40, color='#059669', edgecolor='black', alpha=0.7)
    plt.axvline(0, color='red', linestyle='--', linewidth=1.5, label='Zero Error')
    plt.title(f'Residual Distribution ({best_model_name})', fontsize=13, fontweight='bold')
    plt.xlabel('Prediction Residual (Actual - Predicted) [INR]', fontsize=11)
    plt.ylabel('Frequency', fontsize=11)
    plt.legend()
    plt.grid(True, linestyle=':', alpha=0.5)
    plt.tight_layout()
    plt.savefig('artifacts/residuals_distribution.png', dpi=200)
    plt.savefig('../evaluation/ai/residuals_distribution.png', dpi=200)
    plt.close()
    
    # (c) Model Comparison Bar Chart
    plt.figure(figsize=(11, 5))
    model_names = ['Lag-1 Baseline', 'Crop Mean', 'Linear Reg', 'Random Forest', 'Gradient Boosting']
    rmse_values = [
        res_b1['RMSE'],
        res_b2['RMSE'],
        results['LinearRegression']['RMSE'],
        results['RandomForest']['RMSE'],
        results['GradientBoosting']['RMSE']
    ]
    colors = ['#94A3B8', '#CBD5E1', '#60A5FA', '#10B981', '#6366F1']
    bars = plt.bar(model_names, rmse_values, color=colors, width=0.55, edgecolor='black', alpha=0.85)
    plt.title('RMSE Comparison Across Baselines & Candidate Regressors', fontsize=13, fontweight='bold')
    plt.ylabel('RMSE (INR / Quintal) - Lower is Better', fontsize=11)
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + 10, f'{yval:.1f}', ha='center', va='bottom', fontweight='bold', fontsize=10)
    plt.grid(axis='y', linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig('artifacts/model_comparison.png', dpi=200)
    plt.savefig('../evaluation/ai/model_comparison.png', dpi=200)
    plt.close()
    
    # (d) Feature Importance Plot
    if best_model_name in ['RandomForest', 'GradientBoosting']:
        regressor = best_model_pipeline.named_steps['regressor']
        cat_encoder = best_model_pipeline.named_steps['preprocessor'].named_transformers_['cat']
        cat_features = cat_encoder.get_feature_names_out(categorical_features)
        all_feature_names = numeric_features + list(cat_features)
        
        importances = regressor.feature_importances_
        feat_series = pd.Series(importances, index=all_feature_names)
        
        plt.figure(figsize=(10, 6))
        feat_series.nlargest(10).sort_values(ascending=True).plot(kind='barh', color='#1B5E20', edgecolor='black', alpha=0.8)
        plt.title(f'Top 10 Feature Importances ({best_model_name})', fontsize=13, fontweight='bold')
        plt.xlabel('Gini Relative Importance Score', fontsize=11)
        plt.grid(axis='x', linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig('artifacts/feature_importance.png', dpi=200)
        plt.savefig('../evaluation/ai/feature_importance.png', dpi=200)
        plt.close()
        
    print("All evaluation plots generated successfully in artifacts/ and evaluation/ai/")

if __name__ == "__main__":
    main()
