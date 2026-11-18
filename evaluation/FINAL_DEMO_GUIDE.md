# HarvestHub – Final Academic Live Demonstration Guide

**Project Name:** HarvestHub – AI-Enabled Agricultural Marketplace & Decision-Support Platform  
**Target Milestone:** Review 3 / Final Academic Viva  
**Recommended Demo Duration:** 7 to 10 Minutes  
**Target Audience:** Academic Evaluators, External Reviewers, Technical Panel  

---

## 1. Pre-Demonstration Checklist & Environment Setup

Before starting the presentation, prepare your terminal and browser tabs:

### 1.1 Local Services Checklist
1. **Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   # Verify running at http://localhost:5173
   ```
2. **ML FastAPI Microservice:**
   ```bash
   cd ml
   source venv312/bin/activate # or uv run
   python serve.py
   # Verify running at http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
   ```
3. **Browser Preparation:**
   * Open Tab 1: `http://localhost:5173` (HarvestHub Landing Page)
   * Open Tab 2: `http://localhost:8000/docs` (FastAPI Swagger Interactive Documentation)
   * Open Tab 3: Split Terminal window ready for running tests.

---

## 2. Timed 7–10 Minute Demonstration Script

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOTAL TIME: ~8.5 MINUTES                                               │
│                                                                        │
│ [0:00 - 1:00] Part 1: Problem Statement & HarvestHub Solution          │
│ [1:00 - 2:15] Part 2: Farmer Workflow & Crop Management               │
│ [2:15 - 3:30] Part 3: Supervised ML Price Prediction Engine           │
│ [3:30 - 4:45] Part 4: Merchant Marketplace & Concurrency Purchasing   │
│ [4:45 - 5:45] Part 5: Admin Oversight & System Analytics              │
│ [5:45 - 6:45] Part 6: Security Architecture & RBAC Guards              │
│ [6:45 - 7:45] Part 7: Automated Testing Evidence & Model Metrics      │
│ [7:45 - 8:30] Part 8: Conclusion & Q&A Opening                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Problem Statement & Solution Overview (1:00 min)
* **What to Open:** `http://localhost:5173/` (Landing Page)
* **What Action to Perform:** Scroll across the landing page highlighting the dual-sided marketplace and AI intelligence cards.
* **Expected Result:** High-impact hero section, statistics banner, feature breakdown, and quick role selection cards render smoothly with Tailwind CSS styling.
* **What Technical Concept to Explain:**
  * Explain the traditional agricultural supply-chain dilemma: asymmetric price information leads to distress selling by smallholder farmers; intermediaries capture up to 45% margin.
  * State the HarvestHub architecture: A full-stack React 19 SPA with TypeScript, Supabase PostgreSQL with Row-Level Security, an empirical Random Forest supervised ML microservice, and Google Gemini 1.5 Flash for conversational intelligence.

---

### Step 2: Farmer Dashboard & Crop Listing Workflow (1:15 min)
* **What to Open:** Click **"Login as Farmer"** or navigate to `http://localhost:5173/farmer`.
* **What Action to Perform:**
  1. Show the farmer telemetry cards: Total Active Listings, Pending Offers, Total Earnings, and Weather Widget.
  2. Click **"Add New Crop"** button.
  3. Fill the modal: Crop: `Tomato`, Variety: `Hybrid`, Quantity: `500 kg`, Price: `₹28 / kg`, Harvest Date: `Select date`, Mandi: `Nashik`.
  4. Submit the form.
* **Expected Result:** The modal validates inputs using Zod schemas, displays an optimistic toast confirmation, and updates the active crops table instantly.
* **What Technical Concept to Explain:**
  * Explain client-side schema validation using `Zod` and `react-hook-form` preventing invalid negative numbers or empty titles.
  * Explain state synchronization via React Context (`ListingContext`) backed by PostgreSQL persistence.

---

### Step 3: AI Agricultural Price Prediction (1:15 min)
* **What to Open:** Navigate to the **"Price Prediction"** tab or AI Assistant widget in the Farmer Dashboard.
* **What Action to Perform:**
  1. Select Commodity: `Onion`, Mandi: `Lasalgaon`.
  2. Click **"Generate Price Forecast"**.
  3. Display the predicted modal price, upper/lower confidence bounds, and the 30-day projected price curve.
  4. Open Tab 2 (`http://localhost:8000/docs`) and execute a sample `POST /predict` request.
* **Expected Result:** The prediction chart updates dynamically. FastAPI Swagger returns HTTP 200 with JSON payload (`predicted_price: 1443.61 INR/Quintal`, `model_version: 'RandomForest_v3.0'`).
* **What Technical Concept to Explain:**
  * **Strict Separation of Concerns:** Emphasize that numerical price forecasting is performed by an **empirical Supervised Random Forest Regressor** ($R^2 = 0.9702$, MAE = 96.80 INR/Q) trained with chronological train/test splits, NOT by asking an LLM to hallucinate numbers.
  * Explain that Gemini 1.5 Flash is reserved for qualitative contextual translation (e.g., explaining weather risks and market trend interpretations).

---

