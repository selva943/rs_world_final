-- Fix: Add 'pending' to the order_status enum type
-- This must be run outside of a multi-statement transaction in some environments, 
-- but in Supabase SQL editor it works fine as a standalone command.

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending';

-- Also ensure 'cancelled' is there if it was missing
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Note: We no longer need the CHECK constraint if we are using an ENUM.
-- If the column was previously TEXT, we would have used the constraint.
-- Since it's an ENUM, the type itself handles the validation.
