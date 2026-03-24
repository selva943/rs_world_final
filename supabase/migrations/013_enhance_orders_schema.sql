-- 1. Create Order Priority Enum
DO $$ BEGIN
    CREATE TYPE order_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add New Tracking Columns to Orders Table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS priority order_priority NOT NULL DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS completion_at TIMESTAMPTZ;

-- 3. Optimization: Ensure status enum includes 'cancelled' and 'pending' 
-- (Migration 012 should have handled this, but we'll ensure it here for completeness)
DO $$ BEGIN
    ALTER TYPE order_status ADD VALUE 'pending';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE order_status ADD VALUE 'cancelled';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
