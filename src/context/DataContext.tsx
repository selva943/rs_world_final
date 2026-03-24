import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Experience, Offer, Order, Testimonial, Upload, Category, Recipe, Service, Booking } from '@/types/app';
import { experiencesApi, offersApi, ordersApi, testimonialsApi, uploadsApi, categoriesApi, recipesApi, servicesApi, bookingsApi } from '@/lib/services/api';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  experiences: Experience[];
  offers: Offer[];
  orders: Order[];
  testimonials: Testimonial[];
  uploads: Upload[];
  categories: Category[];
  recipes: Recipe[];
  services: Service[];
  bookings: Booking[];
  loading: boolean;
  refreshExperiences: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshRecipes: () => Promise<void>;
  refreshOffers: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshTestimonials: () => Promise<void>;
  refreshUploads: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  addExperience: (experience: Omit<Experience, 'id'>) => Promise<void>;
  updateExperience: (id: string, experience: Experience) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => Promise<void>;
  updateOffer: (id: string, offer: Offer) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => Promise<void>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  deleteUpload: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: string, category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addRecipe: (recipe: Partial<Recipe>) => Promise<Recipe | null>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<void>;
  saveRecipeIngredients: (recipe_id: string, ingredients: { product_id: string; quantity: number; uom: string; price_override?: number }[]) => Promise<void>;
  addService: (service: Partial<Service>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize data from server
  const initializeData = async () => {
    setLoading(true);
    try {
      // Fetch all data from server
      const [serverExperiences, serverOffers, serverOrders, serverTestimonials, serverUploads, serverCategories, serverRecipes, serverServices, serverBookings] = await Promise.all([
        experiencesApi.getAll(),
        offersApi.getAll(),
        ordersApi.getAll(),
        testimonialsApi.getAll(),
        uploadsApi.getAll(),
        categoriesApi.getAll(),
        recipesApi.getAll(),
        servicesApi.getAll(),
        bookingsApi.getAll()
      ]);

      setExperiences(serverExperiences);
      setOffers(serverOffers);
      setOrders(serverOrders);
      setTestimonials(serverTestimonials);
      setUploads(serverUploads);
      setCategories(serverCategories);
      setRecipes(serverRecipes);
      setServices(serverServices);
      setBookings(serverBookings);

      setInitialized(true);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      initializeData();
    }
  }, [initialized]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!initialized) return;

    const channels = [
      { table: 'products', callback: refreshExperiences },
      { table: 'offers', callback: refreshOffers },
      { table: 'orders', callback: refreshOrders },
      { table: 'testimonials', callback: refreshTestimonials },
      { table: 'uploads', callback: refreshUploads },
      { table: 'categories', callback: refreshCategories },
      { table: 'recipes', callback: refreshRecipes },
      { table: 'services', callback: refreshServices },
      { table: 'bookings', callback: refreshBookings },
    ].map(({ table, callback }) => 
      supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          async (payload) => {
            console.log(`${table} change detected:`, payload);
            await callback();
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [initialized]);

  const refreshExperiences = async () => {
    const data = await experiencesApi.getAll();
    setExperiences(data);
  };

  const refreshOffers = async () => {
    const data = await offersApi.getAll();
    setOffers(data);
  };

  const refreshOrders = async () => {
    const data = await ordersApi.getAll();
    setOrders(data);
  };

  const refreshTestimonials = async () => {
    const data = await testimonialsApi.getAll();
    setTestimonials(data);
  };

  const refreshUploads = async () => {
    const data = await uploadsApi.getAll();
    setUploads(data);
  };

  const refreshCategories = async () => {
    const data = await categoriesApi.getAll();
    setCategories(data);
  };

  const refreshRecipes = async () => {
    const data = await recipesApi.getAll();
    setRecipes(data);
  };

  const refreshServices = async () => {
    const data = await servicesApi.getAll();
    setServices(data);
  };

  const refreshBookings = async () => {
    const data = await bookingsApi.getAll();
    setBookings(data);
  };

  const addExperience = async (experience: Record<string, any>) => {
    // NOTE: experiencesApi.add now throws on error — let callers handle it
    const newExperience = await experiencesApi.add(experience);
    if (newExperience) {
      setExperiences(prev => [...prev, newExperience]);
    }
  };

  const updateExperience = async (id: string, experience: Record<string, any>) => {
    // NOTE: experiencesApi.update now throws on error — let callers handle it
    const success = await experiencesApi.update(id, experience);
    if (success) {
      setExperiences(prev => prev.map((e) => (e.id === id ? { ...e, ...experience } : e)));
    }
  };

  const deleteExperience = async (id: string) => {
    const success = await experiencesApi.delete(id);
    if (success) {
      setExperiences(prev => prev.filter((e) => e.id !== id));
    }
  };

  const addOffer = async (offer: Omit<Offer, 'id' | 'created_at'>) => {
    const newOffer = await offersApi.add(offer);
    if (newOffer) {
      setOffers(prev => [...prev, newOffer]);
    }
  };

  const updateOffer = async (id: string, offer: Offer) => {
    const success = await offersApi.update(id, offer);
    if (success) {
      setOffers(prev => prev.map((o) => (o.id === id ? offer : o)));
    }
  };

  const deleteOffer = async (id: string) => {
    const success = await offersApi.delete(id);
    if (success) {
      setOffers(prev => prev.filter((o) => o.id !== id));
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // using the explicit updateStatus to trigger an order_logs insert
    const success = await ordersApi.updateStatus(id, status);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { 
        ...o, 
        status, 
        logs: [...(o.logs || []), { id: uuidv4(), order_id: id, status, updated_at: new Date().toISOString() }] 
      } : o));
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    const success = await ordersApi.update(id, order);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...order } : o));
    }
  };

  const deleteOrder = async (id: string) => {
    const success = await ordersApi.delete(id);
    if (success) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
    const newTestimonial = await testimonialsApi.add(testimonial);
    if (newTestimonial) {
      setTestimonials(prev => [...prev, newTestimonial]);
    }
  };

  const updateTestimonial = async (id: string, testimonial: Partial<Testimonial>) => {
    const success = await testimonialsApi.update(id, testimonial);
    if (success) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...testimonial } : t));
    }
  };

  const deleteTestimonial = async (id: string) => {
    const success = await testimonialsApi.delete(id);
    if (success) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  const deleteUpload = async (id: string) => {
    const success = await uploadsApi.delete(id);
    if (success) {
      setUploads(prev => prev.filter(u => u.id !== id));
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    const newCategory = await categoriesApi.add(category);
    if (newCategory) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const updateCategory = async (id: string, category: Category) => {
    const success = await categoriesApi.update(id, category);
    if (success) {
      setCategories(prev => prev.map((c) => (c.id === id ? category : c)));
    }
  };

  const deleteCategory = async (id: string) => {
    const success = await categoriesApi.delete(id);
    if (success) {
      setCategories(prev => prev.filter((c) => c.id !== id));
    }
  };

  const addRecipe = async (recipe: Partial<Recipe>) => {
    const newRecipe = await recipesApi.upsert(recipe);
    if (newRecipe) {
      setRecipes(prev => [newRecipe, ...prev]);
      return newRecipe;
    }
    return null;
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    const updated = await recipesApi.upsert({ ...recipe, id });
    if (updated) {
      setRecipes(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    }
    return null;
  };

  const deleteRecipe = async (id: string) => {
    const success = await recipesApi.delete(id);
    if (success) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const saveRecipeIngredients = async (recipe_id: string, ingredients: { product_id: string; quantity: number; uom: string; price_override?: number }[]) => {
    try {
      await recipesApi.saveIngredients(recipe_id, ingredients);
      // Synchronize local state by fetching the updated recipe data
      const updated = await recipesApi.getById(recipe_id);
      if (updated) {
        setRecipes(prev => prev.map(r => r.id === recipe_id ? updated : r));
      }
    } catch (error) {
      console.error("Failed to save recipe ingredients:", error);
    }
  };

  const addService = async (service: Partial<Service>) => {
    const newService = await servicesApi.upsert(service);
    if (newService) {
      setServices(prev => [newService, ...prev]);
    }
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    const updated = await servicesApi.upsert({ ...service, id });
    if (updated) {
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    }
  };

  const deleteService = async (id: string) => {
    const success = await servicesApi.delete(id);
    if (success) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    await bookingsApi.updateStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <DataContext.Provider
      value={{
        experiences,
        offers,
        orders,
        testimonials,
        uploads,
        categories,
        loading,
        refreshExperiences,
        refreshOffers,
        refreshOrders,
        refreshTestimonials,
        refreshUploads,
        refreshCategories,
        refreshServices,
        refreshBookings,
        addExperience,
        updateExperience,
        deleteExperience,
        addOffer,
        updateOffer,
        deleteOffer,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        deleteUpload,
        addCategory,
        updateCategory,
        deleteCategory,
        recipes,
        refreshRecipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        saveRecipeIngredients,
        services,
        bookings,
        addService,
        updateService,
        deleteService,
        updateBookingStatus
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
