# HarvestHub – Complete API Documentation & Specification

**Document Version:** 3.0.0 (Review 3 Final Milestone)  
**Base URLs:**
* **Serverless Functions:** `/api/` (Vercel) & `/.netlify/functions/` (Netlify)
* **ML Python Microservice:** `http://localhost:8000/` (FastAPI)
* **Supabase REST Gateway:** `https://<supabase-project-id>.supabase.co/rest/v1/`

---

## 1. Overview & Authentication Standards

HarvestHub exposes RESTful serverless endpoints designed with strict JSON schema validation, standardized HTTP status codes, and resilient error recovery.

### Standard Request Headers
```http
Content-Type: application/json
Authorization: Bearer <SUPABASE_USER_JWT> (for authenticated endpoints)
```

### Standard Error Response Format
```json
{
  "error": "VALIDATION_ERROR | METHOD_NOT_ALLOWED | SERVER_ERROR | UNAUTHORIZED",
  "message": "Human-readable description of error without internal stack traces",
  "details": []
}
```

---

## 2. Serverless Prediction & AI Endpoints

### 2.1 Agricultural Price Prediction
* **Endpoint Path:** `/api/predict`
* **HTTP Method:** `POST`
* **Purpose:** Computes statistical price estimations using the trained Random Forest model (AGMARKNET historical mandi series), with optional Gemini qualitative market reasoning.
* **Authentication:** Optional (Open to farmers, merchants, and evaluators)
* **Request Body:**
  ```json
  {
    "crop": "Tomato",
    "location": "Pune APMC",
    "historical_price": 2.50,
    "quantity": 100,
    "role": "farmer"
  }
  ```
* **Validation Rules:**
  * `crop`: String, 1–100 chars (Required)
  * `location`: String, max 100 chars (Optional, defaults to `"General Market"`)
  * `historical_price` / `currentPrice`: Number or numeric string (Optional)
  * `role`: Enum `["farmer", "merchant", "admin"]` (Optional)
* **Success Response (`200 OK`):**
  ```json
  {
    "crop": "Tomato",
    "location": "Pune APMC",
    "estimated_price": 2.76,
    "min_price": 2.21,
    "max_price": 3.31,
    "trend": "up",
    "demand": "high",
    "confidence": 97.0,
    "recommendation": "Market indicators suggest upward price pressure for Tomato. Recommended selling target is $2.76 / unit.",
    "buying_insight": "High buyer interest in verified organic batches across nearby trading hubs.",
    "prediction_metadata": {
      "model_engine": "Random Forest Regressor v3.0 (Trained on AGMARKNET Daily Mandi Series)",
      "methodology": "Supervised ML Regression with Chronological Validation (strictly distinguished from LLM estimates)",
      "evaluation_metrics": {
        "r2": 0.9702,
        "mae_inr": 96.8,
        "rmse_inr": 140.46,
        "mape_pct": 5.13
      },
      "timestamp": "2026-11-17T10:45:00.000Z",
      "disclaimer": "Statistical prediction based on historical wholesale agricultural mandi arrivals. Real-time prices may vary with unpredicted weather and transportation shocks."
    }
  }
  ```
* **Error Responses:**
  * `400 Bad Request`: `{"error": "VALIDATION_ERROR", "message": "Invalid input data", "details": [...]}`
  * `405 Method Not Allowed`: `{"error": "METHOD_NOT_ALLOWED", "message": "Only POST method is allowed"}`

---

### 2.2 Agricultural Market Intelligence & Insights
* **Endpoint Path:** `/api/insights`
* **HTTP Method:** `POST`
* **Purpose:** Generates supply/demand trend analysis, commodity movements, and operational anomaly detection tailored to user persona.
* **Authentication:** Required / Recommended
* **Request Body:**
  ```json
  {
    "role": "merchant",
    "currentCrop": "Onion"
  }
  ```
  *For Admin:*
  ```json
  {
    "role": "admin",
    "totalFarmers": 120,
    "totalMerchants": 45,
    "activeListings": 85,
    "revenue": 145000
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "trending_crops": ["Tomato", "Onion", "Basmati Rice"],
    "falling_crops": ["Soybean", "Maize"],
    "stable_crops": ["Wheat", "Potato", "Pigeon Pea (Tur)"],
    "high_demand_crops": ["Organic Tomato", "Export Red Onion", "Sharbati Wheat"],
    "low_demand_crops": ["Feed Barley", "Standard Maize"],
    "supply_demand_trend": "Post-harvest mandi arrivals showing robust seasonal demand with firm wholesale price benchmarks.",
    "ai_recommendations": [
      "Lock in forward procurement contracts with certified farmers before festival demand surge.",
      "Monitor wholesale mandi arrivals in primary producing districts to optimize transaction timing."
    ],
    "purchasing_opportunities": [
      "Lasalgaon and Nashik red onion lots showing favorable price-to-grade ratios."
    ],
    "anomalies": []
  }
  ```

