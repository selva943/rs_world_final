-- Update offers table with new fields for the enhanced offer system
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_text TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS redirect_slug TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Ensure is_active is handled (currently status might be boolean)
-- In migration 007, offers.status was BOOLEAN NOT NULL DEFAULT true
-- We'll keep status as boolean but maybe rename to is_active for clarity if needed, 
-- but let's stick to what's easiest to map.

-- Add index on priority and status for faster fetching
CREATE INDEX IF NOT EXISTS idx_offers_priority_status ON offers(priority DESC, status);

-- Add index on redirect_slug
CREATE INDEX IF NOT EXISTS idx_offers_slug ON offers(redirect_slug);
