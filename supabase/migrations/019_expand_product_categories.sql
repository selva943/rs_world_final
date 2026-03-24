-- ============================================================
-- Migration 019: Expand product_category enum
-- Adding missing categories to prevent database insertion errors.
-- Safe and idempotent using DO blocks.
-- ============================================================

DO $$
BEGIN
    -- Check if 'grocery' exists in the enum, add if not
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'grocery' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')
    ) THEN
        ALTER TYPE product_category ADD VALUE 'grocery';
    END IF;

    -- Check if 'dairy' exists, add if not
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'dairy' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')
    ) THEN
        ALTER TYPE product_category ADD VALUE 'dairy';
    END IF;

    -- Check if 'meat-fish' exists, add if not
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'meat-fish' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')
    ) THEN
        ALTER TYPE product_category ADD VALUE 'meat-fish';
    END IF;
END
$$;
