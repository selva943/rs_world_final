import { Experience, Order, OrderItem, OrderLog, Testimonial, Upload, Offer, Category, Recipe, RecipeIngredient, Subscription, SubscriptionStatus, Booking, BookingStatus, Service, Coupon, AdminApiResponse } from '@/types/app';
import { supabase, db } from '@/lib/supabase';
export { supabase, db };
import { v4 as uuidv4 } from 'uuid';

// Helper function to map category with fallbacks
export function mapCategory(item: any): string {
  if (item.category) return item.category;

  const title = (item.name || item.title || '').toLowerCase();
  if (title.includes('kit') || title.includes('recipe')) return 'recipe_kits';
  if (title.includes('milk') || title.includes('water') || title.includes('egg') || title.includes('bread')) return 'daily_essentials';
  if (title.includes('fruit') || title.includes('apple') || title.includes('mango')) return 'fruits';
  if (title.includes('plumbing') || title.includes('cleaning') || title.includes('repair')) return 'services';

  return 'vegetables'; // default
}

/**
 * Standardizes API responses across the system.
 */
async function handleApiResponse<T>(
  promise: PromiseLike<any>,
  successMessage: string,
  errorPrefix: string,
  mapper?: (data: any) => T
): Promise<AdminApiResponse<T>> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error(`${errorPrefix}:`, error.message);
      return { success: false, message: `${errorPrefix}: ${error.message}`, error: error.message };
    }
    
    let resultData = data;
    if (mapper && data) {
      resultData = Array.isArray(data) ? data.map(mapper) : mapper(data);
    }

    return {
      success: true,
      message: successMessage,
      data: resultData
    };
  } catch (err: any) {
    console.error(`Unexpected ${errorPrefix}:`, err);
    return { success: false, message: `An unexpected error occurred: ${err.message}`, error: err.message };
  }
}

// ========== EXPERIENCES (PRODUCTS) API ==========
function dbToExperience(row: any): Experience {
  // Use experience_config for flexibility if native columns are missing
  const config = row.experience_config || {};
  
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    subcategory: row.subcategory || config.subcategory || '',
    type: row.type,
    price: Number(row.price) || 0,
    stock: row.stock || config.stock || 0,
    unit: row.unit || config.unit || 'kg',
    description: row.description || '',
    image: row.image || row.image_url || '',
    is_subscription_available: row.is_subscription_available ?? config.is_subscription_available ?? false,
    media: Array.isArray(row.media) ? row.media : [],
    
    is_recipe_kit: row.is_recipe_kit || config.is_recipe_kit || false,
    serving_size: row.serving_size || config.serving_size || '',
    cooking_time: row.cooking_time || config.cooking_time || '',
    ingredients: row.ingredients || config.ingredients || [],
    is_veg: row.is_veg ?? config.is_veg ?? true,
    
    service_type: row.service_type || config.service_type,
    service_price_type: row.service_price_type || config.service_price_type,
    
    subscription_type: row.subscription_type || config.subscription_type,
    subscription_frequency: row.subscription_frequency || config.subscription_frequency,
    
    is_active: row.is_active ?? true,
    is_featured: row.is_featured || false,
    
    // Advanced E-commerce Fields
    sku: row.sku || config.sku || '',
    tags: Array.isArray(row.tags) ? row.tags : (config.tags || []),
    discount_price: Number(row.discount_price || config.discount_price) || undefined,
    discount_percentage: Number(row.discount_percentage || config.discount_percentage) || undefined,
    allowed_frequencies: Array.isArray(row.allowed_frequencies) ? row.allowed_frequencies : (config.allowed_frequencies || []),
    subscription_options: row.subscription_options || config.subscription_options || {},
    variants: Array.isArray(row.variants) ? row.variants : (config.variants || []),
    
    created_at: row.created_at
  };
}

