import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, RentalTool, Offer } from '../types';
import { productsApi, rentalsApi, offersApi } from '../services/api';
import { initialProducts, initialRentalTools } from '../data/mockData';
import { supabase } from '../../lib/supabase';

interface DataContextType {
  products: Product[];
  rentals: RentalTool[];
  offers: Offer[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  refreshRentals: () => Promise<void>;
  refreshOffers: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addRental: (rental: Omit<RentalTool, 'id'>) => Promise<void>;
  updateRental: (id: string, rental: RentalTool) => Promise<void>;
  deleteRental: (id: string) => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => Promise<void>;
  updateOffer: (id: string, offer: Offer) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<RentalTool[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize data from server or load defaults
  const initializeData = async () => {
    setLoading(true);
    try {
      // Fetch products from server
      const serverProducts = await productsApi.getAll();

      // If server has no products, initialize with default data
      if (serverProducts.length === 0) {
        console.log('Initializing products with default data...');
        for (const product of initialProducts) {
          await productsApi.add(product);
        }
        const newProducts = await productsApi.getAll();
        setProducts(newProducts);
      } else {
        setProducts(serverProducts);
      }

      // Fetch rentals from server
      const serverRentals = await rentalsApi.getAll();

      // If server has no rentals, initialize with default data
      if (serverRentals.length === 0) {
        console.log('Initializing rentals with default data...');
        for (const rental of initialRentalTools) {
          await rentalsApi.add(rental);
        }
        const newRentals = await rentalsApi.getAll();
        setRentals(newRentals);
      } else {
        setRentals(serverRentals);
      }

      // Fetch offers from server
      const serverOffers = await offersApi.getAll();
      setOffers(serverOffers);

      setInitialized(true);
    } catch (error) {
      console.error('Error initializing data:', error);
      // Fallback to initial data if server fails
      setProducts(initialProducts);
      setRentals(initialRentalTools);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      initializeData();
    }
  }, [initialized]);

  // Set up real-time subscriptions for products
  useEffect(() => {
    if (!initialized) return;

    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        async (payload) => {
          console.log('Products change detected:', payload);
          // Refresh products when any change occurs
          await refreshProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, [initialized]);

  // Set up real-time subscriptions for rental_tools
  useEffect(() => {
    if (!initialized) return;

    const rentalsChannel = supabase
      .channel('rentals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_tools',
        },
        async (payload) => {
          console.log('Rentals change detected:', payload);
          // Refresh rentals when any change occurs
          await refreshRentals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rentalsChannel);
    };
  }, [initialized]);

  // Set up real-time subscriptions for offers
  useEffect(() => {
    if (!initialized) return;

    const offersChannel = supabase
      .channel('offers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
        },
        async (payload) => {
          console.log('Offers change detected:', payload);
          // Refresh offers when any change occurs
          await refreshOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersChannel);
    };
  }, [initialized]);

  const refreshProducts = async () => {
    const data = await productsApi.getAll();
    setProducts(data);
  };

  const refreshRentals = async () => {
    const data = await rentalsApi.getAll();
    setRentals(data);
  };

  const refreshOffers = async () => {
    const data = await offersApi.getAll();
    setOffers(data);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = await productsApi.add(product);
    if (newProduct) {
      setProducts([...products, newProduct]);
    }
  };

  const updateProduct = async (id: string, product: Product) => {
    const success = await productsApi.update(id, product);
    if (success) {
      setProducts(products.map((p) => (p.id === id ? product : p)));
    }
  };

  const deleteProduct = async (id: string) => {
    const success = await productsApi.delete(id);
    if (success) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const addRental = async (rental: Omit<RentalTool, 'id'>) => {
    const newRental = await rentalsApi.add(rental);
    if (newRental) {
      setRentals([...rentals, newRental]);
    }
  };

  const updateRental = async (id: string, rental: RentalTool) => {
    const success = await rentalsApi.update(id, rental);
    if (success) {
      setRentals(rentals.map((r) => (r.id === id ? rental : r)));
    }
  };

  const deleteRental = async (id: string) => {
    const success = await rentalsApi.delete(id);
    if (success) {
      setRentals(rentals.filter((r) => r.id !== id));
    }
  };

  const addOffer = async (offer: Omit<Offer, 'id' | 'createdAt'>) => {
    const newOffer = await offersApi.add(offer);
    if (newOffer) {
      setOffers([...offers, newOffer]);
    }
  };

  const updateOffer = async (id: string, offer: Offer) => {
    const success = await offersApi.update(id, offer);
    if (success) {
      setOffers(offers.map((o) => (o.id === id ? offer : o)));
    }
  };

  const deleteOffer = async (id: string) => {
    const success = await offersApi.delete(id);
    if (success) {
      setOffers(offers.filter((o) => o.id !== id));
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        rentals,
        offers,
        loading,
        refreshProducts,
        refreshRentals,
        refreshOffers,
        addProduct,
        updateProduct,
        deleteProduct,
        addRental,
        updateRental,
        deleteRental,
        addOffer,
        updateOffer,
        deleteOffer,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
