-- ==========================================
-- Migration 029: Automatic Coupon Engine
-- ==========================================

BEGIN;

/**
 * public.get_best_coupon_rpc
 * 
 * Automatically selects the best applicable coupon for a user's cart.
 */
CREATE OR REPLACE FUNCTION public.get_best_coupon_rpc(
    p_user_id UUID,
    p_cart_total NUMERIC
) RETURNS JSON AS $$
DECLARE
    v_best_coupon public.coupons%ROWTYPE;
    v_max_discount NUMERIC := 0;
    v_temp_discount NUMERIC;
    v_coupon_record RECORD;
    v_usage_count INTEGER;
    v_user_usage_count INTEGER;
BEGIN
    -- 1. Loop through all active, non-deleted coupons
    FOR v_coupon_record IN 
        SELECT * FROM public.coupons 
        WHERE is_active = true 
          AND is_deleted = false 
          AND valid_from <= NOW() 
          AND (valid_to IS NULL OR valid_to >= NOW())
          AND p_cart_total >= min_order_amount
    LOOP
        -- 2. Verify Overall Usage Limit
        SELECT count(*) INTO v_usage_count FROM public.coupon_usages WHERE coupon_id = v_coupon_record.id;
        IF v_coupon_record.usage_limit IS NOT NULL AND v_usage_count >= v_coupon_record.usage_limit THEN
            CONTINUE;
        END IF;

        -- 3. Verify Per-User Limit
        IF p_user_id IS NOT NULL THEN
            SELECT count(*) INTO v_user_usage_count 
            FROM public.coupon_usages 
            WHERE coupon_id = v_coupon_record.id AND user_id = p_user_id;

            IF v_user_usage_count >= v_coupon_record.per_user_limit THEN
                CONTINUE;
            END IF;
        END IF;

        -- 4. Calculate Discount for this coupon
        IF v_coupon_record.type = 'percentage' OR v_coupon_record.type = 'percent' THEN
            v_temp_discount := (p_cart_total * v_coupon_record.value) / 100.0;
        ELSIF v_coupon_record.type = 'flat' THEN
            v_temp_discount := v_coupon_record.value;
        ELSIF v_coupon_record.type = 'free_delivery' THEN
            v_temp_discount := 40; -- Standard delivery fee
        END IF;

        -- Apply max discount cap
        IF v_coupon_record.max_discount IS NOT NULL AND v_temp_discount > v_coupon_record.max_discount THEN
            v_temp_discount := v_coupon_record.max_discount;
        END IF;

        -- 5. Compare and track the best (highest discount)
        IF v_temp_discount > v_max_discount THEN
            v_max_discount := v_temp_discount;
            v_best_coupon := v_coupon_record;
        END IF;
    END LOOP;

    -- 6. Return Result
    IF v_max_discount > 0 THEN
        RETURN json_build_object(
            'success', true,
            'coupon', row_to_json(v_best_coupon),
            'discount_amount', ROUND(v_max_discount),
            'final_total', ROUND(p_cart_total - v_max_discount)
        );
    ELSE
        RETURN json_build_object(
            'success', false,
            'message', 'No applicable coupons found.'
        );
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions
GRANT EXECUTE ON FUNCTION public.get_best_coupon_rpc(UUID, NUMERIC) TO public, authenticated;

COMMIT;
