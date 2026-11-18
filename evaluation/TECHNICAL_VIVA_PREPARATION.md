# HarvestHub – Technical Viva & Evaluation Defense Preparation

**Project Name:** HarvestHub – AI-Enabled Agricultural Marketplace & Decision-Support Platform  
**Target Milestone:** Review 3 / Final Academic Viva  
**Domain Coverage:** Full-Stack Web, Distributed AI/ML, Cloud Database Architecture, Cyber Security, QA  
**Total Questions:** 32 Technical In-Depth Q&As  

---

## Section 1: System Architecture, React & TypeScript

### Q1: Can you describe the overarching architecture of HarvestHub?
**Answer:** HarvestHub is architected as a disintermediated, multi-tier agricultural platform comprising four decoupled layers:
1. **Frontend Presentation Tier:** A Single-Page Application (SPA) built with React 19, TypeScript, and Vite, utilizing Tailwind CSS for styling and Recharts for analytical visualizations.
2. **Backend Serverless API Tier:** Node.js/TypeScript serverless endpoints (`/api/predict`, `/api/insights`, `/api/assistant`) hosted on Vercel handling schema validation (Zod) and orchestration.
3. **Dedicated Machine Learning Inference Tier:** A Python 3.12 FastAPI microservice serving an empirical supervised Random Forest regression model (`model.joblib`) for commodity price forecasting.
4. **Data & Security Tier:** Supabase PostgreSQL providing relational persistence, Row-Level Security (RLS) policies, and ACID transactional stored procedures for concurrency protection.

### Q2: Why did you choose React 19 and Vite instead of Next.js or a traditional Multi-Page Application (MPA)?
**Answer:** HarvestHub is an interactive, real-time trading dashboard with heavy client-side state manipulation (filtering crops, real-time quantity/price calculations, modal-driven price negotiations, and dynamic forecasting charts). React 19 provides high rendering performance and modern hooks. Vite offers near-instant hot module replacement (HMR) and bundles production assets in ~250ms via Rollup. Since our backend leverages serverless functions and a dedicated FastAPI service, a client-side SPA decoupled from the API layer provides superior developer velocity and independent scalability.

### Q3: How is TypeScript leveraged throughout HarvestHub to prevent runtime failures?
**Answer:** We enforce strict type-safety across models, context providers, and API requests:
* Database entities (`Crop`, `Order`, `Profile`, `Bid`) are strictly typed in `src/types/index.ts`.
* Runtime input boundaries (crop creation, order quantities, price bids) are guarded with **Zod** schemas in `src/lib/validations.ts`. TypeScript infers compile-time types from these Zod schemas using `z.infer<typeof schema>`, preventing type drift between frontend forms and backend payloads.

### Q4: How does the application maintain state across multiple user roles without re-rendering the whole tree?
**Answer:** HarvestHub decomposes state into domain-specific React Contexts rather than a single monolithic Redux store:
* `UserContext`: Manages authenticated session tokens, user profile metadata, and role switching.
* `ListingContext`: Manages crop listings, filters, search queries, and inventory updates.
* `OrderContext`: Manages transactional order creation, checkout modal state, and historical buyer/seller orders.
* `NegotiationContext`: Handles real-time counter-offers and bid status updates.  
By encapsulating state transitions in isolated contexts, updating an order does not cause re-renders in the crop catalog or navigation bar.

---

## Section 2: Database Architecture, PostgreSQL & Concurrency

### Q5: What database tables exist in HarvestHub and how are foreign keys structured?
**Answer:** HarvestHub defines six core relational tables in PostgreSQL:
* `profiles`: Extends Supabase `auth.users` with `id (UUID PRIMARY KEY)`, `role ('farmer' | 'merchant' | 'admin')`, `full_name`, and `phone`.
* `crops`: Stores produce listings with `farmer_id (FK -> profiles.id ON DELETE CASCADE)`, `crop_name`, `variety`, `quantity`, `price`, `status ('available' | 'sold')`.
* `orders`: Manages executed trades with `crop_id (FK -> crops.id ON DELETE RESTRICT)`, `buyer_id (FK -> profiles.id)`, `seller_id (FK -> profiles.id)`, `quantity`, and `total_price`.
* `bids`: Stores price negotiation history with `crop_id (FK -> crops.id ON DELETE CASCADE)` and `bidder_id (FK -> profiles.id)`.
* `conversations` & `messages`: Facilitates buyer-seller negotiation chat.

