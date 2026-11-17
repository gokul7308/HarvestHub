-- ============================================================================
-- HARVESTHUB MIGRATION 001: SECURITY, RLS & CONSTRAINT HARDENING
-- Version: 3.0.0
-- Applied for: Review 3 Final Milestone
-- ============================================================================

-- 1. ADD CHECK CONSTRAINTS (DATA INTEGRITY)
DO $$
BEGIN
    -- Crops Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_crops_price_positive') THEN
        ALTER TABLE public.crops ADD CONSTRAINT chk_crops_price_positive CHECK (price > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_crops_quantity_nonnegative') THEN
        ALTER TABLE public.crops ADD CONSTRAINT chk_crops_quantity_nonnegative CHECK (quantity >= 0);
    END IF;

    -- Demands Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_demands_budget_positive') THEN
        ALTER TABLE public.demands ADD CONSTRAINT chk_demands_budget_positive CHECK (budget > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_demands_quantity_positive') THEN
        ALTER TABLE public.demands ADD CONSTRAINT chk_demands_quantity_positive CHECK (quantity > 0);
    END IF;

    -- Orders Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_price_positive') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_price_positive CHECK (total_price > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_quantity_positive') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_quantity_positive CHECK (quantity > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_no_self_purchase') THEN
        ALTER TABLE public.orders ADD CONSTRAINT chk_orders_no_self_purchase CHECK (buyer_id != seller_id);
    END IF;

    -- Offers Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_offers_price_positive') THEN
        ALTER TABLE public.offers ADD CONSTRAINT chk_offers_price_positive CHECK (price > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_offers_quantity_positive') THEN
        ALTER TABLE public.offers ADD CONSTRAINT chk_offers_quantity_positive CHECK (quantity > 0);
    END IF;
END $$;

-- 2. CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON public.crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_demands_merchant_id ON public.demands(merchant_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON public.offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers(buyer_id);

-- 3. HARDEN ROW-LEVEL SECURITY POLICIES (RBAC CROSS-VERIFICATION)

-- Drop overly permissive legacy policies if they exist
DROP POLICY IF EXISTS "Farmers can insert crops" ON public.crops;
DROP POLICY IF EXISTS "Merchants can post demands" ON public.demands;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;

-- Robust Crops Policies
CREATE POLICY "Verified farmers can insert crops" ON public.crops
FOR INSERT WITH CHECK (
    auth.uid() = farmer_id AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('farmer', 'admin')
    )
);

CREATE POLICY "Farmers or admins can update crops" ON public.crops
FOR UPDATE USING (
    auth.uid() = farmer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Farmers or admins can delete crops" ON public.crops
FOR DELETE USING (
    auth.uid() = farmer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Robust Demands Policies
CREATE POLICY "Verified merchants can post demands" ON public.demands
FOR INSERT WITH CHECK (
    auth.uid() = merchant_id AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('merchant', 'admin')
    )
);

-- Robust Orders Policies
CREATE POLICY "Verified buyers can create orders without self-purchasing" ON public.orders
FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND
    buyer_id != seller_id
);

CREATE POLICY "Orders viewable by parties or admin" ON public.orders
FOR SELECT USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. ATOMIC ORDER TRANSACTIONS WITH CONCURRENCY LOCKING & GUARDS
CREATE OR REPLACE FUNCTION public.place_order(
    p_crop_id UUID,
    p_quantity INTEGER,
    p_total_price FLOAT
) RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_crop public.crops%ROWTYPE;
    v_order public.orders;
    v_buyer_id UUID;
BEGIN
    -- 1. Ensure user is authenticated
    v_buyer_id := auth.uid();
    IF v_buyer_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: User is not logged in';
    END IF;

    -- 2. Input validation
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Invalid order quantity: Must be greater than 0';
    END IF;

    IF p_total_price <= 0 THEN
        RAISE EXCEPTION 'Invalid order price: Must be greater than 0';
    END IF;

    -- 3. Lock the crop row for concurrency safety (SELECT ... FOR UPDATE prevents race conditions)
    SELECT * INTO v_crop
    FROM public.crops
    WHERE id = p_crop_id AND status = 'Active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crop listing not found or not active';
    END IF;

    -- 4. Prevent self-purchase
    IF v_crop.farmer_id = v_buyer_id THEN
        RAISE EXCEPTION 'Security restriction: Self-purchases are prohibited';
    END IF;

    -- 5. Inventory check (prevents overselling)
    IF v_crop.quantity < p_quantity THEN
        RAISE EXCEPTION 'Insufficient inventory: Requested %, available %', p_quantity, v_crop.quantity;
    END IF;

    -- 6. Atomically deduct inventory
    UPDATE public.crops
    SET quantity = quantity - p_quantity,
        status = CASE WHEN quantity - p_quantity = 0 THEN 'Sold' ELSE status END
    WHERE id = p_crop_id;

    -- 7. Persist the order
    INSERT INTO public.orders (crop_id, buyer_id, seller_id, quantity, total_price, status)
    VALUES (p_crop_id, v_buyer_id, v_crop.farmer_id, p_quantity, p_total_price, 'pending')
    RETURNING * INTO v_order;

    RETURN v_order;
END;
$$;

