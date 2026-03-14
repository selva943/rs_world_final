-- Database Schema Fix Script
-- This script will help fix the missing columns issue

-- First, let's check what columns actually exist in the offers table
-- You can run this in Supabase SQL editor:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'offers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If the offers table exists but has different column names, 
-- you might need to rename columns or add missing ones:

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check and add offer_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'offer_name' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE offers ADD COLUMN offer_name VARCHAR(255);
        RAISE NOTICE 'Added offer_name column';
    END IF;

    -- Check and add offer_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'offer_type' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE offers ADD COLUMN offer_type VARCHAR(50) 
        CHECK (offer_type IN ('product', 'category', 'combo'));
        RAISE NOTICE 'Added offer_type column';
    END IF;

    -- Check and add offer_description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'offer_description' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE offers ADD COLUMN offer_description TEXT;
        RAISE NOTICE 'Added offer_description column';
    END IF;

    -- Check and add discount_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'discount_type' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE offers ADD COLUMN discount_type VARCHAR(50) 
        CHECK (discount_type IN ('percentage', 'fixed'));
        RAISE NOTICE 'Added discount_type column';
    END IF;

    -- Check and add discount_value column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'discount_value' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE offers ADD COLUMN discount_value DECIMAL(10,2);
        RAISE NOTICE 'Added discount_value column';
    END IF;

    -- Check and add banner_image_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'banner_image_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE offers ADD COLUMN banner_image_url TEXT;
        RAISE NOTICE 'Added banner_image_url column';
    END IF;
END $$;

-- Alternative approach: Drop and recreate the table completely
-- WARNING: This will delete all existing data!
-- Uncomment the following lines ONLY if you don't need existing data:

/*
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS offer_products CASCADE;
DROP TABLE IF EXISTS offer_categories CASCADE;
DROP TABLE IF EXISTS offer_combos CASCADE;
DROP TABLE IF EXISTS offer_usage CASCADE;

-- Then recreate everything with the correct schema
-- (Copy the full schema from supabase-migrations.sql here)
*/

-- Check if related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'offer_%'
ORDER BY table_name;
