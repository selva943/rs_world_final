-- ==========================================
-- Migration 023: Advanced Promotions
-- ==========================================

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('flat', 'percent', 'free_delivery')),
    value NUMERIC NOT NULL DEFAULT 0,
    min_order_amount NUMERIC NOT NULL DEFAULT 0,
    max_discount NUMERIC,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    per_user_limit INTEGER NOT NULL DEFAULT 1,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Coupon Usage Table
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID, 
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enhance Offers Table
-- We add the new logic fields requested for the scalable offer engine.
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS logic_type TEXT CHECK (logic_type IN ('percentage', 'bogo', 'free_delivery', 'bundle'));
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS category_id TEXT; 
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Backward compatibility: Sync name to title if name is present
UPDATE public.offers SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- 4. Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Coupons
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons" ON public.coupons
    FOR SELECT TO public
    USING (is_active = true AND (valid_to IS NULL OR valid_to > NOW()));

DROP POLICY IF EXISTS "Admin manage promotions" ON public.coupons;
CREATE POLICY "Admin manage promotions" ON public.coupons
    FOR ALL TO authenticated
    USING (true);

-- 6. Policies for Usage
DROP POLICY IF EXISTS "Users can record coupon usage" ON public.coupon_usage;
CREATE POLICY "Users can record coupon usage" ON public.coupon_usage
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can check their usage" ON public.coupon_usage;
CREATE POLICY "Public can check their usage" ON public.coupon_usage
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Admin manage usage" ON public.coupon_usage;
CREATE POLICY "Admin manage usage" ON public.coupon_usage
    FOR ALL TO authenticated
    USING (true);
