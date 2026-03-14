import { Offer, Product } from '../types';
import { offerUsageTracker } from './offerUsageTracker';

export interface OfferCalculation {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
  applicableOffer: Offer | null;
  savingsText: string;
  offerType: 'product' | 'category' | 'combo';
}

export interface ComboOffer {
  offer: Offer;
  products: Product[];
  totalOriginalPrice: number;
  comboPrice: number;
  savings: number;
  savingsPercentage: number;
}

export class OfferEngine {
  
  /**
   * Get applicable offers for a specific product with proper logic
   */
  static getApplicableOffers(product: Product, allOffers: Offer[]): Offer[] {
    const now = new Date();
    
    return allOffers.filter(offer => {
      // Check if offer is active and not expired
      if (offer.status !== 'active') return false;
      if (offer.end_date && new Date(offer.end_date) < now) return false;
      if (offer.start_date && new Date(offer.start_date) > now) return false;
      
      // Check offer applicability with enhanced logic
      switch (offer.offer_type) {
        case 'product':
          return offer.products?.includes(product.id) || false;
        case 'category':
          return offer.categories?.includes(product.category) || false;
        case 'combo':
          return offer.combo_products?.includes(product.id) || false;
        default:
          return false;
      }
    }).sort((a, b) => b.priority - a.priority); // Sort by priority
  }

  /**
   * Get combo offers that include this product
   */
  static getComboOffers(product: Product, allOffers: Offer[], allProducts: Product[]): ComboOffer[] {
    const now = new Date();
    
    return allOffers
      .filter(offer => {
        // Check if offer is active combo offer
        if (offer.status !== 'active' || offer.offer_type !== 'combo') return false;
        if (offer.end_date && new Date(offer.end_date) < now) return false;
        if (offer.start_date && new Date(offer.start_date) > now) return false;
        
        // Check if this product is included in the combo
        return offer.combo_products?.includes(product.id) || false;
      })
      .map(offer => {
        // Get all products in this combo
        const comboProducts = allProducts.filter(p => 
          offer.combo_products?.includes(p.id)
        );
        
        const totalOriginalPrice = comboProducts.reduce((sum, p) => sum + p.price, 0);
        let comboPrice = totalOriginalPrice;
        let savings = 0;
        
        // Calculate combo discount
        if (offer.discount_type === 'percentage') {
          savings = (totalOriginalPrice * offer.discount_value) / 100;
          comboPrice = totalOriginalPrice - savings;
        } else if (offer.discount_type === 'fixed') {
          savings = Math.min(offer.discount_value, totalOriginalPrice);
          comboPrice = totalOriginalPrice - savings;
        }
        
        return {
          offer,
          products: comboProducts,
          totalOriginalPrice,
          comboPrice,
          savings,
          savingsPercentage: totalOriginalPrice > 0 ? (savings / totalOriginalPrice) * 100 : 0
        };
      })
      .sort((a, b) => b.savings - a.savings); // Sort by highest savings
  }

  /**
   * Calculate the best offer for a product with proper type detection
   */
  static calculateBestOffer(product: Product, allOffers: Offer[]): OfferCalculation {
    const applicableOffers = this.getApplicableOffers(product, allOffers);
    
    if (applicableOffers.length === 0) {
      return {
        originalPrice: product.price,
        discountedPrice: product.price,
        discountAmount: 0,
        discountPercentage: 0,
        applicableOffer: null,
        savingsText: '',
        offerType: 'product'
      };
    }

    // Calculate discount for each applicable offer and find the best one
    let bestCalculation: OfferCalculation = {
      originalPrice: product.price,
      discountedPrice: product.price,
      discountAmount: 0,
      discountPercentage: 0,
      applicableOffer: null,
      savingsText: '',
      offerType: 'product'
    };

    for (const offer of applicableOffers) {
      const calculation = this.calculateOfferDiscount(product, offer);
      
      if (calculation.discountedPrice < bestCalculation.discountedPrice) {
        bestCalculation = calculation;
      }
    }

    return bestCalculation;
  }

