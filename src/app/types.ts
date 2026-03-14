export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  wholesalePrice?: number;
  image: string;
  stock: number;
  inStock: boolean;
  description?: string;
}

export interface RentalTool {
  id: string;
  name: string;
  brand: string;
  image: string;
  rentPerDay: number;
  rentPerHour?: number;
  deposit: number;
  available: boolean;
  description?: string;
}

export interface Offer {
  id: string;
  offer_name: string;
  offer_description?: string;
  offer_type: 'product' | 'category' | 'combo';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_quantity?: number;
  max_discount?: number;
  start_date: string;
  end_date?: string;
  priority: number;
  status: 'active' | 'inactive';
  banner_image_url?: string;
  created_at: string;
  updated_at: string;
  // Relations (populated from API)
  products?: string[]; // From offer_products table
  categories?: string[]; // From offer_categories table
  combo_products?: string[]; // From offer_combos table
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

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  type: 'product' | 'rental' | 'general';
  date: string;
}
