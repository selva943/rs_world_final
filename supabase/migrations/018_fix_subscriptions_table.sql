-- ============================================================
-- Migration 018: Create/Fix subscriptions table (fully idempotent)
-- Safe to run even if table partially exists
-- ============================================================

-- 1. Ensure delivery_frequency enum exists with all values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_frequency') THEN
    CREATE TYPE delivery_frequency AS ENUM ('daily', 'alternate', 'weekly', 'monthly', 'custom');
  END IF;
END $$;

-- Add 'alternate' if the enum exists but is missing that value
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'alternate'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'delivery_frequency')
  ) THEN
    ALTER TYPE delivery_frequency ADD VALUE 'alternate';
  END IF;
END $$;

-- Ensure subscription_status enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');
  END IF;
END $$;

-- 2. Create subscriptions table (full definition, safe with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID,
  user_phone          TEXT DEFAULT '',
  product_id          UUID REFERENCES products(id) ON DELETE CASCADE,
  status              subscription_status DEFAULT 'active',
  frequency           delivery_frequency NOT NULL,
  quantity            INTEGER DEFAULT 1,
  total_per_delivery  NUMERIC DEFAULT 0,
  start_date          DATE DEFAULT CURRENT_DATE,
  next_delivery_date  DATE,
  days_of_week        INTEGER[] DEFAULT '{}',
  delivery_slot       TEXT DEFAULT '06:00 AM - 08:00 AM',
  address             TEXT,
  schedule            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add any missing columns to existing tables (safe with IF NOT EXISTS)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_phone TEXT DEFAULT '';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS days_of_week INTEGER[] DEFAULT '{}';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_delivery_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS total_per_delivery NUMERIC DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS delivery_slot TEXT DEFAULT '06:00 AM - 08:00 AM';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Relax NOT NULL constraints if they exist
ALTER TABLE subscriptions ALTER COLUMN total_per_delivery DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN total_per_delivery SET DEFAULT 0;

-- 5. Subscription deliveries table
CREATE TABLE IF NOT EXISTS subscription_deliveries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  order_id         UUID REFERENCES orders(id) ON DELETE SET NULL,
  delivery_date    DATE NOT NULL,
  status           TEXT DEFAULT 'pending',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subscription logs table
CREATE TABLE IF NOT EXISTS subscription_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  action           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RLS Policies (skip if they already exist)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Allow all subscriptions'
  ) THEN
    CREATE POLICY "Allow all subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_deliveries' AND policyname = 'Allow all deliveries'
  ) THEN
    CREATE POLICY "Allow all deliveries" ON subscription_deliveries FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 8. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

-- Verify result
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
