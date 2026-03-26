-- Function to safely increment coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Grant access to public (logic is controlled by RLS/API)
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO public;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO service_role;
