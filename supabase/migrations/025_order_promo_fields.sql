-- Migration 025: Add discount tracking to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS applied_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL;

-- Enable RLS for newly added columns if needed (orders table already has RLS)
