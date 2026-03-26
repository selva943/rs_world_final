-- ==========================================
-- Migration 027: Production Coupon Engine
-- ==========================================

BEGIN;

-- 1. Standardize Usage Table
-- We rename coupon_usage to coupon_usages for convention if it exists,,
-- or create the new improved structure.
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID, 
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy data if the old table exists (safe migration)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'coupon_usage') THEN
        INSERT INTO public.coupon_usages (id, coupon_id, user_id, order_id, used_at)
        SELECT id, coupon_id, user_id, order_id, used_at FROM public.coupon_usage
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 2. Create RPC: Validate Coupon
-- Returns a structured JSON object with { valid, message, discount, final_total, coupon_data }
CREATE OR REPLACE FUNCTION public.validate_coupon_rpc(
    p_code TEXT,
    p_user_id UUID,
    p_cart_total NUMERIC
) RETURNS JSON AS $$
DECLARE
    v_coupon public.coupons%ROWTYPE;
    v_usage_count INTEGER;
    v_user_usage_count INTEGER;
    v_discount NUMERIC := 0;
    v_final_total NUMERIC := 0;
BEGIN
    -- 1. Check if coupon exists
    SELECT * INTO v_coupon FROM public.coupons 
    WHERE upper(code) = upper(p_code) AND is_deleted = false;

    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'message', 'Invalid coupon code.');
    END IF;

    -- 2. Check active status
    IF NOT v_coupon.is_active THEN
        RETURN json_build_object('valid', false, 'message', 'This coupon is no longer active.');
    END IF;

    -- 3. Check dates
    IF v_coupon.valid_from > NOW() THEN
        RETURN json_build_object('valid', false, 'message', 'This coupon is not yet valid.');
    END IF;

    IF v_coupon.valid_to IS NOT NULL AND v_coupon.valid_to < NOW() THEN
        RETURN json_build_object('valid', false, 'message', 'This coupon has expired.');
    END IF;

    -- 4. Check minimum cart value
    IF p_cart_total < v_coupon.min_order_amount THEN
        RETURN json_build_object(
            'valid', false, 
            'message', 'Minimum order of ₹' || v_coupon.min_order_amount || ' required.'
        );
    END IF;

    -- 5. Check overall usage limit
    -- We use actual count from usages rather than relying solely on used_count column for strictness
    SELECT count(*) INTO v_usage_count FROM public.coupon_usages WHERE coupon_id = v_coupon.id;
    
    IF v_coupon.usage_limit IS NOT NULL AND v_usage_count >= v_coupon.usage_limit THEN
        RETURN json_build_object('valid', false, 'message', 'This coupon has reached its maximum usage limit.');
    END IF;

    -- 6. Check per-user usage
    IF p_user_id IS NOT NULL THEN
        SELECT count(*) INTO v_user_usage_count 
        FROM public.coupon_usages 
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

        IF v_user_usage_count >= v_coupon.per_user_limit THEN
            RETURN json_build_object('valid', false, 'message', 'You have already reached the usage limit for this coupon.');
        END IF;
    END IF;

    -- 7. Calculate Discount
    IF v_coupon.type = 'percentage' OR v_coupon.type = 'percent' THEN
        v_discount := (p_cart_total * v_coupon.value) / 100.0;
    ELSIF v_coupon.type = 'flat' THEN
        v_discount := v_coupon.value;
    ELSIF v_coupon.type = 'free_delivery' THEN
        v_discount := 40; -- Standard delivery fee assumption
    END IF;

    -- Apply max discount cap
    IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
        v_discount := v_coupon.max_discount;
    END IF;

    -- Prevent negative totals
    IF v_discount > p_cart_total THEN
        v_discount := p_cart_total;
    END IF;

    v_final_total := p_cart_total - ROUND(v_discount);

    -- 8. Return Success payload
    RETURN json_build_object(
        'valid', true,
        'message', 'Coupon applied successfully.',
        'discount', ROUND(v_discount),
        'final_total', ROUND(v_final_total),
        'coupon', row_to_json(v_coupon)
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create RPC: Apply Coupon (Atomic Usages tracking)
CREATE OR REPLACE FUNCTION public.apply_coupon_rpc(
    p_code TEXT,
    p_user_id UUID,
    p_order_id UUID,
    p_cart_total NUMERIC
) RETURNS JSON AS $$
DECLARE
    v_validation JSON;
    v_coupon_id  UUID;
    v_is_valid   BOOLEAN;
BEGIN
    -- 1. Validate first
    v_validation := public.validate_coupon_rpc(p_code, p_user_id, p_cart_total);
    v_is_valid := (v_validation->>'valid')::boolean;

    IF NOT v_is_valid THEN
        RETURN v_validation; -- Bubble up the error message
    END IF;

    -- 2. Extract ID
    v_coupon_id := (v_validation->'coupon'->>'id')::UUID;

    -- 3. Insert Usage Record
    INSERT INTO public.coupon_usages (coupon_id, user_id, order_id)
    VALUES (v_coupon_id, p_user_id, p_order_id);

    -- 4. Increment used_count (denormalized fast lookup)
    UPDATE public.coupons 
    SET used_count = used_count + 1 
    WHERE id = v_coupon_id;

    -- 5. Return success info
    RETURN json_build_object(
        'success', true,
        'message', 'Coupon applied and usage recorded.',
        'discount', v_validation->>'discount',
        'final_total', v_validation->>'final_total'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Permissions
GRANT EXECUTE ON FUNCTION public.validate_coupon_rpc(TEXT, UUID, NUMERIC) TO public, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_coupon_rpc(TEXT, UUID, UUID, NUMERIC) TO authenticated;

-- RLS for coupon_usages
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can record coupon usage" ON public.coupon_usages;
CREATE POLICY "Users can record coupon usage" ON public.coupon_usages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can check their usage" ON public.coupon_usages;
CREATE POLICY "Public can check their usage" ON public.coupon_usages
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage usage" ON public.coupon_usages;
CREATE POLICY "Admin manage usage" ON public.coupon_usages
    FOR ALL TO authenticated
    USING (true);

COMMIT;
