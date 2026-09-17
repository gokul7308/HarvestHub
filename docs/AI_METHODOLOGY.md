# AI Methodology

HarvestHub leverages Artificial Intelligence to provide farmers and merchants with actionable insights, market trends, and pricing guidelines. 

## Current Implementation: Generative AI Prototype
**IMPORTANT:** The current system uses **Google Gemini 1.5 Flash** (via `@google/genai`) to generate insights contextually. It is **not** a traditional trained Machine Learning model (e.g., Random Forest, ARIMA).

### How It Works
1. **Input Collection**: User inputs (crop, location, historical price, quantity) are collected from the UI.
2. **Validation**: The backend (`api/predict.ts` and `api/insights.ts`) validates the data schema using Zod.
3. **Prompt Engineering**: The backend injects the structured data into a highly specific persona-driven prompt.
4. **Inference**: Gemini generates a JSON response.
5. **Metadata Appending**: A `prediction_metadata` object is appended strictly noting the methodology ("Generative AI Prototype (Not a trained ML model)"), timestamp, and input factors.

### Limitations
Because this is a generative prompt-based system rather than a statistical/ML forecasting model:
- **No Evaluation Metrics**: Metrics like MAE (Mean Absolute Error), RMSE (Root Mean Square Error), or R² are not applicable or reported.
- **Data Dependency**: The system currently does not rely on a live streaming historical dataset.

## Future Roadmap: ML Pipeline
To transition from a generative prototype to a production forecasting model, the following pipeline is planned:
1. **Data Lake**: Ingestion of historical crop prices, weather patterns, and seasonal demand.
2. **Feature Engineering**: Normalization, time-series transformations.
3. **Model Training**: Implementing gradient boosting or neural network models (e.g., XGBoost, LSTM).
4. **Evaluation Framework**: Establishing baseline metrics (MAE, MAPE) and cross-validation protocols.
5. **Deployment**: Serving the model via a dedicated endpoint, replacing the LLM-based estimation.