### Q6: What is the overselling problem in agricultural trading, and how does HarvestHub solve it?
**Answer:** When multiple merchants simultaneously attempt to purchase the remaining stock of a crop (e.g. 50 kg of onions), naive read-then-write updates (`UPDATE crops SET quantity = quantity - X`) suffer from race conditions, resulting in negative inventory or double-selling.  
HarvestHub solves this at the database engine level inside the PostgreSQL stored procedure `place_order`:
```sql
SELECT id, farmer_id, price, quantity INTO v_crop
FROM public.crops
WHERE id = p_crop_id
FOR UPDATE;
```
The `FOR UPDATE` clause places a pessimistic row-level lock on the crop record. Concurrent transactions are serialized: the second transaction blocks until the first completes, inspects the updated remaining stock, and raises an exception (`'Insufficient crop inventory'`) if stock is depleted.

### Q7: What domain integrity constraints (CHECK constraints) are enforced on the database?
**Answer:** In migration `001_security_and_constraints_hardening.sql`, we enforce:
1. `chk_crops_price_positive`: `CHECK (price > 0)` – crops cannot be listed for free or negative amounts.
2. `chk_crops_quantity_positive`: `CHECK (quantity >= 0)` – inventory cannot drop below zero.
3. `chk_orders_quantity_positive`: `CHECK (quantity > 0)` – orders must request at least one unit.
4. `chk_orders_price_positive`: `CHECK (total_price > 0)` – total order value must be positive.
5. `chk_orders_prevent_self_purchase`: `CHECK (buyer_id != seller_id)` – prevents farmers from buying their own crops.