---

### 2.3 Contextual Agricultural AI Assistant
* **Endpoint Path:** `/api/assistant`
* **HTTP Method:** `POST`
* **Purpose:** Conversational agricultural advisory answering queries regarding harvesting schedules, pricing trends, and marketplace navigation.
* **Request Body:**
  ```json
  {
    "query": "When is the best time to harvest and sell my onions in Maharashtra?",
    "contextData": {
      "role": "farmer",
      "location": "Nashik"
    }
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "response": "For Nashik kharif onions, harvest once 50% of tops have fallen. Curing for 10-15 days in shaded well-ventilated sheds is critical before taking produce to Lasalgaon or Pimpalgaon mandis to command peak grade premiums."
  }
  ```

---

## 3. Serverless Marketplace & Administrative Endpoints

### 3.1 Active Crop Listings Retrieval
* **Endpoint Path:** `/.netlify/functions/getCrops`
* **HTTP Method:** `GET`
* **Purpose:** Fetches active crop listings joined with farmer profile information.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "crops": [
      {
        "id": "c101-uuid",
        "name": "Organic Premium Wheat",
        "price": 0.45,
        "quantity": 1000,
        "unit": "kg",
        "location": "California, USA",
        "status": "Active",
        "images": [],
        "created_at": "2026-11-10T12:00:00Z",
        "profiles": { "name": "Midwest Agritech Farms" }
      }
    ]
  }
  ```

### 3.2 Sourcing Demands Retrieval
* **Endpoint Path:** `/.netlify/functions/getDemands`
* **HTTP Method:** `GET`
* **Purpose:** Fetches open commodity procurement demands posted by verified merchants.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "demands": [
      {
        "id": "d201-uuid",
        "crop_name": "Soybeans",
        "quantity": 5000,
        "budget": 2500,
        "location": "Iowa",
        "status": "open",
        "merchant_id": "m-uuid",
        "profiles": { "name": "Global Grain Merchants" }
      }
    ]
  }
  ```

### 3.3 Platform Administrative Metrics
* **Endpoint Path:** `/.netlify/functions/adminStats`
* **HTTP Method:** `GET`
* **Purpose:** Computes platform-wide totals across farmers, merchants, listings, and orders.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "stats": {
      "totalFarmers": 142,
      "totalMerchants": 58,
      "totalCrops": 310,
      "totalOrders": 185
    }
  }
  ```

---

## 4. Python Machine Learning Microservice (`ml/serve.py`)

### 4.1 Microservice Health Check
* **Endpoint Path:** `http://localhost:8000/health`
* **HTTP Method:** `GET`
* **Success Response (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "model_loaded": true,
    "supported_crops": ["Onion", "Potato", "Tomato", "Wheat", "Rice"]
  }
  ```

### 4.2 Raw Feature Regression Inference
* **Endpoint Path:** `http://localhost:8000/predict`
* **HTTP Method:** `POST`
* **Request Body:**
  ```json
  {
    "crop": "Onion",
    "market": "Pune",
    "state": "Maharashtra",
    "date": "2026-05-01",
    "lag_1": 1500.0,
    "lag_7": 1400.0,
    "lag_30": 1300.0,
    "roll_mean_7": 1450.0,
    "roll_mean_30": 1350.0
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "crop": "Onion",
    "market": "Pune",
    "state": "Maharashtra",
    "date": "2026-05-01",
    "predicted_price": 1488.25,
    "unit": "INR / Quintal",
    "model_version": "RandomForest_v3.0",
    "status": "SUCCESS"
  }
  ```

---

## 5. OpenAPI 3.0 Specification

An OpenAPI 3.0 compliant definition is maintained below for API client generation and automated Postman/Swagger importing:

```yaml
openapi: 3.0.3
info:
  title: HarvestHub API
  version: 3.0.0
  description: AI-Enabled Agricultural Marketplace & Decision Support API
paths:
  /api/predict:
    post:
      summary: Predict crop modal price using trained ML pipeline
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [crop]
              properties:
                crop: { type: string, example: "Tomato" }
                location: { type: string, example: "Pune" }
                currentPrice: { type: number, example: 2.50 }
                role: { type: string, enum: [farmer, merchant, admin] }
      responses:
        '200':
          description: Successful statistical prediction
          content:
            application/json:
              schema:
                type: object
                properties:
                  estimated_price: { type: number }
                  min_price: { type: number }
                  max_price: { type: number }
                  confidence: { type: number }
                  trend: { type: string, enum: [up, down, stable] }
                  prediction_metadata: { type: object }
        '400':
          description: Validation error
```

