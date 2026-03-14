// Enhanced Offer Types matching the specifications
export interface Offer {
  id: number;
  offer_name: string;
  offer_description?: string;
  offer_type: 'product' | 'category' | 'combo';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_quantity: number;
  max_discount?: number;
  start_date?: string;
  end_date?: string;
  priority: number;
  status: boolean; // true = active, false = inactive
  banner_image_url?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (populated from related tables)
  products?: string[];
  categories?: string[];
  combo_products?: string[];
}

export interface OfferProduct {
  id: number;
  offer_id: number;
  product_id: string;
  created_at: string;
}

export interface OfferCategory {
  id: number;
  offer_id: number;
  category_id: string;
  created_at: string;
}

export interface OfferCombo {
  id: number;
  offer_id: number;
  product_id: string;
  created_at: string;
}

export interface OfferUsage {
  id: number;
  offer_id: number;
  order_id?: string;
  customer_id?: string;
  product_id?: string;
  original_price: number;
  discounted_price: number;
  discount_applied: number;
  quantity: number;
  created_at: string;
}

// Enhanced Offer Calculation Result
export interface OfferCalculation {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
  applicableOffer: Offer | null;
  savingsText: string;
  offerType: 'product' | 'category' | 'combo';
  offerBadge?: {
    text: string;
    color: string;
    icon: string;
  };
}

// Combo Offer Details
export interface ComboOffer {
  offer: Offer;
  products: string[];
  totalOriginalPrice: number;
  comboPrice: number;
  savings: number;
  savingsPercentage: number;
  productDetails?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

// Cart Offer Application
export interface CartOfferApplication {
  offerId: number;
  offerName: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  appliedDiscount: number;
  affectedItems: string[];
  conditions: {
    minQuantity: number;
    minOrderValue?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
  };
}

// Offer Statistics for Admin
export interface OfferStats {
  totalOffers: number;
  activeOffers: number;
  expiredOffers: number;
  totalUsage: number;
  totalDiscountGiven: number;
  topPerformingOffers: Array<{
    offerId: number;
    offerName: string;
    usageCount: number;
    totalDiscount: number;
  }>;
}

// Offer Form Data for Admin
export interface OfferFormData {
  offer_name: string;
  offer_description: string;
  offer_type: 'product' | 'category' | 'combo';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_quantity: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  priority: number;
  status: boolean;
  banner_image_url: string;
  products: string[];
  categories: string[];
  combo_products: string[];
}

// Offer Validation Result
export interface OfferValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Offer Conflict Resolution
export interface OfferConflict {
  offers: Offer[];
  recommendedOffer: Offer;
  reason: string;
  conflictType: 'same_product' | 'same_category' | 'priority_conflict';
}