### Q8: What is `SECURITY DEFINER` in PostgreSQL, and why did you configure `search_path = public, pg_temp`?
**Answer:** A `SECURITY DEFINER` function executes with the privileges of the user that created it (the database owner), allowing unprivileged users to execute privileged atomic operations (such as decrementing stock on a seller's listing during checkout).  
However, naive `SECURITY DEFINER` functions are vulnerable to **search path hijacking**, where an attacker creates a malicious table or function in a schema with precedence. We mitigate this vulnerability by explicitly specifying:
```sql
SET search_path = public, pg_temp;
```
This restricts object resolution strictly to the trusted `public` schema and temporary tables.

---

## Section 3: Authentication, RBAC & Row-Level Security (RLS)

### Q9: How does the authentication flow work in HarvestHub?
**Answer:** HarvestHub supports two authentication modes:
1. **Supabase Phone Authentication with 6-Digit OTP:** Generates an SMS or mock one-time password verified in `OTPLogin.tsx`. The input field auto-advances focus across 6 boxes and validates `otp.join('').length === 6` before submission.
2. **Role-Based Demo Simulation Mode:** For academic and viva evaluations, the application persists verified profiles in `localStorage` (`harvesthub_demo_user`), allowing one-click role switching between Farmer, Merchant, and Admin without requiring third-party SMS delivery credits.

### Q10: How is Role-Based Access Control (RBAC) enforced in the frontend?
**Answer:** In `frontend/src/App.tsx`, routes are wrapped with a `<ProtectedRoute>` higher-order component:
```tsx
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```
If a logged-in user with role `'farmer'` attempts to access `/admin` or `/merchant`, `ProtectedRoute` intercepts the request, blocks rendering, and redirects to `/unauthorized`, which displays a dedicated HTTP 403 Access Denied screen.

### Q11: If a malicious user bypasses the React frontend using Postman or cURL, does your security hold?
**Answer:** Yes. Frontend route guards are merely user experience conveniences; **true authorization is enforced by PostgreSQL Row-Level Security (RLS)**:
* `crops` table: RLS policy `Farmers can update own crops` checks:
  ```sql
  USING (auth.uid() = farmer_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer'
  ))
  ```
* Even if an attacker crafts an arbitrary REST payload to `PATCH /rest/v1/crops?id=123`, PostgreSQL evaluates the current JWT (`auth.uid()`). If the caller is not the owner or does not hold the `'farmer'` role, PostgreSQL rejects the query with 0 rows modified or an access violation error.

### Q12: How are permissions partitioned between Farmers, Merchants, and Admins?
**Answer:**
* **Farmers:** Can create, edit, and delete their own crop listings; view bids/orders placed on their crops; accept/reject negotiations. Cannot buy crops or view admin telemetry.
* **Merchants:** Can browse all available crop listings; submit price counter-offers; place buy orders. Cannot create crop listings or modify another merchant's orders.
* **Admins:** Can read all platform telemetry, moderate crop listings, review user registries, and view aggregate platform gross merchandise value.

---

## Section 4: Machine Learning Pipeline & Statistical Methodology

### Q13: What is the exact purpose of the Machine Learning pipeline in HarvestHub?
**Answer:** The ML pipeline provides empirical price forecasting for 5 key agricultural commodities (Onion, Potato, Tomato, Wheat, Rice) across 6 major Indian wholesale mandis (Pune, Nashik, Lasalgaon, Mumbai, Azadpur, Bangalore). It empowers smallholder farmers to identify optimal harvest clearing times and avoid distress sales during harvest gluts.

### Q14: Where does the dataset come from, and is it real or synthetic?
**Answer:** To ensure strict academic transparency: the dataset (`ml/data/2026.csv`) is **synthetically generated using domain-calibrated mathematical models** (`ml/prepare_dataset.py`). It is calibrated to official **AGMARKNET** (Ministry of Agriculture & Farmers Welfare) historical price distributions, seasonal harmonic sine waves, and mandi transport spreads. It comprises **16,380 records** from January 1, 2025 to June 30, 2026 (15,480 valid records post-lag initialization). We do not claim it is raw scraped data from the live AGMARKNET portal.

### Q15: What features were engineered for the regression models?
**Answer:** We engineered 11 distinct features:
1. **Calendar / Cyclical:** `Month` (1–12), `DayOfWeek` (0–6), `Quarter` (1–4) capturing seasonal harvest cycles.
2. **Spatial & Commodity:** One-hot encoded `State`, `Market`, and `Commodity`.
3. **Autoregressive Lags:** `Lag_1` (yesterday's modal price), `Lag_7` (weekly momentum), `Lag_30` (monthly baseline).
4. **Moving Averages:** `RollMean_7` (7-day rolling average) and `RollMean_30` (30-day baseline).

### Q16: How did you ensure there is zero "target leakage" in the lag and rolling features?
**Answer:** Target leakage occurs when future or current-day target values are accidentally included in predictor features. In `ml/train.py`, we strictly applied backward shifts:
```python
df['Lag_1'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].shift(1)
df['RollMean_7'] = df.groupby(['Commodity', 'Market'])['Modal_Price'].shift(1).rolling(window=7).mean()
```
Because of `.shift(1)`, the features for day $t$ depend solely on observations from days $\le t - 1$. Day $t$'s modal price is never accessible to the feature vector. This is verified by unit test `test_no_future_leakage_in_lags` in `ml/tests/test_ml.py`.

### Q17: Why did you use a chronological train/test split instead of random k-fold cross-validation?
**Answer:** In time-series forecasting, standard randomized k-fold cross-validation causes **temporal leakage** (using tomorrow's price to predict yesterday's price), artificially inflating accuracy metrics.  
HarvestHub uses a strict chronological split:
* Split Date: `2026-03-19` (80th percentile chronologically).
* Training Partition: 2025-01-31 to 2026-03-18 (12,360 rows).
* Testing Partition: 2026-03-19 to 2026-06-30 (3,120 rows).  
The model is trained strictly on the past and evaluated exclusively on the future (`max(train_date) < min(test_date)`).

### Q18: What models were evaluated, and what were the exact benchmark metrics?
**Answer:** We evaluated three heuristic baselines and three supervised learning algorithms on the test partition:

| Model / Baseline | MAE (INR/Q) | RMSE (INR/Q) | $R^2$ Score | MAPE (%) |
|:---|:---:|:---:|:---:|:---:|
| Commodity Mean Baseline | 376.10 | 500.29 | 0.6223 | 21.18% |
| Naive Lag-1 Persistent | 118.43 | 170.95 | 0.9559 | 6.31% |
| 7-Day Rolling Mean Baseline | 100.43 | 148.36 | 0.9668 | 5.32% |
| Linear Regression (OLS) | 97.57 | 143.65 | 0.9689 | 5.20% |
| Gradient Boosting Regressor | 97.41 | 142.59 | 0.9693 | 5.21% |
| **Random Forest Regressor (Selected)**| **96.80** | **140.46** | **0.9702** | **5.13%** |

The Random Forest model outperformed the strongest baseline (7-day moving average) by **3.61% lower MAE** and **5.32% lower RMSE**.

### Q19: Explain the mathematical definitions of MAE, RMSE, $R^2$, and MAPE.
**Answer:**
* **MAE (Mean Absolute Error):** $\text{MAE} = \frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$. Represents average prediction error in raw rupees (₹96.80 per Quintal). Robust to outliers.
* **RMSE (Root Mean Squared Error):** $\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2}$. Penalizes large outlier forecast errors heavily.
* **$R^2$ (Coefficient of Determination):** $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$. Measures the proportion of variance explained by the model (0.9702 = 97.02% of price fluctuations explained).
* **MAPE (Mean Absolute Percentage Error):** $\text{MAPE} = \frac{100\%}{n} \sum_{i=1}^n \left|\frac{y_i - \hat{y}_i}{y_i}\right|$. Measures relative percentage deviation (5.13% average error).

### Q20: Why did Random Forest outperform Linear Regression and Gradient Boosting in this setup?
**Answer:** Agricultural prices exhibit non-linear interactions: seasonal weather shocks disproportionately affect perishable crops (e.g., tomatoes have higher price volatility than wheat). Linear Regression assumes additive linearity and struggles with commodity-specific non-linear volatility. While Gradient Boosting can overfit small localized fluctuations, Random Forest ensembles 100 decorrelated decision trees (`n_estimators=100, max_depth=16`), providing optimal generalization variance reduction across volatile regional mandis.

---

## Section 5: Generative AI & Google Gemini Integration

### Q21: How is Google Gemini 1.5 Flash integrated, and why is it separated from the ML regression engine?
**Answer:** In `backend/functions/ai/aiService.ts`, Google Gemini 1.5 Flash is strictly used for **qualitative reasoning and persona-based trade advisory**, while numerical price prediction is handled by scikit-learn. Large Language Models (LLMs) are notorious for arithmetic hallucinations and cannot reliably calculate statistical market clearing prices. Conversely, regression models output raw numbers without contextual advice. HarvestHub combines both: the ML model computes the price (e.g. ₹1,443.61/Q), and Gemini provides advisory text (e.g. *"Prices in Lasalgaon are projected to peak in 10 days due to post-monsoon supply tightening; consider storing 30% of your crop in a warehouse"*).

### Q22: What happens if the Gemini API key is missing or the external API quota is exceeded?
**Answer:** HarvestHub implements **resilient deterministic offline fallbacks** in `aiService.ts`:
* If `AI_API_KEY` is undefined or returns an HTTP 429/500 error, `predictCropPrice()` and `getMarketInsights()` immediately fall back to pre-calibrated regional econometric tables and verified statistical momentum formulas.
* The frontend receives valid trade recommendations and confidence scores without displaying blank screens or unhandled exceptions.

---

## Section 6: API Design & FastAPI Microservice

### Q23: What endpoints does the FastAPI microservice expose?
**Answer:** In `ml/serve.py`:
* `GET /health`: Returns operational health status, model load verification (`model_loaded: true`), and list of supported commodities.
* `POST /predict`: Accepts a JSON payload (`crop`, `market`, `state`, `date`, `lag_1`, `lag_7`, `lag_30`, `roll_mean_7`, `roll_mean_30`), validates inputs, constructs the feature vector, and invokes `model.predict()`. Returns predicted price (INR/Q) and a 30-day projected curve.

### Q24: How does FastAPI handle bad inputs and invalid dates?
**Answer:** We implement two levels of validation:
1. **Pydantic Model Schema Validation:** Missing fields return HTTP 422 with precise field error pointers.
2. **Business Rule Validations:**
   * Invalid date strings (e.g., `'May 1st'` instead of `'YYYY-MM-DD'`) return HTTP 400 with `{"detail": "Invalid date format. Expected YYYY-MM-DD"}`.
   * Unsupported crops (e.g., `'Apple'`) return HTTP 400 with `{"detail": "Unknown crop. Supported: Onion, Potato, Tomato, Wheat, Rice"}`.

---

## Section 7: Software Testing & Quality Assurance

### Q25: What is the testing strategy of HarvestHub, and how many tests exist?
**Answer:** HarvestHub maintains **63 automated tests (0 failures)** across two isolated test runners:
1. **Frontend Vitest Suite (55 tests across 10 files):**
   * Unit tests: Input bounds, percentage calculations, fee formulas (`calculations.test.ts`).
   * Schema tests: Zod form validation rules (`validations.test.ts`, `listing.test.ts`).
   * Security & RBAC tests: Route redirection and unauthorized barriers (`rbac.test.tsx`, `security.test.ts`).
   * Transactional tests: Concurrency serialization, self-purchase blocking, inventory rollback (`atomic.test.ts`).
   * Component tests: Error boundaries and fallback UI rendering (`errorBoundary.test.tsx`).
2. **Python ML Pytest Suite (8 tests in `test_ml.py`):**
   * Validates zero target leakage in lags, non-zero price filters, temporal train/test disjointness, metric sanity math, and FastAPI HTTP responses.

### Q26: Are these mock-only tests or do they test real application behavior?
**Answer:** The tests verify real computational and state logic:
* In `atomic.test.ts`, tests simulate race conditions where two simultaneous orders compete for the last inventory item; assertions verify that one succeeds and the second is rejected.
* In `rbac.test.tsx`, actual React Router navigation hooks are mounted in JSDOM, asserting that unauthorized users are redirected to `/unauthorized`.
* In `test_ml.py`, FastAPI `TestClient` sends HTTP requests to the actual app instance and asserts status codes and JSON keys.

---

## Section 8: DevOps, Reproducibility & Limitations

### Q27: How did you verify fresh clone reproducibility?
**Answer:** In an isolated temporary directory (`/tmp/harvesthub_clone_audit_...`), we cloned `https://github.com/gokul7308/HarvestHub` (branch `review-3-final`) without copying any local files from the development machine:
1. Ran `npm ci` in `frontend/` $\to$ Successfully installed 342 packages.
2. Ran `npm test` $\to$ 55 Vitest tests passed.
3. Ran `npm run build` $\to$ Vite compiled 2,875 modules cleanly in 244ms.
4. Created Python virtual environment and installed `requirements.txt` $\to$ Clean installation.
5. Ran `python prepare_dataset.py && python train.py` $\to$ Regenerated 16,380 records and produced bit-for-bit identical Random Forest metrics ($R^2 = 0.9702$).
6. Ran `pytest tests/` $\to$ 8 tests passed.

### Q28: Why are `.joblib` and `.csv` files excluded from the Git repository?
**Answer:** Standard DevOps best practices dictate that large binary artifacts (such as trained model weights and large datasets) should not be committed to Git repositories to prevent repository bloat and slow clone operations. Instead, we commit `ml/prepare_dataset.py`, `ml/train.py`, and `requirements.txt`, making the dataset and `.joblib` model 100% reproducible with two CLI commands.

### Q29: What are the current security and operational limitations of HarvestHub?
**Answer:**
1. **Migration Execution Status:** Migration `001_security_and_constraints_hardening.sql` is authored, syntactically verified, and staged in the repository. In accordance with database safety guidelines, it has not been executed against the live remote Supabase production instance without explicit administrative authorization.
2. **Synthetic Training Data:** While mathematically calibrated to AGMARKNET historical trends, the dataset is synthetic and does not reflect real-time live auction prices at today's mandi arrivals.
3. **Third-Party SMS Gateway:** Production SMS OTP delivery requires an active Twilio or Fast2SMS subscription key.

### Q30: How would you scale HarvestHub if traffic increased to 100,000 daily active users?
**Answer:**
1. **Database Layer:** Implement read replicas for catalog browsing while keeping the primary PostgreSQL instance for transactional orders. Add Redis for caching popular crop listings and price forecasts.
2. **ML Serving:** Containerize the FastAPI service using Docker and deploy to AWS ECS or Google Cloud Run behind an Application Load Balancer with autoscaling based on CPU/request latency.
3. **CDN Caching:** Cache static Vite frontend assets across Cloudflare CDN edge nodes.

### Q31: What steps were taken to prevent accidental secret leakage?
**Answer:**
* `.gitignore` explicitly excludes `.env`, `.env.*`, `*.joblib`, `*.csv`, and virtual environments.
* `.env.example` provides documented dummy placeholders.
* Automated regex scanning confirmed zero exposed Google API keys (`AIza...`), Supabase JWTs (`eyJ...`), or database passwords in the repository.

### Q32: What are the top 3 future enhancements planned for HarvestHub?
**Answer:**
1. **Direct AGMARKNET API Ingestion:** Automating a nightly ETL pipeline connecting to the Open Government Data (OGD) platform API (`data.gov.in`) to ingest live mandi auction prices daily.
2. **Cold Storage & Logistics Integration:** Enabling farmers to book certified temperature-controlled transport and nearby warehousing directly from the checkout flow.
3. **Smart Contract Escrow:** Implementing escrow payment holding via Razorpay Route or UPI AutoPay, releasing funds to farmers automatically upon biometric or QR delivery confirmation.

