-- FIX PRODUCTS SCHEMA: Add missing columns
-- Run this after CHECK_SCHEMA.sql to see what's missing

-- Add missing columns to products table if they don't exist
DO $$
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Power Tools';
    END IF;
    
    -- Add wholesale_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'wholesale_price') THEN
        ALTER TABLE products ADD COLUMN wholesale_price NUMERIC;
    END IF;
    
    -- Add image_url column if it doesn't exist (might be named 'image')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
            ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop';
        ELSE
            -- Rename image to image_url for consistency
            ALTER TABLE products RENAME COLUMN image TO image_url;
        END IF;
    END IF;
    
    -- Add in_stock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
END $$;

-- Fix rental_tools schema too
DO $$
BEGIN
    -- Add rent_per_hour column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'rent_per_hour') THEN
        ALTER TABLE rental_tools ADD COLUMN rent_per_hour NUMERIC;
    END IF;
    
    -- Add image_url column if it doesn't exist (might be named 'image')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'image_url') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'image') THEN
            ALTER TABLE rental_tools ADD COLUMN image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop';
        ELSE
            -- Rename image to image_url for consistency
            ALTER TABLE rental_tools RENAME COLUMN image TO image_url;
        END IF;
    END IF;
    
    -- Add deposit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'deposit') THEN
        ALTER TABLE rental_tools ADD COLUMN deposit NUMERIC DEFAULT 0;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'description') THEN
        ALTER TABLE rental_tools ADD COLUMN description TEXT;
    END IF;
END $$;

-- Test the fixed schema
SELECT 'Schema fixed successfully' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;