  /**
   * Calculate discount for a specific offer with proper type detection
   */
  static calculateOfferDiscount(product: Product, offer: Offer): OfferCalculation {
    let discountAmount = 0;
    let discountedPrice = product.price;
    let offerType: OfferCalculation['offerType'] = 'product';

    // Determine offer type based on offer_type
    switch (offer.offer_type) {
      case 'product':
        offerType = 'product';
        break;
      case 'category':
        offerType = 'category';
        break;
      case 'combo':
        offerType = 'combo';
        break;
      default:
        offerType = 'product';
    }

    switch (offer.discount_type) {
      case 'percentage':
        discountAmount = (product.price * offer.discount_value) / 100;
        discountedPrice = product.price - discountAmount;
        break;
        
      case 'fixed':
        discountAmount = Math.min(offer.discount_value, product.price);
        discountedPrice = product.price - discountAmount;
        break;
        
      default:
        break;
    }

    // Apply minimum quantity check
    if (offer.min_quantity && offer.min_quantity > 1) {
      // For display purposes, show the potential discount
      // Actual validation happens at cart level
      const bulkDiscount = (product.price * offer.discount_value) / 100;
      discountAmount = Math.max(discountAmount, bulkDiscount);
      discountedPrice = product.price - discountAmount;
    }

    // Apply maximum discount limit
    if (offer.max_discount && discountAmount > offer.max_discount) {
      discountAmount = offer.max_discount;
      discountedPrice = product.price - discountAmount;
    }

    const discountPercentage = product.price > 0 ? (discountAmount / product.price) * 100 : 0;

    return {
      originalPrice: product.price,
      discountedPrice: Math.max(0, discountedPrice),
      discountAmount,
      discountPercentage,
      applicableOffer: offer,
      savingsText: this.getSavingsText(offer, discountAmount, discountPercentage),
      offerType
    };
  }

  /**
   * Generate savings text for display based on offer type
   */
  static getSavingsText(offer: Offer, discountAmount: number, discountPercentage: number): string {
    switch (offer.offer_type) {
      case 'combo':
        return `Combo Deal - Save ${discountPercentage.toFixed(0)}%`;
      case 'product':
        return `Special Offer - Save ${discountPercentage.toFixed(0)}%`;
      case 'category':
        return `Category Deal - Save ${discountPercentage.toFixed(0)}%`;
      default:
        return `Save ${discountPercentage.toFixed(0)}%`;
    }
  }

  /**
   * Check if product has any active offers
   */
  static hasActiveOffers(product: Product, allOffers: Offer[]): boolean {
    return this.getApplicableOffers(product, allOffers).length > 0;
  }

  /**
   * Get the highest priority offer for a product
   */
  static getHighestPriorityOffer(product: Product, allOffers: Offer[]): Offer | null {
    const applicableOffers = this.getApplicableOffers(product, allOffers);
    return applicableOffers.length > 0 ? applicableOffers[0] : null;
  }

  /**
   * Get offer badge information with proper type detection
   */
  static getOfferBadge(offer: Offer): {
    text: string;
    color: string;
    icon: string;
    priority: number;
    type: string;
  } {
    const badgeConfig = {
      combo: { text: 'Combo', color: 'bg-blue-500', icon: '📦', priority: 8, type: 'combo' },
      product: { text: 'Deal', color: 'bg-orange-500', icon: '💰', priority: 6, type: 'product' },
      category: { text: 'Category', color: 'bg-indigo-500', icon: '🏷️', priority: 5, type: 'category' }
    };

    return badgeConfig[offer.offer_type] || { text: 'Offer', color: 'bg-gray-500', icon: '🏷️', priority: 1, type: 'offer' };
  }

