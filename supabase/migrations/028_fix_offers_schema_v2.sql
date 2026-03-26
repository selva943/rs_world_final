-- ==========================================
-- Migration 028: Fix Offers Schema v2
-- Adds missing columns for the Advanced Promotion Engine
-- ==========================================

BEGIN;

-- Add missing columns to public.offers
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS description TEXT;

-- Convert offer_type from enum to text if it exists as enum
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'offer_type' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE public.offers ALTER COLUMN offer_type TYPE TEXT USING offer_type::TEXT;
    END IF;
END $$;

ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS offer_type TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS max_discount NUMERIC DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS buy_quantity INTEGER DEFAULT 1;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS get_quantity INTEGER DEFAULT 1;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all_users';
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS total_usage_limit INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT 1;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS allow_with_coupon BOOLEAN DEFAULT FALSE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS logic_type TEXT;

-- Update logic_type check constraint to include 'flat'
ALTER TABLE public.offers DROP CONSTRAINT IF EXISTS offers_logic_type_check;
ALTER TABLE public.offers ADD CONSTRAINT offers_logic_type_check CHECK (logic_type IN ('percentage', 'bogo', 'free_delivery', 'bundle', 'flat'));

ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Update existing records if necessary
-- For example, sync name to title if title is null (already done in 023 but good to be safe)
UPDATE public.offers SET title = name WHERE title IS NULL AND name IS NOT NULL;

COMMIT;
