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
export async function validateCoupon(
  code: string,
  userId: string | undefined,
  cartTotal: number
): Promise<CouponValidationResult> {
  // 1. Ensure code is provided
  if (!code || code.trim().length === 0) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  // 2. Safely call the RPC endpoint
  try {
    const { supabase } = await import('./api');
    
    // We cast to any because the Supabase generated types for RPCs might not be updated yet
    const { data: result, error } = await (supabase.rpc as any)('validate_coupon_rpc', {
      p_code: code.trim(),
      p_user_id: userId || null, // RPC handles null
      p_cart_total: cartTotal
    });

    if (error) {
      console.error('Coupon RPC Error:', error);
      return { valid: false, message: 'Unable to validate coupon at this time.' };
    }

    // The RPC returns a JSON object: { valid, message, discount, final_total, coupon }
    const rpcData = result as any;

    if (!rpcData.valid) {
      return { valid: false, message: rpcData.message };
    }

    return { 
      valid: true, 
      message: rpcData.message, 
      coupon: rpcData.coupon
    };

  } catch (err) {
    console.error('Coupon Service Exception:', err);
    return { valid: false, message: 'An unexpected error occurred parsing the coupon.' };
  }
}

/**
 * 1.5 getBestCoupon(userId, cartTotal):
 * - Calls the get_best_coupon_rpc to find the most profitable coupon for the user.
 */
export async function getBestCoupon(
  userId: string | undefined,
  cartTotal: number
): Promise<{ success: boolean; coupon?: Coupon; discountTotal?: number }> {
  try {
    const { supabase } = await import('./api');
    
    const { data: result, error } = await (supabase.rpc as any)('get_best_coupon_rpc', {
      p_user_id: userId || null,
      p_cart_total: cartTotal
    });

    if (error) {
      console.error('get_best_coupon_rpc Error:', error);
      return { success: false };
    }

    const rpcData = result as any;
    if (!rpcData.success) {
      return { success: false };
    }

    return { 
      success: true, 
      coupon: rpcData.coupon,
      discountTotal: rpcData.discount_amount
    };

  } catch (err) {
    console.error('getBestCoupon Exception:', err);
    return { success: false };
  }
}

/**
 * calculateCouponDiscount(coupon, cartTotal):
 * Calculates discount on the frontend for immediate UI feedback.
 * Note: The final source of truth is the RPC output during validation/application.
 */
export function calculateCouponDiscount(coupon: Coupon, cartTotal: number): { discount: number; finalTotal: number } {
  let discount = 0;

  if (coupon.type === 'flat') {
    discount = coupon.value;
  } else if (coupon.type === 'percent' || (coupon.type as string) === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
  } else if (coupon.type === 'free_delivery') {
    discount = 40; 
  }

  // Cap discount if max_discount exists
  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }

  // Ensure discount doesn't exceed cart total
  discount = Math.min(Math.round(discount), cartTotal);
  
  return { 
    discount, 
    finalTotal: Math.max(0, cartTotal - discount) 
  };
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