  /**
   * Calculate cart-level discounts with proper combo and category logic
   */
  static calculateCartDiscount(
    cartItems: { product: Product; quantity: number }[], 
    allOffers: Offer[],
    allProducts: Product[]
  ): {
    totalOriginal: number;
    totalDiscounted: number;
    totalSavings: number;
    appliedOffers: { offer: Offer; items: string[]; discount: number; type: string }[];
    comboOffers: ComboOffer[];
  } {
    let totalOriginal = 0;
    let totalDiscounted = 0;
    const appliedOffers: { offer: Offer; items: string[]; discount: number; type: string }[] = [];
    const comboOffers: ComboOffer[] = [];

    // Calculate original total
    for (const item of cartItems) {
      totalOriginal += item.product.price * item.quantity;
    }

    // Check for combo offers first (highest priority)
    for (const offer of allOffers) {
      if (offer.status !== 'active' || offer.offer_type !== 'combo') continue;
      if (offer.end_date && new Date(offer.end_date) < new Date()) continue;

      const comboProducts = allProducts.filter(p => 
        offer.combo_products?.includes(p.id)
      );

      // Check if all combo products are in cart
      const allComboProductsInCart = comboProducts.every(comboProduct =>
        cartItems.some(item => item.product.id === comboProduct.id)
      );

      if (allComboProductsInCart) {
        const comboTotal = comboProducts.reduce((sum, p) => {
          const cartItem = cartItems.find(item => item.product.id === p.id);
          return sum + (p.price * (cartItem?.quantity || 1));
        }, 0);

        let comboDiscount = 0;
        if (offer.discount_type === 'percentage') {
          comboDiscount = (comboTotal * offer.discount_value) / 100;
        } else if (offer.discount_type === 'fixed') {
          comboDiscount = Math.min(offer.discount_value, comboTotal);
        }

        // Apply max discount limit
        if (offer.max_discount && comboDiscount > offer.max_discount) {
          comboDiscount = offer.max_discount;
        }

        comboOffers.push({
          offer,
          products: comboProducts,
          totalOriginalPrice: comboTotal,
          comboPrice: comboTotal - comboDiscount,
          savings: comboDiscount,
          savingsPercentage: (comboDiscount / comboTotal) * 100
        });

        appliedOffers.push({
          offer,
          items: comboProducts.map(p => p.id),
          discount: comboDiscount,
          type: 'combo'
        });
      }
    }

    // Apply individual product offers (excluding products already in combo)
    const comboProductIds = new Set(comboOffers.flatMap(co => co.products.map(p => p.id)));
    
    for (const offer of allOffers) {
      if (offer.status !== 'active') continue;
      if (offer.end_date && new Date(offer.end_date) < new Date()) continue;
      if (offer.offer_type === 'combo') continue; // Already handled

      let applicableItems: string[] = [];
      let offerDiscount = 0;

      switch (offer.offer_type) {
        case 'product':
          applicableItems = cartItems
            .filter(item => 
              (offer.products?.includes(item.product.id)) && 
              !comboProductIds.has(item.product.id)
            )
            .map(item => item.product.id);
          break;
        case 'category':
          applicableItems = cartItems
            .filter(item => 
              (offer.categories?.includes(item.product.category)) && 
              !comboProductIds.has(item.product.id)
            )
            .map(item => item.product.id);
          break;
      }

      if (applicableItems.length === 0) continue;

      // Calculate offer discount for applicable items
      for (const item of cartItems) {
        if (!applicableItems.includes(item.product.id)) continue;

        const itemOriginal = item.product.price * item.quantity;
        let itemDiscount = 0;

        // Check minimum quantity requirement
        if (offer.min_quantity && item.quantity < offer.min_quantity) {
          continue; // Skip this item if quantity is insufficient
        }

        switch (offer.discount_type) {
          case 'percentage':
            itemDiscount = (itemOriginal * offer.discount_value) / 100;
            break;
          case 'fixed':
            itemDiscount = Math.min(offer.discount_value * item.quantity, itemOriginal);
            break;
        }

        // Apply max discount limit
        if (offer.max_discount && itemDiscount > offer.max_discount) {
          itemDiscount = offer.max_discount;
        }

        offerDiscount += itemDiscount;
      }

      if (offerDiscount > 0) {
        appliedOffers.push({
          offer,
          items: applicableItems,
          discount: offerDiscount,
          type: offer.offer_type
        });
      }
    }

    // Calculate total discount
    const totalSavings = appliedOffers.reduce((sum, offer) => sum + offer.discount, 0);
    totalDiscounted = totalOriginal - totalSavings;

    return {
      totalOriginal,
      totalDiscounted,
      totalSavings,
      appliedOffers,
      comboOffers
    };
  }

  /**
   * Track when an offer is viewed by a user
   */
  static trackOfferView(offerId: string, userId?: string): void {
    offerUsageTracker.trackOfferView(offerId, userId);
  }

  /**
   * Track when an offer is clicked by a user
   */
  static trackOfferClick(offerId: string, userId?: string): void {
    offerUsageTracker.trackOfferClick(offerId, userId);
  }

  /**
   * Track when an offer is used/applied
   */
  static trackOfferUsage(
    offerId: string,
    productId: string,
    originalPrice: number,
    discountedPrice: number,
    quantity: number = 1,
    userId?: string
  ): void {
    offerUsageTracker.trackOfferUsage(
      offerId,
      userId,
      productId,
      originalPrice,
      discountedPrice,
      quantity
    );
  }

  /**
   * Get usage analytics for offers
   */
  static getOfferUsageAnalytics() {
    return offerUsageTracker.getAnalytics();
  }

  /**
   * Get top performing offers
   */
  static getTopOffers(limit: number = 10) {
    return offerUsageTracker.getTopOffers(limit);
  }

  /**
   * Get usage data for a specific offer
   */
  static getOfferUsageData(offerId: string) {
    return offerUsageTracker.getUsageByOffer(offerId);
  }
}
