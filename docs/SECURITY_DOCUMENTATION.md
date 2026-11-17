# HarvestHub – Security Architecture & Authorization Documentation

**Document Version:** 3.0.0 (Review 3 Final Milestone)  
**Security Scope:** Authentication, RBAC, Row-Level Security (RLS), Concurrency Locks, and Data Integrity  
**Author:** Principal Cybersecurity & Software Architect  
**Date:** November 17, 2026  

---

## 1. Security Architecture Overview

HarvestHub implements a **defense-in-depth security model** where frontend user experience controls are strictly segregated from backend cryptographic access controls.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|  - React 19 ProtectedRoute Route Guards                                 |
|  - Zod Input Sanitization (Pre-flight validation)                       |
|  - UI Persona Adaptive Rendering                                        |
+-------------------------------------------------------------------------+
                                    │
                         HTTPS Encrypted Bearer JWT
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                           SERVERLESS API LAYER                          |
|  - Strict Zod Runtime Schema Validation                                 |
|  - Zero Secret Leakage (Service keys NEVER bundled in client dist)      |
|  - Controlled Error Codes (No stack trace exposure)                     |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                         SUPABASE POSTGRESQL LAYER                       |
|  - Cryptographic Row-Level Security (RLS) on all 5 operational tables   |
|  - Positive Numeric CHECK Constraints                                   |
|  - ACID Stored Procedures with Row Locks (SELECT ... FOR UPDATE)        |
|  - Self-Purchase Prevention at Database Engine Level                    |
+-------------------------------------------------------------------------+
```

---

## 2. Authentication & Identity Management

HarvestHub supports two verified authentication modes:

1. **Supabase Cloud Authentication (Production Mode):**
   * **Passwordless Email OTP:** Utilizes 6-digit one-time tokens transmitted via secure SMTP, eliminating credential credential-stuffing and weak password vulnerabilities.
   * **Session Persistence:** Managed securely via `@supabase/supabase-js` with automated token refresh cycles.
   * **User Profile Synchronization:** The PostgreSQL trigger `on_auth_user_created` automatically binds each new authentication record to a trusted `public.profiles` entity with a role assignment.

2. **Isolated Instant Demo Mode (Evaluator Sandbox):**
   * Deterministic personas (`demo-farmer`, `demo-merchant`, `demo-admin`) allowing evaluators to immediately inspect all role perspectives without third-party email delays.
   * Isolated state safeguards that never pollute production database records.

---

## 3. Role-Based Access Control (RBAC) Matrix

Access permissions are enforced across three user roles: **FARMER**, **MERCHANT**, and **ADMIN**.

| Resource / Action | FARMER | MERCHANT | ADMIN | Enforced At |
| :--- | :---: | :---: | :---: | :--- |
| **View Dashboard** | Own Farmer Dashboard | Own Merchant Dashboard | Full Admin Console | Frontend Guard + DB |
| **Browse Marketplace** | Yes | Yes | Yes | Public SELECT Policy |
| **Create Crop Listing** | **YES** | No | Yes (Emergency Override) | `crops` INSERT Policy |
| **Edit Own Crop Listing** | **YES** | No | **YES** | `crops` UPDATE Policy |
| **Delete Own Crop Listing**| **YES** | No | **YES** | `crops` DELETE Policy |
| **Post Sourcing Demand** | No | **YES** | **YES** | `demands` INSERT Policy |
| **Initiate Purchase / Order** | No | **YES** | No | `orders` INSERT Policy + RPC |
| **Purchase Own Listing** | **BLOCKED** | **BLOCKED** | **BLOCKED** | `place_order` Guard + Check |
| **Accept/Reject Negotiation**| **YES** (Seller) | No | No | `offers` UPDATE Policy |
| **View Order Records** | Own (As Seller) | Own (As Buyer) | **ALL Platform Orders** | `orders` SELECT Policy |
| **View System Audit Stats** | No | No | **YES** | Service Key / Admin Policy |

> [!IMPORTANT]
> Frontend route protection in `<ProtectedRoute>` exists strictly for navigational user experience. Under no circumstances does the server or database trust client role claims; all row permissions verify the trusted `public.profiles` record linked to `auth.uid()`.

---

## 4. Row-Level Security (RLS) Policy Specifications

Row-Level Security is enabled on 100% of the platform's database tables.

### 4.1 `public.crops` (Listings)
* **SELECT:** `CREATE POLICY "Crops viewable by all" ON public.crops FOR SELECT USING (true);`
* **INSERT:**
  ```sql
  CREATE POLICY "Verified farmers can insert crops" ON public.crops
  FOR INSERT WITH CHECK (
      auth.uid() = farmer_id AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('farmer', 'admin'))
  );
  ```
* **UPDATE / DELETE:**
  ```sql
  CREATE POLICY "Farmers or admins can update crops" ON public.crops
  FOR UPDATE USING (
      auth.uid() = farmer_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  ```

### 4.2 `public.demands` (Merchant Sourcing)
* **SELECT:** Viewable by all authenticated users to allow farmers to fulfill demands.
* **INSERT:**
  ```sql
  CREATE POLICY "Verified merchants can post demands" ON public.demands
  FOR INSERT WITH CHECK (
      auth.uid() = merchant_id AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('merchant', 'admin'))
  );
  ```

### 4.3 `public.orders` (Transactions)
* **INSERT:**
  ```sql
  CREATE POLICY "Verified buyers can create orders without self-purchasing" ON public.orders
  FOR INSERT WITH CHECK (
      auth.uid() = buyer_id AND buyer_id != seller_id
  );
  ```
* **SELECT:**
  ```sql
  CREATE POLICY "Orders viewable by parties or admin" ON public.orders
  FOR SELECT USING (
      auth.uid() = buyer_id OR
      auth.uid() = seller_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  ```

---

## 5. Database Constraints & Data Integrity

To prevent negative values or data corruption, SQL constraints are applied at the database engine level:

```sql
ALTER TABLE public.crops ADD CONSTRAINT chk_crops_price_positive CHECK (price > 0);
ALTER TABLE public.crops ADD CONSTRAINT chk_crops_quantity_nonnegative CHECK (quantity >= 0);
ALTER TABLE public.demands ADD CONSTRAINT chk_demands_budget_positive CHECK (budget > 0);
ALTER TABLE public.demands ADD CONSTRAINT chk_demands_quantity_positive CHECK (quantity > 0);
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_price_positive CHECK (total_price > 0);
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_quantity_positive CHECK (quantity > 0);
ALTER TABLE public.orders ADD CONSTRAINT chk_orders_no_self_purchase CHECK (buyer_id != seller_id);
ALTER TABLE public.offers ADD CONSTRAINT chk_offers_price_positive CHECK (price > 0);
ALTER TABLE public.offers ADD CONSTRAINT chk_offers_quantity_positive CHECK (quantity > 0);
```

---

## 6. Atomic Transaction Concurrency (`place_order`)

To prevent overselling under high-concurrency race conditions (e.g. multiple merchants attempting to purchase the last available crop inventory simultaneously), order creation is encapsulated in a PostgreSQL stored procedure executing under `SECURITY DEFINER`:

1. **Authentication Verification:** Verifies caller `auth.uid()` is present.
2. **Numeric Validation:** Enforces `quantity > 0` and `total_price > 0`.
3. **Pessimistic Row Lock (`SELECT ... FOR UPDATE`):** Locks the specific crop row until transaction commit. Concurrent transactions targeting the same crop must wait in queue.
4. **Self-Purchase Prevention:** Asserts `v_crop.farmer_id != v_buyer_id`.
5. **Inventory Sufficiency Verification:** Rejects purchase if requested quantity exceeds current inventory.
6. **Atomic Inventory Deduction:** Decrements quantity and marks status as `'Sold'` if inventory reaches zero.
7. **Order Record Persistence:** Inserts order and returns the committed record.

---

## 7. Credential Protection & Secret Management

* **Frontend Code:** Contains ONLY public configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The public anon key operates strictly within RLS policy permissions.
* **Serverless Backend:** High-privilege keys (`SUPABASE_SERVICE_KEY`, `AI_API_KEY`) are stored solely in environment variables and never exposed to client browsers or bundled in Vite production builds.
* **Git Hygiene:** `.env` and `.env.local` are excluded via `.gitignore`.

