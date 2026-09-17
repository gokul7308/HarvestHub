# Security Overview

HarvestHub prioritizes data integrity and security across the frontend, API, and database layers.

## Authentication & Authorization
- **Authentication**: Managed via Supabase Auth. Passwords and credentials are not handled directly by the frontend.
- **Role-Based Access Control (RBAC)**: Users are assigned roles (`farmer`, `merchant`, `admin`).
- **Protected Routes**: The React frontend enforces route protection (`ProtectedRoute.tsx`), preventing users from accessing unauthorized views.

## Row Level Security (RLS)
The database schema (`database/schema/supabase_init.sql`) defines explicit Supabase RLS policies for the following tables. Note: These policies require deploying the `supabase_init.sql` script to your Supabase instance to take effect in production.

1. **Profiles (`public.profiles`)**: Viewable by everyone. Users can only insert/update their own profile (`auth.uid() = id`). Admins can view everything.
2. **Crops (`public.crops`)**: Viewable by all. Farmers can only insert, update, and delete their own crop listings (`auth.uid() = farmer_id`). Admins have full management access.
3. **Demands (`public.demands`)**: Viewable by all. Merchants can only insert and manage their own demands (`auth.uid() = merchant_id`). Admins have full management access.
4. **Orders (`public.orders`)**: Viewable only by the specific buyer and seller involved. Buyers can create orders (`auth.uid() = buyer_id`).
5. **Offers (`public.offers`)**: Viewable only by the specific buyer and seller involved. Buyers can create offers; sellers (farmers who own the crop listing) can update offer statuses.

## Data Validation
- **Frontend/Backend Validation**: All critical payloads (AI predictions, forms) are validated against strict Zod schemas before processing, ensuring malformed or malicious data is rejected.
- **Secrets Management**: No API keys (e.g., `AI_API_KEY`) or service role keys are exposed in the client. The frontend only holds safe, public keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) injected via environment variables.

## Future Enhancements
- Rate limiting for AI endpoints to prevent abuse.
- End-to-end integration testing for security policies.
