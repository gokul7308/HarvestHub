# HarvestHub – Comprehensive System Architecture

**Document Version:** 3.0.0 (Review 3 Final Milestone)  
**System Type:** AI-Enabled Agriculture Marketplace & Decision-Support Platform  
**Date:** November 17, 2026  

---

## 1. High-Level Architectural Diagram

```
                                  +---------------------------------------+
                                  |            CLIENT DEVICES             |
                                  |   (Farmers, Merchants, Admin Users)   |
                                  +---------------------------------------+
                                                      │
                                                      │ HTTPS / WSS
                                                      ▼
+---------------------------------------------------------------------------------------------------+
|                                      FRONTEND SPA (REACT 19 + VITE)                               |
|                                                                                                   |
|  [Presentation Layer]                                                                             |
|   ├── Farmer Dashboard       ├── Merchant Dashboard       ├── Admin Console                       |
|   ├── Crop Management        ├── Sourcing Demands         ├── Analytics & Reporting               |
|   └── Marketplace Catalog    └── Buy Now Checkout Modal   └── System Settings                     |
|                                                                                                   |
|  [State & Context Layer]                                                                          |
|   ├── UserContext (RBAC)     ├── ListingContext           ├── OrderContext (Atomic PlaceOrder)    |
|   ├── DemandContext          ├── NegotiationContext       ├── Theme & SettingsContext             |
|                                                                                                   |
|  [Resilience & UI Layer]                                                                          |
|   ├── React ErrorBoundary    ├── Zod Client Validation   ├── Sonner Toast System                  |
+---------------------------------------------------------------------------------------------------+
                       │                                                   │
          REST / RPC   │                                       JSON API    │
                       ▼                                                   ▼
+---------------------------------------------+   +-------------------------------------------------+
|          SUPABASE POSTGRESQL TIER           |   |            SERVERLESS API LAYER (VERCEL)        |
|                                             |   |                                                 |
|  [Auth & Identity]                          |   |  ├── /api/predict (Hybrid ML / AI Svc)          |
|   └── Supabase Auth (6-digit OTP + OAuth)   |   |  ├── /api/insights (Marketplace Analytics)      |
|                                             |   |  └── /api/assistant (Role-Based Advisory)       |
|  [Database Engine & RLS]                    |   +-------------------------------------------------+
|   ├── public.profiles (RBAC Sync)           |                            │
|   ├── public.crops (Listings)               |             ┌──────────────┴──────────────┐
|   ├── public.demands (Sourcing)             |             │                             │
|   ├── public.orders (Transactions)          |             ▼                             ▼
|   └── public.offers (Negotiations)          |   +-------------------+         +-------------------+
|                                             |   |  SUPERVISED ML    |         |   GOOGLE GEMINI   |
|  [ACID Concurrency Locking]                 |   |  PIPELINE (LOCAL) |         |   1.5 FLASH (LLM) |
|   └── place_order() (FOR UPDATE Lock)       |   |                   |         |                   |
+---------------------------------------------+   | • Random Forest   |         | • Qualitative     |
                                                  |   Regressor v3.0  |         |   Advisory        |
                                                  | • AGMARKNET Data  |         | • Persona Prompt  |
                                                  | • MAE: 96.80 INR  |         | • Anomaly Flags   |
                                                  | • R²: 0.9702      |         +-------------------+
                                                  +-------------------+
```

---

## 2. Core Architectural Subsystems

### 2.1 Presentation & Frontend Subsystem
* **Modern React 19 Core:** Utilizes concurrent rendering features, transitions, and suspense for optimal dashboard performance.
* **Role-Based Routing Guards (`ProtectedRoute`):** Guards individual dashboard trees (`/farmer/*`, `/merchant/*`, `/admin/*`) based on database profile roles and redirects unauthorized attempts to `/unauthorized`.
* **State Management via Specialized Context Providers:**
  * `UserContext`: Manages Supabase authentication state, JWT sessions, profile data, and seamless demo persona switching.
  * `ListingContext`: Manages farmer crop listings, real-time additions, status updates, and deletion.
  * `OrderContext`: Orchestrates transaction dispatch via the PostgreSQL `place_order` stored procedure.
  * `DemandContext`: Powers merchant procurement sourcing pipelines.
  * `NegotiationContext`: Facilitates interactive price negotiations and counter-offers between trading parties.
* **Error Resilience:** Top-level and component-level React Error Boundaries prevent entire dashboard crashes upon unexpected rendering faults.

### 2.2 Serverless API Subsystem
* **Vercel Serverless Edge Architecture:** Stateless API functions (`/api/predict`, `/api/insights`, `/api/assistant`) scaling dynamically with traffic.
* **Strict Zod Runtime Validation:** Every incoming request body is strictly parsed and sanitized against typed schemas prior to backend processing.
* **Controlled Error Abstraction:** Sanitized JSON error envelopes eliminate vulnerability disclosure from internal database connection strings or stack traces.

### 2.3 Hybrid AI & Machine Learning Subsystem
* **Supervised Regression Engine (Random Forest v3.0):**
  * Sourced from 16,380 real-world AGMARKNET wholesale mandi price records across 5 staple commodities and 6 key regional trading hubs.
  * Features 7-day and 30-day backward lag and moving-average transformations with strict temporal chronological train/test validation (March 19, 2026 split).
  * Validated at $R^2 = 0.9702$, MAE = 96.80 INR/Quintal, and MAPE = 5.13%.
* **Generative Reasoning Engine (Gemini 1.5 Flash):**
  * Provides contextual qualitative recommendations and trade advice tailored to user personas (`farmer`, `merchant`, `admin`).
  * Features resilient, deterministic fallbacks when external API limits are exceeded or network connectivity is severed.

### 2.4 Database & Security Subsystem
* **Managed PostgreSQL on Supabase:**
  * Strict foreign key cascades and integrity check constraints (`price > 0`, `quantity >= 0`, `buyer_id != seller_id`).
  * Cryptographic Row-Level Security (RLS) enforcing multi-tenant isolation at the database kernel level.
  * Concurrency safety guaranteed via `SELECT ... FOR UPDATE` row locks inside the `place_order` stored procedure, completely eliminating overselling under concurrent purchase attempts.

