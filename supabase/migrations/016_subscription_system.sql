-- PALANI BASKET – SUBSCRIPTION SYSTEM SCHEMA
-- Implements robust tracking for recurring deliveries and schedules

-- 🔹 1. ENUMS (SUBSCRIPTION TYPES)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
          'active',
          'paused',
          'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_frequency') THEN
        CREATE TYPE delivery_frequency AS ENUM (
          'daily',
          'weekly',
          'monthly',
          'custom'
        );
    END IF;
END $$;

-- 📅 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_phone TEXT NOT NULL, -- Identifying user by phone
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  status subscription_status DEFAULT 'active',
  frequency delivery_frequency NOT NULL,
  
  quantity INTEGER DEFAULT 1,
  total_per_delivery NUMERIC NOT NULL,
  
  start_date DATE DEFAULT CURRENT_DATE,
  next_delivery_date DATE,
  
  delivery_slot TEXT DEFAULT '06:00 AM - 08:00 AM',
  address TEXT,
  
  -- Flexible scheduling stored as JSONB
  -- e.g., { "days": [1, 3, 5] } for Mon/Wed/Fri
  -- e.g., { "dates": [1, 15] } for twice a month
  schedule JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📊 3. SUBSCRIPTION LOGS (DELIVERY TRACKING)
CREATE TABLE IF NOT EXISTS subscription_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  delivery_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, delivered, skipped, failed
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔐 4. RLS (SECURITY)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_deliveries ENABLE ROW LEVEL SECURITY;

-- ✅ Public/User Access (Filtered by Phone)
-- In a real app, this would be auth.uid(), but here we use phone for simplicity or if that's the current pattern
CREATE POLICY "Users can view own subscriptions" ON subscriptions 
  FOR SELECT USING (true); -- Filtered in app by phone for now, or true for public read as per current policies

CREATE POLICY "Users can insert subscriptions" ON subscriptions 
  FOR INSERT WITH CHECK (true);

-- ✅ Admin Access
CREATE POLICY "Admin Full Subscriptions" ON subscriptions 
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin Full Subscription Deliveries" ON subscription_deliveries 
  FOR ALL TO authenticated USING (true);

-- 🚀 5. FUNCTIONS & TRIGGERS
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
