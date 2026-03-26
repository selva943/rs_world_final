-- ==========================================
-- Migration 026: Soft Delete Support
-- ==========================================

BEGIN;

-- Add is_deleted column to core tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for performance on soft deleted records
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON public.products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_categories_is_deleted ON public.categories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_recipes_is_deleted ON public.recipes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_offers_is_deleted ON public.offers(is_deleted);
CREATE INDEX IF NOT EXISTS idx_services_is_deleted ON public.services(is_deleted);
CREATE INDEX IF NOT EXISTS idx_coupons_is_deleted ON public.coupons(is_deleted);

-- Update RLS policies to exclude deleted records by default for non-admin queries
-- Products
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (is_deleted = false AND is_active = true);

-- Offers
DROP POLICY IF EXISTS "Public Read Offers" ON public.offers;
CREATE POLICY "Public Read Offers" ON public.offers FOR SELECT USING (is_deleted = false AND is_active = true);

-- Coupons
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons" ON public.coupons
    FOR SELECT TO public
    USING (is_deleted = false AND is_active = true AND (valid_to IS NULL OR valid_to > NOW()));

COMMIT;