// ========== PRODUCT PAYLOAD BUILDER ==========
// Whitelist ONLY real DB columns to prevent "column does not exist" errors from Supabase.
// Any extra fields from the form (title, isSpecial, isVeg, etc.) are stripped here.
function buildProductPayload(data: Record<string, any>): Record<string, any> {
  const allowed = [
    'name', 'slug', 'category', 'subcategory', 'type',
    'price', 'stock', 'unit', 'description',
    'image', 'image_url', 'media',
    'is_active', 'is_featured', 'is_veg',
    'is_subscription_available', 'is_recipe_kit',
    'sku', 'tags', 'discount_price', 'discount_percentage',
    'allowed_frequencies', 'subscription_options', 'variants', 'experience_config',
    'service_type', 'service_price_type', 'service_duration', 'service_area', 'peak_hour_multiplier',
    'subscription_type', 'subscription_frequency',
    'serving_size', 'cooking_time', 'brand', 'wholesale_price',
  ];
  const clean: Record<string, any> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  }
  return clean;
}

export const experiencesApi = {
  async getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    category?: string;
    is_featured?: boolean;
  }): Promise<Experience[]> {
    let query = supabase.from('products').select('*').eq('is_deleted', false).order('name');

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.category) {
      query = query.ilike('category', options.category);
    }
    
    if (options?.is_featured) {
      query = query.eq('is_featured', true);
    }

    if (options?.page !== undefined && options?.limit !== undefined) {
      const from = options.page * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[experiencesApi.getAll] Error:', error.message);
      return [];
    }
    return (data || []).map(dbToExperience);
  },

  async add(experience: Record<string, any>): Promise<AdminApiResponse<Experience>> {
    const payload = buildProductPayload(experience);
    return handleApiResponse(
      db.from('products').insert(payload).select().single(),
      `Product "${experience.name}" added successfully`,
      'Failed to add product',
      dbToExperience
    );
  },

  async update(id: string, experience: Record<string, any>): Promise<AdminApiResponse<Experience>> {
    const payload = buildProductPayload(experience);
    return handleApiResponse(
      db.from('products').update(payload).eq('id', id).select().single(),
      `Product "${experience.name}" updated successfully`,
      'Failed to update product',
      dbToExperience
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('products').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Product deleted successfully',
      'Failed to delete product'
    );
  },

  async bulkUpdateStock(updates: { id: string, stock: number }[]): Promise<boolean> {
    const { error } = await db.from('products')
      .upsert(updates, { onConflict: 'id' });
    if (error) {
      console.error('[experiencesApi.bulkUpdateStock] Error:', error);
      return false;
    }
    return true;
  },

  async importData(items: any[]): Promise<boolean> {
    const cleaned = items.map(buildProductPayload);
    const { error } = await db.from('products').insert(cleaned);
    if (error) {
      console.error('[experiencesApi.importData] Error:', error);
      return false;
    }
    return true;
  }
};

// ========== OFFERS API ==========

/**
 * Whitelist ONLY real DB columns for the offers table.
 * Strips UI-only fields or legacy leftovers.
 */
function buildOfferPayload(data: Record<string, any>): Record<string, any> {
  const allowed = [
    'title', 'name', 'slug', 'description', 
    'logic_type', 'offer_type', 'discount_type', 'discount_value',
    'min_quantity', 'min_order_amount', 'max_discount',
    'buy_quantity', 'get_quantity', 'target_audience',
    'total_usage_limit', 'per_user_limit', 'priority',
    'allow_with_coupon', 'product_id', 'category_id',
    'start_date', 'end_date', 'banner_image', 'badge',
    'is_active', 'is_featured', 'is_deleted'
  ];
  const clean: Record<string, any> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      // Convert empty strings to null for reference fields to avoid UUID syntax errors
      if ((key === 'product_id' || key === 'category_id') && data[key] === '') {
        clean[key] = null;
      } else {
        clean[key] = data[key];
      }
    }
  }
  return clean;
}

function dbToOffer(row: any): Offer {
  return {
    id: row.id,
    title: row.title || row.name,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    logic_type: row.logic_type,
    offer_type: row.offer_type,
    discount_type: row.discount_type,
    discount_value: Number(row.discount_value) || 0,
    min_quantity: row.min_quantity || 1,
    min_order_amount: Number(row.min_order_amount) || 0,
    max_discount: row.max_discount,
    buy_quantity: row.buy_quantity,
    get_quantity: row.get_quantity,
    target_audience: row.target_audience,
    total_usage_limit: row.total_usage_limit,
    per_user_limit: row.per_user_limit || 1,
    priority: row.priority || 0,
    allow_with_coupon: row.allow_with_coupon || false,
    product_id: row.product_id,
    category_id: row.category_id,
    start_date: row.start_date,
    end_date: row.end_date,
    banner_image: row.banner_image || '',
    badge: row.badge || '',
    is_active: (row.is_active ?? row.status === 'active'),
    is_featured: row.is_featured || false,
    is_deleted: row.is_deleted || false,
    created_at: row.created_at
  };
}

