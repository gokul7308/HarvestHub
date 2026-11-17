# HarvestHub – Database Schema & Data Dictionary

**Document Version:** 3.0.0 (Review 3 Final Milestone)  
**Database Engine:** PostgreSQL 15+ (Managed via Supabase)  
**Schema Architecture:** Relational Schema with Cryptographic Row-Level Security (RLS)  
**Date:** November 17, 2026  

---

## 1. Relational Entity Overview

HarvestHub’s database consists of 5 core application tables, 1 auth sync trigger, 1 atomic stored procedure, and 7 performance indexes.

```
       auth.users
           │ (1:1 ON DELETE CASCADE)
           ▼
     public.profiles ──(1:N)──► public.crops ──(1:N)──► public.offers
           │                         │
           │ (1:N)                   │ (1:N)
           ▼                         ▼
     public.demands            public.orders
```

---

## 2. Table Specifications & Columns

### 2.1 Table: `public.profiles`
Synchronizes user identity and role assignment with Supabase `auth.users`.

| Column | Type | Nullable | Default | Description | Constraints |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `UUID` | **NO** | - | Primary Key referencing `auth.users(id)` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `name` | `TEXT` | **NO** | - | User full display name | - |
| `role` | `TEXT` | **NO** | `'farmer'` | User operational role | `CHECK (role IN ('farmer', 'merchant', 'admin'))` |
| `avatar_url` | `TEXT` | YES | `NULL` | Optional avatar image path or URL | - |
| `created_at` | `TIMESTAMPTZ`| **NO** | `NOW()` | Profile registration timestamp | - |

---

### 2.2 Table: `public.crops`
Contains agricultural crop listings posted by verified farmers.

| Column | Type | Nullable | Default | Description | Constraints |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `UUID` | **NO** | `gen_random_uuid()` | Listing identifier | `PRIMARY KEY` |
| `name` | `TEXT` | **NO** | - | Crop commodity title | - |
| `price` | `FLOAT` | **NO** | - | Unit price | `CHECK (price > 0)` |
| `quantity` | `INTEGER` | **NO** | - | Available stock count | `CHECK (quantity >= 0)` |
| `unit` | `TEXT` | YES | `'kg'` | Measurement metric (`kg`, `quintal`, `tonne`) | - |
| `location` | `TEXT` | **NO** | - | Farm or mandi pickup location | - |
| `farmer_id` | `UUID` | YES | `NULL` | Seller profile identifier | `REFERENCES public.profiles(id) ON DELETE CASCADE` |
| `description` | `TEXT` | YES | `NULL` | Agricultural specifications / quality grade | - |
| `images` | `TEXT[]` | YES | `'{}'` | Array of public asset image URLs | - |
| `status` | `TEXT` | YES | `'Active'` | Listing lifecycle state | `CHECK (status IN ('Active', 'Sold', 'Draft'))` |
| `created_at` | `TIMESTAMPTZ`| **NO** | `NOW()` | Listing creation timestamp | - |

---

### 2.3 Table: `public.demands`
Sourcing requirements posted by agricultural merchants seeking specific crops.

| Column | Type | Nullable | Default | Description | Constraints |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `UUID` | **NO** | `gen_random_uuid()` | Demand identifier | `PRIMARY KEY` |
| `crop_name` | `TEXT` | **NO** | - | Required commodity | - |
| `quantity` | `INTEGER` | **NO** | - | Desired procurement volume | `CHECK (quantity > 0)` |
| `budget` | `FLOAT` | **NO** | - | Maximum purchase budget | `CHECK (budget > 0)` |
| `location` | `TEXT` | YES | `NULL` | Delivery destination | - |
| `merchant_id` | `UUID` | YES | `NULL` | Buyer profile identifier | `REFERENCES public.profiles(id) ON DELETE CASCADE` |
| `status` | `TEXT` | YES | `'open'` | Demand fulfillment status | `CHECK (status IN ('open', 'closed'))` |
| `created_at` | `TIMESTAMPTZ`| **NO** | `NOW()` | Demand creation timestamp | - |

---

### 2.4 Table: `public.orders`
Executes purchase transactions between buyers and sellers.

