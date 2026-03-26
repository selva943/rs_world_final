/**
 * couponService.ts
 * Central business logic for coupon validation, discount calculation, and usage recording.
 */

import { Coupon } from '@/types/app';
import { couponsApi } from './api';

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  coupon?: Coupon;
}

/**
 * 1. validateCoupon(code, userId, cartTotal):
 * - Checks if exists, is_active, date range, usage limits, and min order amount.
 */
/**
 * 1. validateCoupon(code, userId, cartTotal, items):
 * - Checks if exists, is_active, date range, usage limits, min order amount, and category restrictions.
 */
export async function validateCoupon(
  code: string,
  userId: string | undefined,
  cartTotal: number,
  items: any[] = []
): Promise<CouponValidationResult> {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  try {
    const { supabase } = await import('./api');
    
    // 1. Fetch coupon details
    const { data: couponData, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_deleted', false)
      .single();

    if (error || !couponData) {
      return { valid: false, message: 'Coupon code not found.' };
    }

    const coupon = couponData as Coupon;

    // 2. Fundamental checks
    if (!coupon.is_active) return { valid: false, message: 'This coupon is currently inactive.' };
    
    const now = new Date();
    if (new Date(coupon.valid_from) > now) return { valid: false, message: 'This coupon is not yet active.' };
    if (coupon.valid_to && new Date(coupon.valid_to) < now) return { valid: false, message: 'This coupon has expired.' };

    // 3. Min Order Amount
    // Important: For category coupons, we might want to check min order of ONLY those items,
    // but usually min order applies to the whole cart to even ACTIVATE the coupon.
    if (cartTotal < coupon.min_order_amount) {
      return { valid: false, message: `Minimum order of ₹${coupon.min_order_amount} required.` };
    }

    // 4. Usage Limits (Total)
    if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
      return { valid: false, message: 'This coupon usage limit has been reached.' };
    }

    // 5. User Specific Checks (RPC is best for per-user limits and first-order)
    // We still call the RPC as the final source of truth for these "dynamic" checks
    const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)('validate_coupon_rpc', {
      p_code: code.trim().toUpperCase(),
      p_user_id: userId || null,
      p_cart_total: cartTotal
    });

    if (rpcError) {
      console.error('Coupon RPC Error:', rpcError);
      // Fallback: if RPC fails but local checks pass, we might still reject for safety or proceed
      return { valid: false, message: 'Security check failed. Please try again.' };
    }

    if (!rpcResult.valid) {
      return { valid: false, message: rpcResult.message };
    }

    // 6. Category Restrictions (Advanced Rules)
    const cats = coupon.applicable_categories;
    if (cats && cats.length > 0) {
      const eligibleItems = items.filter(item => 
        cats.includes(item.category) || 
        cats.includes(item.category_id)
      );
      if (eligibleItems.length === 0) {
        return { valid: false, message: 'Not applicable for items in your cart.' };
      }
    }

    return { 
      valid: true, 
      message: 'Coupon applied successfully!', 
      coupon: coupon as Coupon
    };

  } catch (err) {
    console.error('Coupon Service Exception:', err);
    return { valid: false, message: 'An unexpected error occurred.' };
  }
}

/**
 * calculateCouponDiscount(coupon, cartTotal, items):
 * Refined calculation with category logic and rounding.
 */
export function calculateCouponDiscount(
  coupon: Coupon, 
  cartTotal: number, 
  items: any[] = []
): { discount: number; finalTotal: number } {
  let discount = 0;
  
  // Identify applicable subtotal (global or category-specific)
  let applicableSubtotal = cartTotal;
  if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
    applicableSubtotal = items
      .filter(item => 
        coupon.applicable_categories?.includes(item.category) || 
        coupon.applicable_categories?.includes(item.category_id)
      )
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  if (applicableSubtotal <= 0) return { discount: 0, finalTotal: cartTotal };

  if (coupon.type === 'flat') {
    discount = coupon.value;
  } else if (coupon.type === 'percent' || (coupon.type as string) === 'percentage') {
    discount = (applicableSubtotal * coupon.value) / 100;
  } else if (coupon.type === 'free_delivery') {
    discount = 40; 
  }

  // Cap discount if max_discount exists
  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }

  // Ensure discount doesn't exceed applicable total (can't be negative)
  // And round to nearest integer to avoid precision issues
  discount = Math.min(Math.round(discount), applicableSubtotal);
  
  return { 
    discount, 
    finalTotal: Math.max(0, cartTotal - discount) 
  };
}

/**
 * Fetch all eligible coupons for "Auto-apply"
 */
export async function getEligibleCoupons(
  userId: string | undefined,
  cartTotal: number,
  items: any[] = []
): Promise<Coupon[]> {
  try {
    const { supabase } = await import('./api');
    const { data: couponsData, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .lt('valid_from', new Date().toISOString())
      .lte('min_order_amount', cartTotal);

    if (error || !couponsData) return [];

    const coupons = couponsData as any[];
    const validCoupons: Coupon[] = [];
    for (const c of coupons) {
      // Basic check for category overlap
      if (c.applicable_categories && c.applicable_categories.length > 0) {
        const hasMatch = items.some(item => 
          c.applicable_categories.includes(item.category) || 
          c.applicable_categories.includes(item.category_id)
        );
        if (!hasMatch) continue;
      }

      // Check usage limits locally
      if (c.usage_limit && (c.used_count || 0) >= c.usage_limit) continue;
      
      validCoupons.push(c as Coupon);
    }
    
    return validCoupons;
  } catch (err) {
    return [];
  }
}

/**
 * Record usage after order
 * Calls the atomic RPC apply_coupon_rpc
 */
export async function recordCouponUsage(
  code: string,
  userId: string,
  orderId: string,
  cartTotal: number
): Promise<boolean> {
  try {
    const { supabase } = await import('./api');
    
    const { data: result, error } = await (supabase.rpc as any)('apply_coupon_rpc', {
      p_code: code.trim(),
      p_user_id: userId,
      p_order_id: orderId,
      p_cart_total: cartTotal
    });

    if (error) {
      console.error('Failed to apply coupon via RPC:', error);
      return false;
    }

    const rpcData = result as any;
    return rpcData.success === true;
  } catch (err) {
    console.error('Error recording coupon usage:', err);
    return false;
  }
}