export const offersApi = {
  async getAll(): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOffer);
  },

  async getActive(): Promise<Offer[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOffer);
  },

  async add(offer: Record<string, any>): Promise<AdminApiResponse<Offer>> {
    const payload = buildOfferPayload(offer);
    return handleApiResponse(
      db.from('offers').insert(payload).select().single(),
      `Offer "${offer.title || offer.name}" created successfully`,
      'Failed to create offer',
      dbToOffer
    );
  },

  async update(id: string, offer: Record<string, any>): Promise<AdminApiResponse<Offer>> {
    const payload = buildOfferPayload(offer);
    return handleApiResponse(
      db.from('offers').update(payload).eq('id', id).select().single(),
      `Offer updated successfully`,
      'Failed to update offer',
      dbToOffer
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('offers').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Offer deleted successfully',
      'Failed to delete offer'
    );
  },

  async getBestOffer(cartTotal: number, categorySubtotals: Record<string, number>, items: any[] = []): Promise<Offer | null> {
    const activeOffers = await this.getActive();
    
    let bestOffer: Offer | null = null;
    let maxSavings = 0;

    for (const offer of activeOffers) {
      // 1. Basic Constraints
      if (offer.min_order_amount && cartTotal < offer.min_order_amount) continue;
      
      // 2. Product-specific constraints (if any)
      if (offer.offer_type === 'product' && offer.product_id) {
        const item = items.find(i => (i.product_id || i.id) === offer.product_id);
        if (!item) continue;
        if (offer.min_quantity && item.quantity < offer.min_quantity) continue;
      } else {
        // Global/Category min quantity (total items in cart)
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        if (offer.min_quantity && totalItems < offer.min_quantity) continue;
      }

      // 3. Calculate Savings
      let savings = 0;
      if (offer.logic_type === 'percentage') {
        const applicableTotal = offer.offer_type === 'product' && offer.product_id
          ? (items.find(i => (i.product_id || i.id) === offer.product_id)?.price || 0) * (items.find(i => (i.product_id || i.id) === offer.product_id)?.quantity || 0)
          : (offer.category_id ? (categorySubtotals[offer.category_id] || 0) : cartTotal);
        
        savings = (applicableTotal * offer.discount_value) / 100;
        if (offer.max_discount) savings = Math.min(savings, offer.max_discount);
      } else if (offer.logic_type === 'flat') {
        savings = offer.discount_value;
      } else if (offer.logic_type === 'free_delivery') {
        savings = 40;
      }

      if (savings > maxSavings) {
        maxSavings = savings;
        bestOffer = offer;
      }
    }

    return bestOffer;
  }
};

// ========== COUPONS API ==========
const dbToCoupon = (row: any): Coupon => ({
  id: row.id,
  code: row.code,
  type: row.type,
  value: Number(row.value) || 0,
  min_order_amount: Number(row.min_order_amount) || 0,
  max_discount: row.max_discount,
  usage_limit: row.usage_limit,
  used_count: row.used_count || 0,
  per_user_limit: row.per_user_limit || 1,
  valid_from: row.valid_from,
  valid_to: row.valid_to,
  is_active: row.is_active ?? true,
  created_at: row.created_at
});

