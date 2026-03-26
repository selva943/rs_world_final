import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Experience, Coupon, Offer, Service, Recipe } from '@/types/app';
import { toast } from 'sonner';
import { couponsApi, offersApi } from '@/lib/services/api';
import { validateCoupon, calculateCouponDiscount } from '@/lib/services/couponService';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

export interface CartItem {
  id: string; // Combination of product.id + optional variant suffix if needed
  product_id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  quantity: number;
  category?: string;
  type?: string;
  is_subscription_available?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Experience | Service | Recipe, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  // Promotion fields
  appliedCoupon: Coupon | null;
  bestOffer: Offer | null;
  discountTotal: number;
  finalTotal: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'palani_basket_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [bestOffer, setBestOffer] = useState<Offer | null>(null);

  // Load from session or local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart storage', e);
      }
    }
  }, []);

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Experience | Service | Recipe, quantity: number = 1) => {
    setItems(prev => {
      const productId = product.id;
      const existing = prev.find(item => item.product_id === productId);
      
      if (existing) {
        toast.info(`Updated quantity for ${product.name}`);
        return prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      
      // Determine type and price
      let type: any = (product as any).type || 'product';
      if (!(product as any).type) {
        // If it's a Recipe (check for prep_time or difficulty)
        if ('prep_time' in product) type = 'recipe';
        // If it's a Service (check for duration)
        else if ('duration' in product) type = 'service';
      }

      let price = (product as any).price || 0;
      // Recipe price calculation if it's a Recipe object
      if (type === 'recipe' && (product as any).ingredients) {
        price = (product as any).ingredients.reduce((sum: number, ing: any) => {
          const p = ing.price_override || ing.product?.price || 0;
          return sum + (p * (ing.quantity || 1));
        }, 0);
      }

      toast.success(`${product.name} added to cart`);
      return [...prev, {
        id: productId,
        product_id: productId,
        name: product.name,
        price,
        image: product.image || (product as any).image_path || '',
        unit: (product as any).unit || 'unit',
        quantity,
        category: product.category,
        type,
        is_subscription_available: (product as any).is_subscription_available || false
      }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Promotion Logic
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);
  
  const { categories } = useData();

  const categorySubtotals = useMemo(() => {
    const subtotals: Record<string, number> = {};
    
    // Create a name-to-id mapping for convenience
    const categoryNameToId: Record<string, string> = {};
    categories.forEach((cat: any) => {
      categoryNameToId[cat.name.toLowerCase()] = cat.id;
      // Also map the slug just in case
      if (cat.slug) categoryNameToId[cat.slug.toLowerCase()] = cat.id;
    });

    items.forEach(item => {
      const catName = item.category || 'Uncategorized';
      const itemTotal = item.price * item.quantity;
      
      // 1. Map by the name/enum directly (e.g. 'Vegetables')
      subtotals[catName] = (subtotals[catName] || 0) + itemTotal;
      
      // 2. Map by the category ID (UUID) so offers can find it
      const catId = categoryNameToId[catName.toLowerCase()];
      if (catId) {
        subtotals[catId] = (subtotals[catId] || 0) + itemTotal;
      }
    });

    return subtotals;
  }, [items, categories]);

  // Automatically find best offer whenever cart changes
  useEffect(() => {
    const findOffer = async () => {
      if (items.length === 0) {
        setBestOffer(null);
        return;
      }
      const offer = await offersApi.getBestOffer(subtotal, categorySubtotals, items);
      setBestOffer(offer);
    };
    findOffer();
  }, [subtotal, categorySubtotals, items]);

  // Validation check for coupon whenever cart or user changes
  useEffect(() => {
    if (appliedCoupon) {
      const revalidate = async () => {
        const result = await validateCoupon(appliedCoupon.code, user?.id, subtotal);
        if (!result.valid) {
           setAppliedCoupon(null);
           toast.error(`Coupon removed: ${result.message}`);
        }
      };
      revalidate();
    }
  }, [subtotal, user, appliedCoupon]);

  const applyCoupon = async (code: string) => {
    const result = await validateCoupon(code, user?.id, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      toast.success(`Coupon "${code}" applied successfully!`);
      return { success: true, message: 'Applied' };
    } else {
      toast.error(result.message || 'Invalid coupon.');
      return { success: false, message: result.message || 'Invalid' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  // Validation check for coupon whenever cart or user changes
  useEffect(() => {
    if (appliedCoupon) {
      const revalidate = async () => {
        const result = await validateCoupon(appliedCoupon.code, user?.id, subtotal);
        if (!result.valid) {
           setAppliedCoupon(null);
           toast.error(`Coupon removed: ${result.message}`);
        }
      };
      revalidate();
    }
  }, [subtotal, user, appliedCoupon]);

  // Final Calculations
  const discountTotal = useMemo(() => {
    let savings = 0;
    
    // 1. Calculate Offer Savings (Auto)
    let offerSavings = 0;
    if (bestOffer) {
      if (bestOffer.logic_type === 'percentage') {
        const applicableTotal = bestOffer.category_id 
          ? (categorySubtotals[bestOffer.category_id] || 0) 
          : subtotal;
        offerSavings = (applicableTotal * bestOffer.discount_value) / 100;
        if (bestOffer.max_discount) offerSavings = Math.min(offerSavings, bestOffer.max_discount);
      } else if (bestOffer.logic_type === 'flat') {
        offerSavings = bestOffer.discount_value;
      } else if (bestOffer.logic_type === 'free_delivery') {
        offerSavings = 40; // Flat delivery credit
      }
    }

    // 2. Calculate Coupon Savings (Manual)
    let couponSavings = 0;
    if (appliedCoupon) {
      const { discount } = calculateCouponDiscount(appliedCoupon, subtotal);
      couponSavings = discount;
    }

    // 3. Stacking Logic
    if (bestOffer && appliedCoupon) {
      if (bestOffer.allow_with_coupon) {
        savings = offerSavings + couponSavings;
      } else {
        // Not allowed together? Give the user the BIGGER one.
        savings = Math.max(offerSavings, couponSavings);
      }
    } else {
      savings = offerSavings + couponSavings;
    }

    return Math.round(savings);
  }, [subtotal, bestOffer, appliedCoupon, categorySubtotals]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discountTotal);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount: subtotal,
      appliedCoupon,
      bestOffer,
      discountTotal,
      finalTotal,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
