-- ============================================================
-- Migration 017: Add subscription fields to products table
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add allowed_frequencies column if it doesn't exist
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS allowed_frequencies TEXT[] DEFAULT '{}';

-- 2. Add subscription_options jsonb column if it doesn't exist
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subscription_options JSONB DEFAULT '{}'::jsonb;

-- 3. Seed subscription options from allowed_frequencies for existing records
-- (so existing data isn't lost if is_subscription_available is set)
UPDATE products
SET subscription_options = jsonb_build_object(
  'daily',   'daily'   = ANY(allowed_frequencies),
  'weekly',  'weekly'  = ANY(allowed_frequencies),
  'monthly', 'monthly' = ANY(allowed_frequencies),
  'alternate','alternate' = ANY(allowed_frequencies)
)
WHERE is_subscription_available = true
  AND allowed_frequencies IS NOT NULL
  AND array_length(allowed_frequencies, 1) > 0;

-- 4. Default: any product with is_subscription_available = true but no frequencies
-- gets daily + weekly enabled by default
UPDATE products
SET allowed_frequencies = ARRAY['daily', 'weekly']::TEXT[],
    subscription_options = '{"daily": true, "weekly": true, "monthly": false, "alternate": false}'::jsonb
WHERE is_subscription_available = true
  AND (allowed_frequencies IS NULL OR array_length(allowed_frequencies, 1) = 0);

-- Verify
SELECT id, name, is_subscription_available, allowed_frequencies, subscription_options
FROM products
WHERE is_subscription_available = true
LIMIT 10;