export const couponsApi = {
  async getAll(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToCoupon);
  },

  async getByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    if (error) return null;
    return dbToCoupon(data);
  },

  async validate(code: string, userId: string | undefined, cartTotal: number): Promise<{ valid: boolean; message?: string; coupon?: Coupon }> {
    const coupon = await this.getByCode(code);
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (!coupon.is_active) return { valid: false, message: 'This coupon is no longer active' };

    const now = new Date();
    if (new Date(coupon.valid_from) > now) return { valid: false, message: 'Coupon not yet valid' };
    if (coupon.valid_to && new Date(coupon.valid_to) < now) return { valid: false, message: 'Coupon has expired' };

    if (cartTotal < coupon.min_order_amount) {
      return { valid: false, message: `Minimum order of ₹${coupon.min_order_amount} required` };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (userId) {
      const { count } = await supabase
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId);
      
      if (count !== null && count >= coupon.per_user_limit) {
        return { valid: false, message: 'You have already used this coupon' };
      }
    }

    return { valid: true, coupon };
  },

  async recordUsage(couponId: string, userId: string, orderId?: string): Promise<boolean> {
    // 1. Record usage
    const { error: usageError } = await db.from('coupon_usage').insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId
    });
    if (usageError) return false;

    // 2. Increment used_count
    await db.rpc('increment_coupon_usage', { coupon_id: couponId });
    return true;
  },

  async add(coupon: Record<string, any>): Promise<AdminApiResponse<Coupon>> {
    return handleApiResponse(
      db.from('coupons').insert(coupon).select().single(),
      `Coupon "${coupon.code}" created successfully`,
      'Failed to create coupon',
      dbToCoupon
    );
  },

  async update(id: string, coupon: Record<string, any>): Promise<AdminApiResponse<Coupon>> {
    return handleApiResponse(
      db.from('coupons').update(coupon).eq('id', id).select().single(),
      `Coupon updated successfully`,
      'Failed to update coupon',
      dbToCoupon
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('coupons').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Coupon deleted successfully',
      'Failed to delete coupon'
    );
  }
};

// ========== ORDERS API ==========
function dbToOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    quantity: row.quantity,
    price: row.price,
    product: row.products ? dbToExperience(row.products) : undefined
  };
}

function dbToOrderLog(row: any): OrderLog {
  return {
    id: row.id,
    order_id: row.order_id,
    status: row.status,
    note: row.note,
    updated_at: row.updated_at
  };
}

function dbToOrder(row: any): Order {
  return {
    id: row.id,
    customer_name: row.customer_name,
    phone: row.phone,
    address: row.address,
    delivery_type: row.delivery_type,
    scheduled_date: row.scheduled_date,
    scheduled_time: row.scheduled_time,
    status: row.status || 'pending',
    payment_status: row.payment_status || 'pending',
    payment_method: row.payment_method || 'cod',
    total_amount: row.total_amount || 0,
    discount_amount: row.discount_amount || 0,
    coupon_id: row.coupon_id,
    applied_offer_id: row.applied_offer_id,
    notes: row.notes,
    created_at: row.created_at,
    items: Array.isArray(row.order_items) ? row.order_items.map(dbToOrderItem) : [],
    logs: Array.isArray(row.order_logs) ? row.order_logs.map(dbToOrderLog) : []
  };
}

