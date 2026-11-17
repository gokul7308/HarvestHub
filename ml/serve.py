from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
from datetime import datetime
import os

app = FastAPI(title="HarvestHub ML Service", version="3.0.0")

# Load model artifact
model = None
model_path = os.path.join(os.path.dirname(__file__), 'artifacts', 'model.joblib')
if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
    except Exception as e:
        print(f"Failed to load model: {e}")
        model = None
else:
    # Fallback to local artifacts dir if run from ml/
    if os.path.exists('artifacts/model.joblib'):
        try:
            model = joblib.load('artifacts/model.joblib')
        except Exception:
            model = None

class PredictionRequest(BaseModel):
    crop: str
    market: str
    state: str
    date: str
    lag_1: float
    lag_7: float
    lag_30: float
    roll_mean_7: float
    roll_mean_30: float

SUPPORTED_CROPS = ["Onion", "Potato", "Tomato", "Wheat", "Rice"]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "supported_crops": SUPPORTED_CROPS
    }

@app.post("/predict")
def predict_price(req: PredictionRequest):
    # 1. Validate date format FIRST
    try:
        dt = datetime.strptime(req.date, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
        
    # 2. Validate crop compatibility SECOND
    if req.crop not in SUPPORTED_CROPS:
        raise HTTPException(status_code=400, detail=f"Unknown crop. Supported: {', '.join(SUPPORTED_CROPS[:3])}")
        
    # 3. Verify model availability THIRD
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded. Service temporarily unavailable.")
        
    # 4. Prepare features matching training pipeline
    features = pd.DataFrame([{
        'State': req.state,
        'Market': req.market,
        'Commodity': req.crop,
        'Month': dt.month,
        'DayOfWeek': dt.weekday(),
        'Quarter': (dt.month - 1) // 3 + 1,
        'Lag_1': req.lag_1,
        'Lag_7': req.lag_7,
        'Lag_30': req.lag_30,
        'RollMean_7': req.roll_mean_7,
        'RollMean_30': req.roll_mean_30
    }])
    
    try:
        pred = model.predict(features)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
        
    return {
        "crop": req.crop,
        "market": req.market,
        "state": req.state,
        "date": req.date,
        "predicted_price": round(float(pred), 2),
        "unit": "INR / Quintal",
        "model_version": "RandomForest_v3.0",
        "status": "SUCCESS"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
