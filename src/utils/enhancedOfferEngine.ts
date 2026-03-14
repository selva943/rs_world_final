import { Offer, Product, OfferCalculation, ComboOffer, CartOfferApplication, OfferConflict, OfferValidation } from '../types/enhanced-offer';

export class EnhancedOfferEngine {
  
  /**
   * Validate offer data before creation/update
   */
  static validateOffer(offer: Partial<Offer>): OfferValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!offer.offer_name || offer.offer_name.trim().length === 0) {
      errors.push('Offer name is required');
    }

    if (!offer.offer_type || !['product', 'category', 'combo'].includes(offer.offer_type)) {
      errors.push('Valid offer type is required (product, category, or combo)');
    }

    if (!offer.discount_type || !['percentage', 'fixed'].includes(offer.discount_type)) {
      errors.push('Valid discount type is required (percentage or fixed)');
    }

    if (offer.discount_value === undefined || offer.discount_value <= 0) {
      errors.push('Discount value must be greater than 0');
    }

    // Business logic validation
    if (offer.discount_type === 'percentage' && offer.discount_value > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    }

    if (offer.min_quantity && offer.min_quantity < 1) {
      errors.push('Minimum quantity must be at least 1');
    }

    if (offer.max_discount && offer.max_discount < 0) {
      errors.push('Maximum discount cannot be negative');
    }

    // Date validation
    if (offer.start_date && offer.end_date) {
      const startDate = new Date(offer.start_date);
      const endDate = new Date(offer.end_date);
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    // Warnings
    if (offer.offer_type === 'combo' && offer.min_quantity && offer.min_quantity < 2) {
      warnings.push('Combo offers typically require minimum quantity of 2');
    }

    if (offer.discount_type === 'fixed' && offer.discount_value > 10000) {
      warnings.push('High fixed discount amount detected');
    }

    if (offer.priority && offer.priority > 1000) {
      warnings.push('Very high priority may conflict with other offers');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get all applicable offers for a product with advanced filtering
   */
  static getApplicableOffers(product: Product, allOffers: Offer[]): Offer[] {
    const now = new Date();
    
    return allOffers.filter(offer => {
      // Basic filtering
      if (!offer.status) return false; // Inactive offers
      if (offer.start_date && new Date(offer.start_date) > now) return false; // Not started
      if (offer.end_date && new Date(offer.end_date) < now) return false; // Expired
      
      // Offer type applicability
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
   * Calculate best offer for a product with conflict resolution
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

    // Calculate discount for each applicable offer
    const offerCalculations = applicableOffers.map(offer => {
      const discount = this.calculateDiscountAmount(offer, product.price);
      return {
        offer,
        discountAmount: discount,
        discountedPrice: product.price - discount,
        discountPercentage: (discount / product.price) * 100
      };
    });

    // Find the best offer (highest discount)
    const bestCalculation = offerCalculations.reduce((best, current) => 
      current.discountAmount > best.discountAmount ? current : best
    );

    const offerBadge = this.getOfferBadge(bestCalculation.offer);

    return {
      originalPrice: product.price,
      discountedPrice: bestCalculation.discountedPrice,
      discountAmount: bestCalculation.discountAmount,
      discountPercentage: bestCalculation.discountPercentage,
      applicableOffer: bestCalculation.offer,
      savingsText: this.getSavingsText(bestCalculation.discountAmount, bestCalculation.discountPercentage),
      offerType: bestCalculation.offer.offer_type,
      offerBadge
    };
  }

  /**
   * Calculate discount amount based on offer type and value
   */
  static calculateDiscountAmount(offer: Offer, originalPrice: number): number {
    let discount = 0;

    switch (offer.discount_type) {
      case 'percentage':
        discount = originalPrice * (offer.discount_value / 100);
        break;
      case 'fixed':
        discount = offer.discount_value;
        break;
    }

    // Apply maximum discount limit if specified
    if (offer.max_discount && discount > offer.max_discount) {
      discount = offer.max_discount;
    }

    // Ensure discount doesn't exceed original price
    return Math.min(discount, originalPrice);
  }

  /**
   * Get combo offers for a product
   */
  static getComboOffers(product: Product, allOffers: Offer[], allProducts: Product[]): ComboOffer[] {
    const comboOffers = allOffers.filter(offer => 
      offer.offer_type === 'combo' && 
      offer.status && 
      offer.combo_products?.includes(product.id)
    );

    return comboOffers.map(offer => {
      const comboProductIds = offer.combo_products || [];
      const comboProducts = allProducts.filter(p => comboProductIds.includes(p.id));
      const totalOriginalPrice = comboProducts.reduce((sum, p) => sum + p.price, 0);
      const discount = this.calculateDiscountAmount(offer, totalOriginalPrice);
      const comboPrice = totalOriginalPrice - discount;

      return {
        offer,
        products: comboProductIds,
        totalOriginalPrice,
        comboPrice,
        savings: discount,
        savingsPercentage: (discount / totalOriginalPrice) * 100,
        productDetails: comboProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image
        }))
      };
    });
  }

  /**
   * Apply offers to cart with conflict resolution
   */
  static applyCartOffers(cartItems: Array<{ product: Product; quantity: number }>, allOffers: Offer[]): CartOfferApplication[] {
    const appliedOffers: CartOfferApplication[] = [];
    const processedProducts = new Set<string>();

    // Group offers by type and priority
    const sortedOffers = allOffers
      .filter(offer => offer.status)
      .sort((a, b) => b.priority - a.priority);

    for (const offer of sortedOffers) {
      let applicableItems: string[] = [];
      let totalDiscount = 0;

      switch (offer.offer_type) {
        case 'product':
          applicableItems = cartItems
            .filter(item => 
              offer.products?.includes(item.product.id) && 
              !processedProducts.has(item.product.id) &&
              item.quantity >= offer.min_quantity
            )
            .map(item => item.product.id);
          
          if (applicableItems.length > 0) {
            totalDiscount = applicableItems.reduce((sum, productId) => {
              const item = cartItems.find(i => i.product.id === productId);
              if (item) {
                const discount = this.calculateDiscountAmount(offer, item.product.price);
                return sum + (discount * item.quantity);
              }
              return sum;
            }, 0);
          }
          break;

        case 'category':
          applicableItems = cartItems
            .filter(item => 
              offer.categories?.includes(item.product.category) && 
              !processedProducts.has(item.product.id) &&
              item.quantity >= offer.min_quantity
            )
            .map(item => item.product.id);
          
          if (applicableItems.length > 0) {
            totalDiscount = applicableItems.reduce((sum, productId) => {
              const item = cartItems.find(i => i.product.id === productId);
              if (item) {
                const discount = this.calculateDiscountAmount(offer, item.product.price);
                return sum + (discount * item.quantity);
              }
              return sum;
            }, 0);
          }
          break;

        case 'combo':
          const comboProducts = offer.combo_products || [];
          const allComboItemsInCart = comboProducts.every(productId => 
            cartItems.some(item => item.product.id === productId && item.quantity >= offer.min_quantity)
          );

          if (allComboItemsInCart) {
            applicableItems = comboProducts;
            const comboTotalPrice = comboProducts.reduce((sum, productId) => {
              const item = cartItems.find(i => i.product.id === productId);
              return sum + (item ? item.product.price * item.quantity : 0);
            }, 0);
            totalDiscount = this.calculateDiscountAmount(offer, comboTotalPrice);
          }
          break;
      }

      if (applicableItems.length > 0 && totalDiscount > 0) {
        appliedOffers.push({
          offerId: offer.id,
          offerName: offer.offer_name,
          discountType: offer.discount_type,
          discountValue: offer.discount_value,
          appliedDiscount: totalDiscount,
          affectedItems: applicableItems,
          conditions: {
            minQuantity: offer.min_quantity,
            applicableProducts: offer.products,
            applicableCategories: offer.categories
          }
        });

        // Mark products as processed to avoid duplicate discounts
        applicableItems.forEach(productId => processedProducts.add(productId));
      }
    }

    return appliedOffers;
  }

  /**
   * Detect and resolve offer conflicts
   */
  static detectOfferConflicts(product: Product, allOffers: Offer[]): OfferConflict[] {
    const applicableOffers = this.getApplicableOffers(product, allOffers);
    const conflicts: OfferConflict[] = [];

    if (applicableOffers.length <= 1) return conflicts;

    // Check for conflicts between same type offers
    const productOffers = applicableOffers.filter(o => o.offer_type === 'product');
    const categoryOffers = applicableOffers.filter(o => o.offer_type === 'category');

    if (productOffers.length > 1) {
      conflicts.push({
        offers: productOffers,
        recommendedOffer: productOffers[0], // Highest priority
        reason: 'Multiple product offers available - using highest priority',
        conflictType: 'same_product'
      });
    }

    if (categoryOffers.length > 1) {
      conflicts.push({
        offers: categoryOffers,
        recommendedOffer: categoryOffers[0], // Highest priority
        reason: 'Multiple category offers available - using highest priority',
        conflictType: 'same_category'
      });
    }

    // Check priority conflicts
    const samePriorityOffers = applicableOffers.filter(o => o.priority === applicableOffers[0].priority);
    if (samePriorityOffers.length > 1) {
      conflicts.push({
        offers: samePriorityOffers,
        recommendedOffer: samePriorityOffers.reduce((best, current) => 
          this.calculateDiscountAmount(current, product.price) > this.calculateDiscountAmount(best, product.price) ? current : best
        ),
        reason: 'Multiple offers with same priority - using best discount',
        conflictType: 'priority_conflict'
      });
    }

    return conflicts;
  }

  /**
   * Get offer badge display
   */
  static getOfferBadge(offer: Offer): { text: string; color: string; icon: string } {
    switch (offer.offer_type) {
      case 'combo':
        return {
          text: 'Combo Deal',
          color: 'bg-purple-500',
          icon: '🎁'
        };
      case 'product':
        return {
          text: 'Special Offer',
          color: 'bg-green-500',
          icon: '⭐'
        };
      case 'category':
        return {
          text: 'Category Discount',
          color: 'bg-blue-500',
          icon: '🏷️'
        };
      default:
        return {
          text: 'Offer',
          color: 'bg-gray-500',
          icon: '🏷️'
        };
    }
  }

  /**
   * Generate savings text
   */
  static getSavingsText(discountAmount: number, discountPercentage: number): string {
    if (discountPercentage > 0) {
      return `Save ${discountPercentage.toFixed(0)}% (₹${discountAmount.toFixed(0)})`;
    }
    return `Save ₹${discountAmount.toFixed(0)}`;
  }

  /**
   * Check if offer is currently active
   */
  static isOfferActive(offer: Offer): boolean {
    if (!offer.status) return false;
    
    const now = new Date();
    if (offer.start_date && new Date(offer.start_date) > now) return false;
    if (offer.end_date && new Date(offer.end_date) < now) return false;
    
    return true;
  }

  /**
   * Get offer expiration status
   */
  static getOfferExpirationStatus(offer: Offer): 'active' | 'expired' | 'upcoming' | 'inactive' {
    if (!offer.status) return 'inactive';
    
    const now = new Date();
    if (offer.start_date && new Date(offer.start_date) > now) return 'upcoming';
    if (offer.end_date && new Date(offer.end_date) < now) return 'expired';
    
    return 'active';
  }
}
