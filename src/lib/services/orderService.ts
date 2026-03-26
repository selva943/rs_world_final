/**
 * orderService.ts
 * Orchestrates the full order submission flow.
 * All order business logic should live here — NOT in Checkout.tsx or other UI components.
 */

import { Order, OrderItem, Coupon, Offer } from '@/types/app';
import { ordersApi, experiencesApi } from './api';
import { recordCouponUsage } from './couponService';
import { isSlotAvailable } from './deliveryService';
import { supabase } from '@/lib/supabase';

export interface CartItemInput {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category?: string;
  type?: string;
}

export interface OrderFormInput {
  customer_name: string;
  phone: string;
  address: string;
  delivery_type: 'delivery' | 'pickup';
  payment_method: 'cod' | 'whatsapp';
  notes?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  user_id?: string;
}

export interface OrderSubmitResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface StockValidationError {
  product_id: string;
  name: string;
  requested: number;
  available: number;
}

/**
 * Validate that all cart items have sufficient stock.
 * Returns a list of items that failed validation.
 */
export async function validateCartStock(items: CartItemInput[]): Promise<StockValidationError[]> {
  const errors: StockValidationError[] = [];

  try {
    const productIds = items.map(i => i.product_id);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock')
      .in('id', productIds)
      .eq('is_active', true);

    if (error) {
      console.error('[orderService] Stock validation query failed:', error);
      return []; // optimistic: don't block order if DB fails
    }

    const products = (data || []) as { id: string; name: string; stock: number | null }[];
    const stockMap: Record<string, { name: string; stock: number }> = {};
    products.forEach(p => {
      stockMap[p.id] = { name: p.name, stock: p.stock ?? 999 };
    });

    for (const item of items) {
      const product = stockMap[item.product_id];
      if (!product) continue; // product not found — skip

      const available = product.stock;
      if (available !== null && available !== undefined && item.quantity > available) {
        errors.push({
          product_id: item.product_id,
          name: item.name || product.name,
          requested: item.quantity,
          available,
        });
      }
    }
  } catch (err) {
    console.error('[orderService] Unexpected error during stock validation:', err);
  }

  return errors;
}

/**
 * Full order submission pipeline:
 * 1. Validate stock
 * 2. Validate delivery slot (if scheduled)
 * 3. Create order in DB
 * 4. Record coupon usage (if applicable)
 * 5. Return created order
 */
export async function submitOrder(
  form: OrderFormInput,
  cartItems: CartItemInput[],
  promotion: { coupon: Coupon | null; offer: Offer | null; discountTotal: number; finalTotal: number }
): Promise<OrderSubmitResult> {
  // Step 1: Stock validation
  const stockErrors = await validateCartStock(cartItems);
  if (stockErrors.length > 0) {
    const details = stockErrors
      .map(e => `${e.name}: only ${e.available} available (you requested ${e.requested})`)
      .join(', ');
    return { success: false, error: `Stock issue: ${details}` };
  }

  // Step 2: Delivery slot validation
  if (form.delivery_type === 'delivery' && form.scheduled_date && form.scheduled_time) {
    const slotOk = await isSlotAvailable(form.scheduled_date, form.scheduled_time);
    if (!slotOk) {
      return {
        success: false,
        error: 'Selected delivery slot is fully booked. Please choose another time.'
      };
    }
  }

  // Step 3: Create the order
  let savedOrder: Order;
  try {
    const orderPayload: Partial<Order> = {
      user_id: form.user_id,
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      address: form.delivery_type === 'delivery' ? form.address.trim() : 'Store Pickup',
      delivery_type: form.delivery_type,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time,
      status: 'pending',
      payment_method: form.payment_method,
      payment_status: 'pending',
      total_amount: promotion.finalTotal,
      discount_amount: promotion.discountTotal,
      coupon_id: promotion.coupon?.id,
      applied_offer_id: promotion.offer?.id,
      notes: form.notes?.trim() || undefined,
    };

    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    savedOrder = await ordersApi.add(orderPayload, orderItems);
  } catch (err: any) {
    console.error('[orderService] Order creation failed:', err);
    return { success: false, error: err.message || 'Failed to create order.' };
  }

  // Step 4: Record coupon usage (CRITICAL BUG FIX — was missing before)
  if (promotion.coupon && form.user_id) {
    const baseCartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await recordCouponUsage(promotion.coupon.code, form.user_id, savedOrder.id, baseCartTotal);
  }

  return { success: true, order: savedOrder };
}
