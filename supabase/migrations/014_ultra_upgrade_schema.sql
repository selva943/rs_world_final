-- 1. Update Order Status Enum
DO $$ BEGIN
    ALTER TYPE order_status ADD VALUE 'confirmed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE order_status ADD VALUE 'ready';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Order Priority Enum
DO $$ BEGIN
    ALTER TYPE order_priority ADD VALUE 'urgent';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Enhance Offers Table
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS offer_subtitle TEXT,
ADD COLUMN IF NOT EXISTS discount_text TEXT,
ADD COLUMN IF NOT EXISTS badge TEXT, -- e.g. "HOT DEAL", "NEW"
ADD COLUMN IF NOT EXISTS redirect_slug TEXT DEFAULT '/offers',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Ensure banner_image_url is compatible with multi-image (optional, keep for legacy)
-- The 'media' column will store ["url1", "url2"]

-- 4. Add Internal Notes to Orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 5. Add Timeline Tracking to Orders (as JSON for flexibility)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status_timeline JSONB DEFAULT '[]'::jsonb;
-- Example: [{"status": "pending", "time": "2026-03-19..."}, {"status": "confirmed", "time": "..."}]
