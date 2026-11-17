# HarvestHub – Entity-Relationship (ER) Diagram

**Document Version:** 3.0.0 (Review 3 Final Milestone)  
**Database Engine:** PostgreSQL 15+ (Supabase)  
**Date:** November 17, 2026  

---

## 1. Architectural Entity-Relationship Diagram

The diagram below reflects the exact schema, table relationships, foreign keys, and constraints implemented in `database/schema/supabase_init.sql` and `database/migrations/001_security_and_constraints_hardening.sql`:

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "authenticates (1:1)"
    PROFILES ||--o{ CROPS : "lists / owns (1:N)"
    PROFILES ||--o{ DEMANDS : "posts / sources (1:N)"
    PROFILES ||--o{ ORDERS : "buys as buyer_id (1:N)"
    PROFILES ||--o{ ORDERS : "sells as seller_id (1:N)"
    PROFILES ||--o{ OFFERS : "negotiates as buyer_id (1:N)"
    CROPS ||--o{ ORDERS : "transacted in (1:N)"
    CROPS ||--o{ OFFERS : "bid on as listing_id (1:N)"

    AUTH_USERS {
        uuid id PK
        string email
        string encrypted_password
        jsonb raw_user_meta_data
        timestamp created_at
    }

    PROFILES {
        uuid id PK,FK "references auth.users(id)"
        string name "User display name"
        string role "farmer | merchant | admin"
        string avatar_url "Optional avatar"
        timestamp created_at "Registration date"
    }

    CROPS {
        uuid id PK
        string name "Crop title"
        float price "Unit price (> 0)"
        int quantity "Available stock (>= 0)"
        string unit "kg | quintal | tonne"
        string location "Mandi / Farm location"
        uuid farmer_id FK "references profiles(id)"
        string description "Specifications"
        string_array images "Image URLs"
        string status "Active | Sold | Draft"
        timestamp created_at
    }

    DEMANDS {
        uuid id PK
        string crop_name "Required commodity"
        int quantity "Desired volume (> 0)"
        float budget "Max budget (> 0)"
        string location "Delivery destination"
        uuid merchant_id FK "references profiles(id)"
        string status "open | closed"
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid crop_id FK "references crops(id)"
        uuid buyer_id FK "references profiles(id)"
        uuid seller_id FK "references profiles(id)"
        int quantity "Ordered count (> 0)"
        float total_price "Total sum (> 0)"
        string status "pending | completed | shipped | cancelled"
        timestamp created_at
    }

    OFFERS {
        uuid id PK
        uuid listing_id FK "references crops(id)"
        uuid buyer_id FK "references profiles(id)"
        float price "Proposed price (> 0)"
        int quantity "Proposed quantity (> 0)"
        string message "Negotiation note"
        string status "Pending | Accepted | Rejected"
        timestamp created_at
    }
```

---

## 2. Relationship Cardinality Breakdown

1. **`auth.users` to `public.profiles` (1:1):**
   * Each authenticated user in Supabase has exactly one profile row created via the `handle_new_user` PostgreSQL trigger.
   * `ON DELETE CASCADE` ensures profile deletion if an auth account is purged.

2. **`public.profiles` to `public.crops` (1:N):**
   * A user with `role = 'farmer'` can own and publish multiple active crop listings.
   * `crops.farmer_id` links to `profiles.id`.

3. **`public.profiles` to `public.demands` (1:N):**
   * A user with `role = 'merchant'` can post multiple commodity procurement requirements.
   * `demands.merchant_id` links to `profiles.id`.

4. **`public.crops` to `public.orders` (1:N):**
   * A crop listing can be partially purchased across multiple orders until quantity is exhausted.
   * `ON DELETE SET NULL` preserves historical order financial records if a crop listing is subsequently removed.

5. **`public.crops` to `public.offers` (1:N):**
   * Merchants can submit price bids against an active crop listing.
   * `ON DELETE CASCADE` removes pending offers if the parent crop listing is deleted.

6. **Self-Purchase Prevention Rule:**
   * Enforced across `orders` by `CHECK (buyer_id != seller_id)` and checked dynamically inside `place_order` stored procedure.

