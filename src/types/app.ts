export interface Experience {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'service' | 'subscription' | 'booking';
  category: string; // Changed to string for dynamic category support
  subcategory?: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  media?: string[];
  unit?: string; 
  sku?: string;
  tags?: string[];
  
  // UOM & Scaling System
  base_unit?: string; // kg, litre, pcs, etc.
  conversion_factor?: number; // 1.0, 1000 (if sold by g but base is kg), etc.
  
  // Pricing & Discounts
  discount_price?: number;
  discount_percentage?: number;
  
  // Subscription specific
  is_subscription_available?: boolean;
  allowed_frequencies?: ('daily' | 'weekly' | 'alternate' | 'monthly')[];
  subscription_options?: {
    daily?: boolean;
    weekly?: boolean;
    alternate?: boolean;
    monthly?: boolean;
  };
  
  // Product Variants
  variants?: ProductVariant[];
  
  // Recipe Kit specific
  is_recipe_kit?: boolean;
  is_veg?: boolean;
  serving_size?: string;
  cooking_time?: string;
  ingredients?: string[];
  
  // Service specific
  service_type?: string;
  service_price_type?: 'fixed' | 'hourly';
  service_duration?: string; // e.g. "1 hour", "2 hours"
  service_pincodes?: string[]; // Array of allowed pincodes
  max_bookings_per_slot?: number;
  peak_multiplier?: number;
  weekend_multiplier?: number;
  same_day_multiplier?: number;
  
  // Subscription specific (User-facing)
  subscription_type?: string;
  subscription_frequency?: string;
  
  is_featured: boolean;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  label: string; // e.g., "500g", "1kg", "250ml"
  price: number;
  stock: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  display_order: number;
  is_active: boolean;
  is_deleted?: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name?: string; // Cache name at time of order
  unit?: string; // Cache unit at time of order
  quantity: number;
  price: number;
  product?: Experience; // joined relation
}

export interface OrderLog {
  id: string;
  order_id: string;
  status: 'pending' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  note?: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address?: string;
  delivery_type?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status: 'pending' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  total_amount: number;
  discount_amount?: number;
  coupon_id?: string;
  applied_offer_id?: string;
  notes?: string;
  user_id?: string;
  is_deleted?: boolean;
  created_at: string;
  // joined relations
  items?: OrderItem[];
  logs?: OrderLog[];
}

export interface Upload {
  id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  media: string;
  rating: number;
  is_deleted?: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  name: string;
  slug: string;
  description?: string;
  logic_type?: 'percentage' | 'bogo' | 'free_delivery' | 'bundle' | 'flat';
  offer_type: 'all' | 'product' | 'category' | 'combo';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_quantity: number;
  min_order_amount?: number;
  max_discount?: number;
  buy_quantity?: number;
  get_quantity?: number;
  target_audience?: 'all_users' | 'new_users' | 'specific_users';
  total_usage_limit?: number;
  per_user_limit?: number;
  priority?: number;
  allow_with_coupon?: boolean;
  product_id?: string;
  category_id?: string;
  start_date: string;
  end_date?: string;
  banner_image?: string;
  badge?: string;
  is_active: boolean;
  is_featured: boolean;
  is_deleted?: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'flat' | 'percent' | 'free_delivery';
  value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_to?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id?: string;
  used_at: string;
}

// Related table interfaces
export interface OfferProduct {
  id: string;
  offer_id: string;
  product_id: string;
}

export interface OfferCategory {
  id: string;
  offer_id: string;
  category_id: string;
}

export interface OfferCombo {
  id: string;
  offer_id: string;
  product_id: string;
}

export interface OfferUsage {
  id: string;
  offer_id: string;
  order_id?: string;
  customer_id?: string;
  discount_applied: number;
  created_at: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

// ========== SUBSCRIPTION SYSTEM TYPES ==========

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type DeliveryFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Subscription {
  id: string;
  user_phone: string;
  user_id?: string;
  product_id: string;
  status: SubscriptionStatus;
  frequency: DeliveryFrequency;
  quantity: number;
  total_per_delivery: number;
  start_date: string;
  end_date?: string; // Optional end date for specific plans
  next_delivery_date?: string;
  delivery_slot?: string;
  address?: string;
  auto_renew: boolean;
  schedule: {
    days?: number[]; // 0-6 (Sun-Sat) for weekly
    dates?: number[]; // 1-31 for monthly
    custom_dates?: string[]; // ISO dates
  };
  days_of_week?: number[];
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  product?: Experience;
}

export interface SubscriptionDelivery {
  id: string;
  subscription_id: string;
  order_id?: string;
  delivery_date: string;
  status: 'pending' | 'delivered' | 'skipped' | 'failed';
  notes?: string;
  created_at: string;
}

// ========== SERVICES SYSTEM TYPES ==========

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  duration: string;
  description?: string;
  image_path?: string;
  image?: string; // Standardized frontend image field
  is_active: boolean;
  is_featured: boolean;
  max_bookings_per_slot?: number;
  service_pincodes?: string[];
  peak_multiplier?: number;
  weekend_multiplier?: number;
  same_day_multiplier?: number;
  is_deleted?: boolean;
  created_at: string;
}

// ========== BOOKING SYSTEM TYPES ==========

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  service_id: string;
  user_id?: string;
  customer_name: string; // Keep for legacy/manual entry
  customer_phone: string; // Keep for legacy/manual entry
  booking_date: string;
  time_slot: string; // e.g. "9-11 AM"
  slot_time?: string; // Alias for UI compatibility
  total_price?: number; // Calculated price for analytics
  user_pincode?: string;
  rating?: number;
  feedback?: string;
  worker_id?: string;
  status: BookingStatus;
  address: string;
  notes?: string;
  is_deleted?: boolean;
  created_at: string;
  
  // Joined fields
  service?: Service;
}

export interface AvailabilityOverride {
  id: string;
  service_id?: string; // If null, applies to all services
  date: string;
  blocked_slots: string[]; // List of times to block
  is_fully_blocked: boolean;
  reason?: string;
}

// Enquiry is replaced by Order, but kept for legacy if needed (as alias)
export type Enquiry = Order;

// ========== RECIPE KIT SYSTEM TYPES ==========

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  category: 'Veg' | 'Non-Veg' | 'Chicken' | 'Mutton' | 'Fish' | 'Quick Meals';
  prep_time: string; // e.g. "30 mins"
  difficulty: RecipeDifficulty;
  image: string;
  description: string;
  is_trending?: boolean;
  is_featured?: boolean;
  is_seasonal?: boolean;
  cuisine?: string;
  instructions: string[]; // Step-by-step
  video_url?: string;
  portion_size: number; // Base portion (e.g., 2)
  calories?: number;
  tags?: string[];
  
  // Analytics
  views_count?: number;
  orders_count?: number;
  
  ingredients?: RecipeIngredient[];
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  product_id: string;
  quantity: number; 
  uom: string; // kg, g, litre, ml, pcs, pack, can
  price_override?: number;
  display_order: number;
  // Joined field
  product?: Experience; 
}

export interface AdminApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
