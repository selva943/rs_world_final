import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product, Offer } from '../types';
import { OfferEngine } from '../utils/offerEngine';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  appliedOffers: Offer[];
  savings: number;
}

export interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyOffers: (offers: Offer[]) => void;
  removeOffer: (offerId: string) => void;
  getItemCount: () => number;
  getTotalSavings: () => number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_OFFERS'; payload: { offers: Offer[] } }
  | { type: 'REMOVE_OFFER'; payload: { offerId: string } }
  | { type: 'RECALCULATE_TOTALS' };

const initialState: CartState = {
  items: [],
  subtotal: 0,
  totalDiscount: 0,
  total: 0,
  appliedOffers: [],
  savings: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, {
          id: product.id,
          product,
          quantity,
          addedAt: new Date(),
        }];
      }
      
      return {
        ...state,
        items: newItems,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      return {
        ...state,
        items: newItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.product.id !== productId);
        return {
          ...state,
          items: newItems,
        };
      }
      
      const newItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      return {
        ...state,
        items: newItems,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'APPLY_OFFERS': {
      const { offers } = action.payload;
      const applicableOffers = offers.filter(offer => 
        state.items.some(item => 
          OfferEngine.isOfferApplicable(offer, item.product)
        )
      );
      
      const cartDiscount = OfferEngine.calculateCartDiscount(state.items, applicableOffers);
      
      return {
        ...state,
        appliedOffers: applicableOffers,
        totalDiscount: cartDiscount.totalDiscount,
        savings: cartDiscount.totalDiscount,
      };
    }

    case 'REMOVE_OFFER': {
      const { offerId } = action.payload;
      const newAppliedOffers = state.appliedOffers.filter(offer => offer.id !== offerId);
      const cartDiscount = OfferEngine.calculateCartDiscount(state.items, newAppliedOffers);
      
      return {
        ...state,
        appliedOffers: newAppliedOffers,
        totalDiscount: cartDiscount.totalDiscount,
        savings: cartDiscount.totalDiscount,
      };
    }

    case 'RECALCULATE_TOTALS': {
      const subtotal = state.items.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
      );
      
      return {
        ...state,
        subtotal,
        total: subtotal - state.totalDiscount,
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Recalculate totals whenever items change
  React.useEffect(() => {
    dispatch({ type: 'RECALCULATE_TOTALS' });
  }, [state.items]);

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyOffers = (offers: Offer[]) => {
    dispatch({ type: 'APPLY_OFFERS', payload: { offers } });
  };

  const removeOffer = (offerId: string) => {
    dispatch({ type: 'REMOVE_OFFER', payload: { offerId } });
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getTotalSavings = () => {
    return state.savings;
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyOffers,
    removeOffer,
    getItemCount,
    getTotalSavings,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