### Step 4: Merchant Marketplace & Concurrency Purchasing (1:15 min)
* **What to Open:** Switch role to Merchant (navigate to `http://localhost:5173/marketplace`).
* **What Action to Perform:**
  1. Filter crops by category: `Vegetables` or search for `Tomato`.
  2. Click **"Buy Now"** on an available listing.
  3. Enter a valid purchase quantity (e.g., `100 kg`). Observe total price calculation updating in real-time.
  4. Demonstrate error bounds: Enter a quantity exceeding stock (e.g., `99999 kg`) $\to$ Observe instant validation block.
  5. Confirm order placement.
* **Expected Result:** The order completes, an order receipt is appended to the Merchant Orders portal, and the crop quantity decrements atomically.
* **What Technical Concept to Explain:**
  * Explain the ACID concurrency architecture: PostgreSQL stored procedure `place_order` uses `SELECT ... FOR UPDATE` row locks. Even under simultaneous concurrent purchasing by multiple merchants, stock cannot oversell or go negative.
  * Mention the self-purchase prevention check (`chk_orders_prevent_self_purchase`).

---

### Step 5: Admin Platform Oversight (1:00 min)
* **What to Open:** Switch role to Administrator (navigate to `http://localhost:5173/admin`).
* **What Action to Perform:**
  1. Review system telemetry: Total Registered Farmers, Merchants, GMV (Gross Merchandise Volume), Platform Health Status.
  2. Inspect the **"Listings Oversight"** and **"Users Management"** tabs.
* **Expected Result:** High-level platform health metrics, transaction volume area charts, and active listings moderation view render seamlessly.
* **What Technical Concept to Explain:**
  * Role-Based Access Control (RBAC) hierarchy.
  * Cross-tenant platform aggregation queries and administrative moderation privileges.

---

### Step 6: Security Architecture & RBAC Route Defense (1:00 min)
* **What to Open:** In the address bar, manually type `http://localhost:5173/admin` while logged in as a **Farmer**.
* **What Action to Perform:** Press Enter to simulate an unauthorized privilege escalation attempt.
* **Expected Result:** The client immediately intercepts the route transition and redirects to `http://localhost:5173/unauthorized` displaying an explicit HTTP 403 Access Denied card.
* **What Technical Concept to Explain:**
  * Frontend route guards (`<ProtectedRoute allowedRoles={['admin']}>`).
  * Database-level defense: Supabase Row-Level Security (RLS) ensures that even if an attacker bypasses the React frontend using direct REST calls, PostgreSQL rejects queries where `auth.uid()` does not match tenant permissions.
  * SQL stored procedures use `SECURITY DEFINER` with fixed `SET search_path = public, pg_temp` to eliminate search path injection attacks.

---

### Step 7: Automated Testing Evidence & Model Reproducibility (1:00 min)
* **What to Open:** Open Split Terminal in full view of the evaluators.
* **What Action to Perform:**
  1. Execute Frontend Test Suite:
     ```bash
     cd frontend && npm test
     ```
  2. Execute Python ML Test Suite:
     ```bash
     cd ml && pytest tests/ -v
     ```
* **Expected Result:**
  * Vitest reports **10 test files passed, 55 tests passed** in ~1.3 seconds.
  * Pytest reports **8 tests passed** in ~1.2 seconds with zero failures.
* **What Technical Concept to Explain:**
  * Zero placeholder tests: assertions test real race conditions, boundary math, OTP length, and token validation.
  * Total suite execution: 63 automated tests passing.

---

### Step 8: Summary & Viva Transition (0:30 min)
* Conclude with:
  > *"HarvestHub delivers an end-to-end, mathematically rigorous, and concurrency-safe agricultural marketplace. We have verified 100% reproducibility from a fresh clone, 63 passing tests, an empirical ML model with $R^2 = 0.9702$, and multi-tenant PostgreSQL security. We are now open for technical questions."*

---

## 3. Resilience & Backup Demonstration Contingency Plans

If live external services experience unexpected network downtime or latency during your evaluation, execute these pre-configured contingencies:

| Scenario / Failure | Root Cause | Contingency Action During Demo | Technical Justification |
|:---|:---|:---|:---|
| **No Internet Connection** | Wi-Fi failure in venue | The entire demo functions offline using pre-bundled local states (`localStorage` demo user credentials and simulated mock listings). | HarvestHub is built with an offline-first demo persistence layer in `UserContext.tsx` and `OrderContext.tsx`. |
| **Supabase Remote Unreachable** | Project paused or network latency | The application gracefully falls back to local state without throwing unhandled exceptions. In `src/lib/supabase.ts`, a placeholder client prevents constructor crashes. | Fallback client ensures UI components, navigation, and mock orders work seamlessly. |
| **Gemini AI Quota / Network Error** | API rate limit or missing API key | Open AI Assistant modal. The backend service (`aiService.ts`) detects API key absence or quota errors and triggers deterministic empirical advisory responses. | Architectural resilience: deterministic fallback engine guarantees the user never encounters a blank screen or 500 error. |
| **FastAPI Backend Not Running** | Port conflict on 8000 | Frontend automatically utilizes empirical baseline lookup tables embedded in `frontend/src/lib/forecast.ts`. | Microservice decoupling: client-side regression formulas maintain interactive charts even if Python service is stopped. |

