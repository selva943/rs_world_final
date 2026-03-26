-- Migration: Service Booking Engine Upgrades
-- Description: Adds smart fields for slot management, dynamic pricing, and service area validation.

BEGIN;

-- 1. ENHANCE SERVICES TABLE
ALTER TABLE services 
  ADD COLUMN IF NOT EXISTS max_bookings_per_slot INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS service_pincodes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS peak_multiplier NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS weekend_multiplier NUMERIC DEFAULT 1.1,
  ADD COLUMN IF NOT EXISTS same_day_multiplier NUMERIC DEFAULT 1.15;

-- 2. ENHANCE SERVICE_BOOKINGS TABLE
ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS total_price NUMERIC,
  ADD COLUMN IF NOT EXISTS user_pincode TEXT,
  ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS feedback TEXT,
  ADD COLUMN IF NOT EXISTS worker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Update existing bookings (Optional: set total_price to service price if null)
UPDATE service_bookings sb
SET total_price = s.price
FROM services s
WHERE sb.service_id = s.id AND sb.total_price IS NULL;

COMMIT;
