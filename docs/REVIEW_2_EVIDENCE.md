# Review 2 Implementation Evidence

This document outlines the verified gap closure status following the final technical audit. Features and fixes are categorized strictly based on their verified execution state, with no fabricated claims.

## Implemented and Tested
These features have been implemented and are verified by passing unit/UI tests:
*   **Zod API Validation:** Strict `.strict()` validation with min/max bounds is implemented in `api/predict.ts`, `api/insights.ts`, and `api/assistant.ts`. (Verified by `tests/api/api.test.ts`).
*   **UI Error Resilience:** A top-level React `ErrorBoundary` wraps the application, preventing blank screen crashes. (Verified by `tests/errors/errorBoundary.test.tsx`).
*   **Frontend Data Consistency:** Contexts and frontend UI components now correctly query and map the `crops` database schema instead of the outdated `listings` nomenclature. (Verified by `tests/validation/listing.test.ts`).
*   **Client-Side RBAC Routing:** Route-level guards appropriately reject users attempting to access dashboard routes for different roles. (Verified by `tests/rbac/rbac.test.tsx`).

## Implemented but Not Integration-Tested
These features are implemented in the codebase (backend/DB/ML) but lack end-to-end automated integration tests in the CI environment (as they require live infrastructure):
*   **Atomic Order Transactions:** Order creation executes the PostgreSQL `place_order` RPC via `SECURITY DEFINER`. It employs a `SELECT ... FOR UPDATE` lock to guarantee quantity validation and inventory deduction in a single ACID transaction.
*   **Row-Level Security (RLS):** Database tables (`crops`, `demands`, `orders`, `offers`) enforce row-level privacy. e.g. `UPDATE` on `crops` is restricted to `auth.uid() = farmer_id`. 
*   **Machine Learning Price Pipeline:** A genuine Python pipeline (`ml/train.py`) ingests the daily commodity prices dataset (`ml/data/2026.csv`), Engineers lag/rolling-mean features, compares algorithms (RandomForest, GradientBoosting), and saves the selected model to `artifacts/model.joblib`. 

## Partially Implemented
*   **API Security / Rate Limiting:** The backend serverless endpoints gracefully return proper HTTP status codes (e.g. 405 Method Not Allowed, 400 Bad Request) upon invalid input, but they do NOT currently feature IP-based rate limiting to prevent brute-force attacks on the AI service limits.
*   **Code Quality / Linting:** Critical logic and purity bugs (e.g., `Math.random` render issues) were resolved. However, 125 ESLint problems remain (123 errors, 2 warnings), composed entirely of unused imports and explicit `any` types. These are deferred as technical debt.

## Planned
*   Live Supabase integration testing utilizing a staging database.
*   Full strict-mode TypeScript adoption across the dashboard (eliminating `any` types).
*   Live inference API mapping `train.py` artifacts dynamically into the Vercel edge functions.
