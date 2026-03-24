import { Experience, Order, OrderItem, OrderLog, Testimonial, Upload, Offer, Category, Recipe, RecipeIngredient, Subscription, SubscriptionStatus, Booking, BookingStatus, Service } from '@/types/app';
import { supabase, db } from '@/lib/supabase';
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
  async getAll(): Promise<Experience[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) {
      console.error('[experiencesApi.getAll] Error:', error.message);
      return [];
    }
    return (data || []).map(dbToExperience);
  },

  async add(experience: Record<string, any>): Promise<Experience | null> {
    const payload = buildProductPayload(experience);
    console.log('[experiencesApi.add] Cleaned payload:', payload);
    const { data, error } = await db.from('products')
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error('[experiencesApi.add] Insert error:', error.message, error.details, error.hint);
      throw new Error(error.message);
    }
    return data ? dbToExperience(data) : null;
  },

  async update(id: string, experience: Record<string, any>): Promise<boolean> {
    const payload = buildProductPayload(experience);
    console.log('[experiencesApi.update] Cleaned payload:', payload);
    const { error } = await db.from('products')
      .update(payload)
      .eq('id', id);
    if (error) {
      console.error('[experiencesApi.update] Update error:', error.message, error.details);
      throw new Error(error.message);
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[experiencesApi.delete] Error:', error.message);
    }
    return !error;
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
function dbToOffer(row: any): Offer {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    offer_type: row.offer_type,
    discount_type: row.discount_type,
    discount_value: Number(row.discount_value) || 0,
    min_quantity: row.min_quantity || 1,
    max_discount: row.max_discount,
    start_date: row.start_date,
    end_date: row.end_date,
    banner_image: row.banner_image || '',
    badge: row.badge || '',
    is_active: row.is_active ?? true,
    is_featured: row.is_featured || false,
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
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOffer);
  },

  async add(offer: Omit<Offer, 'id' | 'created_at'>): Promise<Offer | null> {
    const { data, error } = await db.from('offers').insert(offer).select().single();
    if (error) {
      console.error('Add offer error:', error);
      return null;
    }
    return data ? dbToOffer(data) : null;
  },

  async update(id: string, offer: Partial<Offer>): Promise<boolean> {
    const { error } = await db.from('offers').update(offer).eq('id', id);
    if (error) {
      console.error('Update offer error:', error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);
    return !error;
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
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOrder);
  },

  async getByPhone(phone: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), order_logs(*)')
      .eq('phone', phone)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(dbToOrder);
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), order_logs(*)')
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

  async update(id: string, order: Partial<Order>): Promise<boolean> {
    const { error } = await db.from('orders').update(order).eq('id', id);
    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    return !error;
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
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },
  async add(testimonial: any): Promise<Testimonial | null> {
    const { data, error } = await db.from('testimonials').insert(testimonial).select().single();
    return error ? null : data;
  },
  async update(id: string, testimonial: any): Promise<boolean> {
    const { error } = await db.from('testimonials').update(testimonial).eq('id', id);
    return !error;
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    return !error;
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
      .order('display_order');
    if (error) {
      // Fallback for demo if table doesn't exist
      return [
        { id: '1', name: 'Vegetables', slug: 'vegetables', icon: 'LeafyGreen', display_order: 1, is_active: true, created_at: '' },
        { id: '2', name: 'Fruits', slug: 'fruits', icon: 'Apple', display_order: 2, is_active: true, created_at: '' },
        { id: '3', name: 'Meat & Fish', slug: 'meat-fish', icon: 'Drumstick', display_order: 3, is_active: true, created_at: '' },
        { id: '4', name: 'Dairy', slug: 'dairy', icon: 'Milk', display_order: 4, is_active: true, created_at: '' },
        { id: '5', name: 'Grocery', slug: 'grocery', icon: 'ShoppingBasket', display_order: 5, is_active: true, created_at: '' },
      ];
    }
    return (data || []).map(dbToCategory);
  },

  async add(category: Omit<Category, 'id' | 'created_at'>): Promise<Category | null> {
    const { data, error } = await db.from('categories').insert(category).select().single();
    return data ? dbToCategory(data) : null;
  },

  async update(id: string, category: Partial<Category>): Promise<boolean> {
    const { error } = await db.from('categories').update(category).eq('id', id);
    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return !error;
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
    product: row.products ? dbToExperience(row.products) : undefined
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
          product:products (*)
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) return [];
    return data.map(dbToRecipe);
  },

  async getById(id: string): Promise<Recipe | null> {
    const { data: recipe, error: rError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
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

  async upsert(recipe: Partial<Recipe>): Promise<Recipe> {
    const payload = buildRecipePayload(recipe);
    let query = db.from('recipes');
    
    let result;
    if (recipe.id) {
       result = await query.update(payload).eq('id', recipe.id).select().single();
    } else {
       result = await query.insert(payload).select().single();
    }
    
    if (result.error) {
       console.error('[recipesApi.upsert] Error:', result.error.message, result.error.details);
       throw new Error(result.error.message || 'Failed to save recipe.');
    }
    return dbToRecipe(result.data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    return !error;
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
  product: data.experiences ? dbToExperience(data.experiences) : undefined
});

export const subscriptionsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, experiences(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToSubscription);
  },

  async updateStatus(id: string, status: SubscriptionStatus) {
    const { error } = await db
      .from('subscriptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
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
  async delete(id: string): Promise<boolean> { return true; }
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
    created_at: row.created_at,
  };
}

export const servicesApi = {
  async getAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToService);
  },

  async upsert(service: Partial<Service>): Promise<Service> {
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
    };

    // Include ID if we are updating
    if (service.id) {
      payload.id = service.id;
    }

    try {
      // .upsert() handles both insert (no ID match) and update (ID match)
      // The 'onConflict: id' ensures it uses the PK for matching
      const { data, error } = await db
        .from('services')
        .upsert(payload)
        .select()
        .single();
        
      if (error) {
        // If it's the specific "single row" error, check if it's because it couldn't find/update
        if (error.code === 'PGRST116') {
          console.error('Service ID not found in services table. Is it a legacy product ID?');
        }
        throw error;
      }
      return dbToService(data);
    } catch (err: any) {
      console.error('Error in servicesApi.upsert:', err);
      throw err;
    }
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
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
  created_at: data.created_at,
  service: data.services ? dbToService(data.services) : undefined
});

export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('service_bookings')
      .select('*, services(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToBooking);
  },

  async getByUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('service_bookings')
      .select('*, services(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToBooking);
  },

  async add(booking: Partial<Booking>): Promise<Booking | null> {
    const { data, error } = await db
      .from('service_bookings')
      .insert({
        ...booking,
        user_id: booking.user_id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data ? dbToBooking(data) : null;
  },

  async updateStatus(id: string, status: BookingStatus): Promise<boolean> {
    const { error } = await db
      .from('service_bookings')
      .update({ status })
      .eq('id', id);
    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('service_bookings')
      .delete()
      .eq('id', id);
    return !error;
  }
};
