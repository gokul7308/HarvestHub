-- HARVESTHUB SUPABASE INITIALIZATION SCHEMA

-- 1. Profiles Table (Auth Sync)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'merchant', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crops Table (Listings)
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT 'kg',
    location TEXT NOT NULL,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Demands Table (Sourcing)
CREATE TABLE IF NOT EXISTS public.demands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    budget FLOAT NOT NULL,
    location TEXT,
    merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table (Transactions)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    total_price FLOAT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'shipped', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Offers/Negotiations
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SECURITY - Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Profiles: Users can view all profiles but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Crops: Viewable by all, managed by owners or admins
CREATE POLICY "Crops viewable by all" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Farmers can insert crops" ON public.crops FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own crops" ON public.crops FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own crops" ON public.crops FOR DELETE USING (auth.uid() = farmer_id);

-- Demands: Viewable by all, managed by merchants
CREATE POLICY "Demands viewable by all" ON public.demands FOR SELECT USING (true);
CREATE POLICY "Merchants can post demands" ON public.demands FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchants can manage own demands" ON public.demands FOR UPDATE USING (auth.uid() = merchant_id);

-- Orders: Managed by buyers and sellers
CREATE POLICY "Orders viewable by buyer and seller" ON public.orders FOR SELECT USING (
    auth.uid() = buyer_id OR 
    EXISTS (SELECT 1 FROM public.crops WHERE id = crop_id AND farmer_id = auth.uid())
);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 8. AUTOMATION - Auto-create profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'farmer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