| Column | Type | Nullable | Default | Description | Constraints |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `UUID` | **NO** | `gen_random_uuid()` | Order identifier | `PRIMARY KEY` |
| `crop_id` | `UUID` | YES | `NULL` | Purchased crop listing | `REFERENCES public.crops(id) ON DELETE SET NULL` |
| `buyer_id` | `UUID` | YES | `NULL` | Purchasing merchant profile | `REFERENCES public.profiles(id) ON DELETE CASCADE` |
| `seller_id` | `UUID` | YES | `NULL` | Selling farmer profile | `REFERENCES public.profiles(id) ON DELETE CASCADE` |
| `quantity` | `INTEGER` | **NO** | - | Ordered quantity | `CHECK (quantity > 0)` |
| `total_price` | `FLOAT` | **NO** | - | Committed transaction total | `CHECK (total_price > 0)` |
| `status` | `TEXT` | YES | `'pending'` | Order status | `CHECK (status IN ('pending', 'completed', 'shipped', 'cancelled'))` |
| `created_at` | `TIMESTAMPTZ`| **NO** | `NOW()` | Order placement timestamp | - |

*Integrity Constraint:* `CHECK (buyer_id != seller_id)` prevents self-purchasing transactions.

---

### 2.5 Table: `public.offers`
Facilitates price negotiations and counter-offers prior to formal order placement.

| Column | Type | Nullable | Default | Description | Constraints |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `UUID` | **NO** | `gen_random_uuid()` | Offer identifier | `PRIMARY KEY` |
| `listing_id` | `UUID` | YES | `NULL` | Target crop listing | `REFERENCES public.crops(id) ON DELETE CASCADE` |
| `buyer_id` | `UUID` | YES | `NULL` | Negotiating buyer profile | `REFERENCES public.profiles(id) ON DELETE CASCADE` |
| `price` | `FLOAT` | **NO** | - | Proposed unit price | `CHECK (price > 0)` |
| `quantity` | `INTEGER` | **NO** | - | Proposed quantity | `CHECK (quantity > 0)` |
| `message` | `TEXT` | YES | `NULL` | Optional buyer negotiation note | - |
| `status` | `TEXT` | YES | `'Pending'` | Negotiation state | `CHECK (status IN ('Pending', 'Accepted', 'Rejected'))` |
| `created_at` | `TIMESTAMPTZ`| **NO** | `NOW()` | Offer creation timestamp | - |

---

## 3. Database Indexes

Performance indexes are created across foreign key foreign keys and status queries:

1. `idx_crops_farmer_id` ON `public.crops(farmer_id)`
2. `idx_crops_status` ON `public.crops(status)`
3. `idx_orders_buyer_id` ON `public.orders(buyer_id)`
4. `idx_orders_seller_id` ON `public.orders(seller_id)`
5. `idx_demands_merchant_id` ON `public.demands(merchant_id)`
6. `idx_offers_listing_id` ON `public.offers(listing_id)`
7. `idx_offers_buyer_id` ON `public.offers(buyer_id)`

---

## 4. Stored Procedures & Triggers

### 4.1 Trigger: `handle_new_user`
* **Trigger Event:** `AFTER INSERT ON auth.users`
* **Function:** Extracts `raw_user_meta_data->>'full_name'` and `role` to automatically create an initial `public.profiles` row under `SECURITY DEFINER`.

### 4.2 ACID Stored Procedure: `place_order`
* **Signature:** `place_order(p_crop_id UUID, p_quantity INTEGER, p_total_price FLOAT) RETURNS public.orders`
* **Concurrency Protection:** Implements pessimistic row-level locking via `SELECT ... FOR UPDATE` on `public.crops`.
* **Guarantees:**
  * Checks authentication (`auth.uid() IS NOT NULL`).
  * Asserts positive inputs (`p_quantity > 0`, `p_total_price > 0`).
  * Rejects self-purchase transactions (`v_crop.farmer_id != auth.uid()`).
  * Rejects overdraws (`v_crop.quantity >= p_quantity`).
  * Deducts inventory atomically and marks as `'Sold'` when stock hits 0.
  * Persists and returns the new order in a single atomic transaction.

