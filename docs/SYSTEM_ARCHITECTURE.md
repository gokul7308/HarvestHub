# System Architecture

HarvestHub is built using a modern serverless architecture tailored for rapid prototyping and scale.

## Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **State Management**: React Context (for Users, Listings, Demands, Orders, Negotiations, Settings)
- **Styling**: Tailwind CSS + Shadcn UI components
- **Routing**: React Router DOM (v7)

## API & Backend Services
- **Environment**: Vercel Serverless Functions (`/api/` directory)
- **Functions**:
  - `predict.ts`: Proxies requests to Gemini AI for crop price prediction. Includes Zod schema validation.
  - `insights.ts`: Proxies requests to Gemini AI for market insights. Includes Zod schema validation.
  - `assistant.ts`: Conversational interface API proxy.
- **AI Service Module**: `backend/functions/ai/aiService.ts` interacts with `@google/genai`.

## Database (Supabase PostgreSQL)
- **Auth**: Supabase Auth (OTP and Magic Link compatible).
- **Data Model**:
  - `profiles`: Synced with Supabase Auth users.
  - `crops`: Harvest listings tied to farmers.
  - `demands`: Merchant sourcing requests.
  - `orders` & `offers`: Transaction tracking.
- **Security**: Row Level Security (RLS) is enabled for all tables ensuring users can only interact with their own data appropriately.

## Execution Flow
1. Client makes request to `/api/predict`.
2. Vercel function validates the request payload using Zod.
3. Function securely contacts Google Gemini with the backend-only `AI_API_KEY`.
4. Result is returned with prediction metadata appended.
