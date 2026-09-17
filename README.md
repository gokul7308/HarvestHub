# HarvestHub

HarvestHub is a functional AI-assisted agriculture marketplace prototype designed to bridge the gap between farmers and merchants.

## Problem
The agricultural supply chain suffers from information asymmetry. Farmers lack visibility into future crop demand and optimal pricing, leading to profit loss. Conversely, merchants struggle to procure specific crops efficiently at fair market values.

## Solution
HarvestHub provides a unified, real-time marketplace combined with generative AI insights, creating a transparent and efficient ecosystem for agricultural commerce.

## Key Features

### Farmer
- **Dashboard**: Provides an overview of active listings and personal metrics.
- **Listing Management**: Add, edit, and manage crop listings on the global marketplace.
- **AI Price Forecast Interface**: Request contextual price estimations for crops.

### Merchant
- **Dashboard**: Track active orders, negotiations, and general demand.
- **Marketplace Browsing**: Search and filter global crop listings.
- **Purchasing/Deal Workflows**: Simulated UI workflows for initiating offers.

### Admin
- **Dashboard**: Monitors platform-wide analytics, manages user KYC statuses, and monitors platform-wide risk observations.
- **Monitoring**: General health and metric monitoring UI.

### AI Capabilities
- **AI Price Estimation**: Generative AI-based pricing context.
- **AI Market Insights**: Generative AI market observations based on mock contexts.
- **AI Assistant**: A conversational interface for platform assistance.

## Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, React Router, Context API
- **Charts**: Recharts
- **Backend API**: Vercel Serverless Functions
- **AI Service**: Google Gemini API (@google/genai)
- **Database**: Supabase (PostgreSQL)

## Architecture
HarvestHub utilizes a serverless web application architecture. The React 19 frontend handles routing and state management. Requests for AI capabilities are securely proxied through Vercel Serverless Functions (`/api/`) to protect external API keys, communicating with Google Gemini and the Supabase database.

## AI Methodology
**HarvestHub currently uses Google Gemini 1.5 Flash through server-side API integration and prompt engineering for contextual agricultural intelligence. It is not a traditionally trained ML forecasting model.**

The current prototype does not train on a historical time-series dataset and does not currently consume live weather or live market-price feeds for forecasting. Therefore, conventional forecasting metrics such as MAE, RMSE, and R² are not currently reported because there is no validated supervised forecasting dataset/model evaluation pipeline in the current implementation.

## Testing
The application has undergone **manual runtime verification** in a local development environment. Core UI workflows (dashboards, marketplace, listings) render correctly. 

## Current Limitations
- **Generative AI vs. Trained ML**: The AI relies entirely on prompt-engineered generative AI rather than a trained physical forecasting model.
- **Mock Data**: Some analytics and historical charts rely on static mock data rather than live market feeds.

## Future Roadmap
- Implementation of a dedicated ML forecasting pipeline (Historical dataset + preprocessing + baseline ML + trained forecasting model + MAE/RMSE/R²).
- Complete End-to-End browser integration testing.

## Project Structure
```text
├── api/                  # Vercel Serverless Functions (API Layer)
├── backend/              # Core backend logic & AI service integrations
├── docs/                 # Project documentation and Review-1 artifacts
├── frontend/src/         # React Application code
│   ├── components/       # Reusable UI components
│   ├── contexts/         # State management providers
│   ├── pages/            # Role-based dashboard views
│   └── lib/              # Utility functions and Supabase client
```

## Getting Started

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure Environment Variables:
Create a `.env.local` file at the root of the project with your valid API keys (required for AI functionality):
```env
AI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```