export const ordersApi = {
  async getByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), order_logs(*)')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOrder);
  },

  async getByPhone(phone: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), order_logs(*)')
      .eq('phone', phone)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOrder);
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), order_logs(*)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOrder);
  },

  async add(orderData: Partial<Order>, items?: Partial<OrderItem>[]): Promise<Order> {
    // 1. Insert order
    const { data: orderRow, error: orderError } = await db.from('orders').insert({
      customer_name: orderData.customer_name,
      phone: orderData.phone,
      address: orderData.address,
      delivery_type: orderData.delivery_type,
      scheduled_date: orderData.scheduled_date,
      scheduled_time: orderData.scheduled_time,
      status: orderData.status || 'pending',
      payment_method: orderData.payment_method || 'cod',
      payment_status: orderData.payment_status || 'pending',
      total_amount: orderData.total_amount || 0,
      discount_amount: orderData.discount_amount || 0,
      coupon_id: orderData.coupon_id,
      applied_offer_id: orderData.applied_offer_id,
      notes: orderData.notes,
      user_id: orderData.user_id,
    }).select().single();
    
    if (orderError || !orderRow) {
      console.error('[ordersApi.add] Order Insert error:', orderError);
      throw new Error(orderError?.message || 'Failed to create order.');
    }

    // 2. Insert items
    if (items && items.length > 0) {
      const { error: itemsError } = await db.from('order_items').insert(
        items.map(item => ({
          order_id: orderRow.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      );
      if (itemsError) {
        console.error('[ordersApi.add] Items Insert error:', itemsError);
        throw new Error('Order placed, but failed to save items.');
      }
    }

    // 3. Insert initial log
    await db.from('order_logs').insert({
      order_id: orderRow.id,
      status: orderRow.status,
      note: 'Order placed'
    });

    return dbToOrder(orderRow);
  },

  async updateStatus(id: string, newStatus: string, note?: string): Promise<boolean> {
    const { error } = await db.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) return false;
    
    // Log the change
    await db.from('order_logs').insert({
      order_id: id,
      status: newStatus,
      note: note || `Status updated to ${newStatus}`
    });
    
    return true;
  },

  async update(id: string, order: Partial<Order>): Promise<AdminApiResponse<Order>> {
    return handleApiResponse(
      db.from('orders').update(order).eq('id', id).select('*, order_items(*, products(*)), order_logs(*)').single(),
      'Order updated successfully',
      'Failed to update order',
      dbToOrder
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('orders').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Order deleted successfully',
      'Failed to delete order'
    );
  }
};

export const enquiriesApi = ordersApi;

// ========== STORAGE API ==========
export const storageApi = {
  /**
   * Upload a single file to Supabase Storage.
   * Returns the public URL on success, throws a descriptive Error on failure.
   */
  async uploadFile(file: File, bucket: string = 'product-images'): Promise<string> {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `products/${timestamp}-${sanitizedName}`;

    console.log(`[storageApi.uploadFile] Uploading to bucket="${bucket}" path="${filePath}"`);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      const msg = uploadError.message || String(uploadError);
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('bucket')) {
        throw new Error(
          `Storage bucket "${bucket}" not found. Please create it in Supabase Dashboard → Storage and set it to Public.`
        );
      }
      console.error('[storageApi.uploadFile] Upload error:', uploadError);
      throw new Error(`Image upload failed: ${msg}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      throw new Error('Image uploaded but failed to get public URL.');
    }

    console.log(`[storageApi.uploadFile] Success → ${publicUrl}`);
    return publicUrl;
  },

  /** Upload multiple files and return array of public URLs. */
  async uploadMultipleFiles(files: File[], bucket: string = 'product-images'): Promise<string[]> {
    const results: string[] = [];
    for (const file of files) {
      const url = await this.uploadFile(file, bucket);
      results.push(url);
    }
    return results;
  },

  /** Delete a file by its public URL (extracts path from URL). */
  async deleteFile(fileUrl: string, bucket: string = 'product-images'): Promise<boolean> {
    try {
      // Extract file path from public URL
      const url = new URL(fileUrl);
      const parts = url.pathname.split(`/object/public/${bucket}/`);
      const filePath = parts[1];
      if (!filePath) return false;
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      return !error;
    } catch {
      return false;
    }
  }
};

// ========== TESTIMONIALS API ==========
export const testimonialsApi = {
  async getAll(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },
  async add(testimonial: any): Promise<AdminApiResponse<Testimonial>> {
    return handleApiResponse(
      db.from('testimonials').insert(testimonial).select().single(),
      'Testimonial added successfully',
      'Failed to add testimonial'
    );
  },
  async update(id: string, testimonial: any): Promise<AdminApiResponse<Testimonial>> {
    return handleApiResponse(
      db.from('testimonials').update(testimonial).eq('id', id).select().single(),
      'Testimonial updated successfully',
      'Failed to update testimonial'
    );
  },
  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('testimonials').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Testimonial deleted successfully',
      'Failed to delete testimonial'
    );
  }
};

// ========== CATEGORIES API ==========
function dbToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: row.icon,
    display_order: row.display_order || 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at
  };
}

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_deleted', false)
      .order('display_order');
    if (error) {
      // Fallback for demo if table doesn't exist
      return [
        { id: '1', name: 'Vegetables', slug: 'vegetables', icon: 'LeafyGreen', display_order: 1, is_active: true, created_at: '', is_deleted: false },
        { id: '2', name: 'Fruits', slug: 'fruits', icon: 'Apple', display_order: 2, is_active: true, created_at: '', is_deleted: false },
        { id: '3', name: 'Meat & Fish', slug: 'meat-fish', icon: 'Drumstick', display_order: 3, is_active: true, created_at: '', is_deleted: false },
        { id: '4', name: 'Dairy', slug: 'dairy', icon: 'Milk', display_order: 4, is_active: true, created_at: '', is_deleted: false },
        { id: '5', name: 'Grocery', slug: 'grocery', icon: 'ShoppingBasket', display_order: 5, is_active: true, created_at: '', is_deleted: false },
        { id: '6', name: 'Services', slug: 'services', icon: 'Wrench', display_order: 6, is_active: true, created_at: '', is_deleted: false },
        { id: '7', name: 'Recipe Kits', slug: 'recipe-kits', icon: 'ChefHat', display_order: 7, is_active: true, created_at: '', is_deleted: false },
      ];
    }
    return (data || []).map(dbToCategory);
  },

  async add(category: Omit<Category, 'id' | 'created_at'>): Promise<AdminApiResponse<Category>> {
    return handleApiResponse(
      db.from('categories').insert(category).select().single(),
      `Category "${category.name}" created successfully`,
      'Failed to create category',
      dbToCategory
    );
  },

  async update(id: string, category: Partial<Category>): Promise<AdminApiResponse<Category>> {
    return handleApiResponse(
      db.from('categories').update(category).eq('id', id).select().single(),
      `Category updated successfully`,
      'Failed to update category',
      dbToCategory
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('categories').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Category deleted successfully',
      'Failed to delete category'
    );
  }
};

// ========== RECIPES API ==========
function dbToRecipe(row: any): Recipe {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    prep_time: row.prep_time,
    difficulty: row.difficulty,
    image: row.image,
    description: row.description,
    is_trending: !!row.is_trending,
    is_featured: !!row.is_featured,
    is_seasonal: !!row.is_seasonal,
    cuisine: row.cuisine,
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    video_url: row.video_url,
    portion_size: row.portion_size || 2,
    calories: row.calories,
    tags: Array.isArray(row.tags) ? row.tags : [],
    views_count: row.views_count || 0,
    orders_count: row.orders_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ingredients: Array.isArray(row.recipe_ingredients) 
      ? row.recipe_ingredients.map(dbToRecipeIngredient) 
      : []
  };
}

function dbToRecipeIngredient(row: any): RecipeIngredient {
  return {
    id: row.id,
    recipe_id: row.recipe_id,
    product_id: row.product_id,
    quantity: Number(row.quantity) || 0,
    uom: row.uom || 'pcs',
    price_override: row.price_override ? Number(row.price_override) : undefined,
    display_order: row.display_order || 0,
    product: row.products ? dbToExperience(Array.isArray(row.products) ? row.products[0] : row.products) : undefined
  };
}



export const buildRecipePayload = (recipe: Partial<Recipe>) => {
  const allowedFields = [
    'name', 'slug', 'category', 'cuisine', 'prep_time', 'difficulty',
    'image', 'description', 'instructions', 'video_url', 'portion_size',
    'calories', 'tags', 'is_trending', 'is_featured', 'is_seasonal',
    'views_count', 'orders_count'
  ];
  const payload: any = {};
  for (const field of allowedFields) {
    if (field in recipe) {
      payload[field] = (recipe as any)[field];
    }
  }
  return payload;
};

export const recipesApi = {
  async getAll(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          products (*)
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
      
    if (error) return [];
    return data.map(dbToRecipe);
  },

  async getById(id: string): Promise<Recipe | null> {
    const { data: recipe, error: rError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();
    if (rError) return null;

    const { data: ingredients, error: iError } = await supabase
      .from('recipe_ingredients')
      .select('*, products (*)')
      .eq('recipe_id', id);

    const formattedRecipe = dbToRecipe(recipe);
    formattedRecipe.ingredients = (ingredients || []).map(dbToRecipeIngredient);
    
    return formattedRecipe;
  },

  async upsert(recipe: Partial<Recipe>): Promise<AdminApiResponse<Recipe>> {
    const payload = buildRecipePayload(recipe);
    const query = db.from('recipes');
    
    const promise = recipe.id
      ? query.update(payload).eq('id', recipe.id).select().single()
      : query.insert(payload).select().single();

    return handleApiResponse(
      promise,
      `Recipe ${recipe.id ? 'updated' : 'created'} successfully`,
      `Failed to ${recipe.id ? 'update' : 'create'} recipe`,
      dbToRecipe
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('recipes').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Recipe deleted successfully',
      'Failed to delete recipe'
    );
  },

  async saveIngredients(recipeId: string, ingredients: { product_id: string; quantity: number; uom: string; price_override?: number; display_order?: number }[]): Promise<boolean> {
    // 1. Delete existing
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
    
    // 2. Insert new
    if (ingredients.length > 0) {
      const { error } = await db.from('recipe_ingredients').insert(
        ingredients.map((ing, idx) => ({ 
          recipe_id: recipeId, 
          product_id: ing.product_id,
          quantity: Number(ing.quantity),
          uom: ing.uom || 'pcs',
          price_override: ing.price_override ? Number(ing.price_override) : null,
          display_order: ing.display_order ?? idx
        }))
      );
      if (error) {
         console.error('[recipesApi.saveIngredients] Error:', error.message);
         throw new Error('Failed to save recipe ingredients: ' + error.message);
      }
    }
    return true;
  }
};

// ========== SUBSCRIPTION SYSTEM API ==========

const dbToSubscription = (data: any): Subscription => ({
  id: data.id,
  user_phone: data.user_phone,
  product_id: data.product_id,
  status: data.status,
  frequency: data.frequency,
  quantity: data.quantity,
  total_per_delivery: data.total_per_delivery,
  start_date: data.start_date,
  end_date: data.end_date,
  next_delivery_date: data.next_delivery_date,
  delivery_slot: data.delivery_slot,
  address: data.address,
  auto_renew: data.auto_renew !== false,
  schedule: data.schedule || {},
  created_at: data.created_at,
  updated_at: data.updated_at,
  product: data.products ? dbToExperience(data.products) : undefined
});

export const subscriptionsApi = {
  async getAll(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, products(*)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToSubscription);
  },

  async updateStatus(id: string, status: SubscriptionStatus): Promise<AdminApiResponse<Subscription>> {
    return handleApiResponse(
      db.from('subscriptions').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select('*, products(*)').single(),
      'Subscription status updated successfully',
      'Failed to update subscription status',
      dbToSubscription
    );
  },

  async getMetrics() {
    // In a real app, this would be a complex aggregation query or edge function
    // For now, we calculate from current data (mocked for demo)
    const mockMetrics = {
      mrr: 125400,
      active_subscriptions: 450,
      churn_rate: 2.4,
      churn_trend: -0.5, // Improving
      revenue_growth: 12.8,
      forecast: [
        { month: 'Jan', revenue: 98000 },
        { month: 'Feb', revenue: 105000 },
        { month: 'Mar', revenue: 125400 },
        { month: 'Apr', revenue: 142000 },
      ],
      categories: [
        { name: 'Dairy', value: 45 },
        { name: 'Vegetables', value: 30 },
        { name: 'Fruits', value: 15 },
        { name: 'Other', value: 10 },
      ]
    };
    return mockMetrics;
  }
};

// ========== UPLOADS API (STUB) ==========
export const uploadsApi = {
  async getAll(): Promise<Upload[]> { return []; },
  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> { 
    return { success: true, message: 'Upload deleted successfully', data: { id } };
  }
};

// ========== SERVICES MARKETPLACE API ==========
export function dbToService(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: Number(row.price) || 0,
    duration: row.duration || '',
    description: row.description || '',
    image_path: row.image_path || '',
    image: row.image_path || '', // Convenience for components using .image
    is_active: row.is_active ?? true,
    is_featured: row.is_featured ?? false,
    max_bookings_per_slot: row.max_bookings_per_slot || 3,
    service_pincodes: row.service_pincodes || [],
    peak_multiplier: Number(row.peak_multiplier) || 1.0,
    weekend_multiplier: Number(row.weekend_multiplier) || 1.1,
    same_day_multiplier: Number(row.same_day_multiplier) || 1.15,
    created_at: row.created_at,
  };
}

export const servicesApi = {
  async getAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToService);
  },

  async upsert(service: Partial<Service>): Promise<AdminApiResponse<Service>> {
    const slug = service.slug || (service.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    
    // Build the object for Supabase upsert
    const payload: any = {
      name: service.name,
      slug,
      category: service.category || 'General',
      price: Number(service.price) || 0,
      description: service.description || '',
      duration: service.duration || '1 hour',
      image_path: service.image_path || '',
      is_featured: !!service.is_featured,
      is_active: service.is_active ?? true,
      max_bookings_per_slot: Number(service.max_bookings_per_slot) || 3,
      service_pincodes: service.service_pincodes || [],
      peak_multiplier: Number(service.peak_multiplier) || 1.0,
      weekend_multiplier: Number(service.weekend_multiplier) || 1.1,
      same_day_multiplier: Number(service.same_day_multiplier) || 1.15,
    };

    if (service.id) payload.id = service.id;

    const promise = db.from('services').upsert(payload, { onConflict: 'id' }).select().single();

    return handleApiResponse(
      promise,
      `Service ${service.id ? 'updated' : 'created'} successfully`,
      `Failed to ${service.id ? 'update' : 'create'} service`,
      dbToService
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('services').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Service deleted successfully',
      'Failed to delete service'
    );
  },

  async getMetrics() {
    return {
      total_bookings_today: 14,
      revenue_today: 8200,
      revenue_growth: 18.5,
      bookings_by_service: [
        { service: 'Home Cleaning', count: 6, revenue: 3600 },
        { service: 'Plumbing Repair', count: 4, revenue: 2400 },
        { service: 'Electrical Work', count: 3, revenue: 1800 },
        { service: 'Pest Control', count: 1, revenue: 400 },
      ],
      peak_hours: [
        { hour: '9 AM', bookings: 3 },
        { hour: '10 AM', bookings: 5 },
        { hour: '11 AM', bookings: 4 },
        { hour: '2 PM', bookings: 6 },
        { hour: '4 PM', bookings: 2 },
      ],
    };
  }
};
const dbToBooking = (data: any): Booking => ({
  id: data.id,
  service_id: data.service_id,
  customer_name: data.customer_name,
  customer_phone: data.customer_phone,
  booking_date: data.booking_date,
  time_slot: data.time_slot,
  status: data.status,
  address: data.address,
  notes: data.notes,
  user_pincode: data.user_pincode,
  total_price: Number(data.total_price),
  rating: data.rating,
  feedback: data.feedback,
  worker_id: data.worker_id,
  created_at: data.created_at,
  service: data.services ? dbToService(data.services) : undefined
});

export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('service_bookings')
      .select('*, services(*)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToBooking);
  },

  async getByUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('service_bookings')
      .select('*, services(*)')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToBooking);
  },

  async add(booking: Partial<Booking>): Promise<AdminApiResponse<Booking>> {
    return handleApiResponse(
      db.from('service_bookings').insert({
        ...booking,
        total_price: booking.total_price,
        user_pincode: booking.user_pincode,
        user_id: booking.user_id || undefined,
      }).select().single(),
      'Booking created successfully',
      'Failed to create booking',
      dbToBooking
    );
  },

  async updateStatus(id: string, status: BookingStatus): Promise<AdminApiResponse<Booking>> {
    return handleApiResponse(
      db.from('service_bookings').update({ status }).eq('id', id).select().single(),
      'Booking status updated successfully',
      'Failed to update booking status',
      dbToBooking
    );
  },

  async delete(id: string): Promise<AdminApiResponse<{ id: string }>> {
    return handleApiResponse(
      db.from('service_bookings').update({ is_deleted: true }).eq('id', id).select('id').single(),
      'Booking deleted successfully',
      'Failed to delete booking'
    );
  },

  async checkSlotAvailability(serviceId: string, date: string, slot: string): Promise<{ count: number }> {
    const { count, error } = await supabase
      .from('service_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId)
      .eq('booking_date', date)
      .eq('time_slot', slot)
      .neq('status', 'cancelled');
    
    if (error) throw error;
    return { count: count || 0 };
  }
};
