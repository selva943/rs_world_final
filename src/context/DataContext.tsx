import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Experience, Offer, Order, Testimonial, Upload, Category, Recipe, Service, Booking, Coupon, AdminApiResponse, Subscription, SubscriptionStatus } from '@/types/app';
import { experiencesApi, offersApi, ordersApi, testimonialsApi, uploadsApi, categoriesApi, recipesApi, servicesApi, bookingsApi, couponsApi, subscriptionsApi } from '@/lib/services/api';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface DataContextType {
  experiences: Experience[];
  hasMoreExperiences: boolean;
  loadMoreExperiences: () => Promise<void>;
  offers: Offer[];
  orders: Order[];
  testimonials: Testimonial[];
  uploads: Upload[];
  categories: Category[];
  recipes: Recipe[];
  services: Service[];
  bookings: Booking[];
  coupons: Coupon[];
  subscriptions: Subscription[];
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
  refreshCoupons: () => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  addExperience: (experience: Omit<Experience, 'id'>) => Promise<AdminApiResponse<Experience>>;
  updateExperience: (id: string, experience: Experience) => Promise<AdminApiResponse<Experience>>;
  deleteExperience: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => Promise<AdminApiResponse<Offer>>;
  updateOffer: (id: string, offer: Offer) => Promise<AdminApiResponse<Offer>>;
  deleteOffer: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<boolean>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<AdminApiResponse<Order>>;
  deleteOrder: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => Promise<AdminApiResponse<Testimonial>>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<AdminApiResponse<Testimonial>>;
  deleteTestimonial: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  deleteUpload: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<AdminApiResponse<Category>>;
  updateCategory: (id: string, category: Category) => Promise<AdminApiResponse<Category>>;
  deleteCategory: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  addRecipe: (recipe: Partial<Recipe>) => Promise<AdminApiResponse<Recipe>>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<AdminApiResponse<Recipe>>;
  deleteRecipe: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  saveRecipeIngredients: (recipe_id: string, ingredients: { product_id: string; quantity: number; uom: string; price_override?: number }[]) => Promise<void>;
  addService: (service: Partial<Service>) => Promise<AdminApiResponse<Service>>;
  updateService: (id: string, service: Partial<Service>) => Promise<AdminApiResponse<Service>>;
  deleteService: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<AdminApiResponse<Booking>>;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'created_at' | 'used_count'>) => Promise<AdminApiResponse<Coupon>>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<AdminApiResponse<Coupon>>;
  deleteCoupon: (id: string) => Promise<AdminApiResponse<{ id: string }>>;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => Promise<AdminApiResponse<Subscription>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [experiencePage, setExperiencePage] = useState(0);
  const [hasMoreExperiences, setHasMoreExperiences] = useState(true);
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize data from server
  const initializeData = async () => {
    setLoading(true);
    try {
      // Fetch all data from server
      const [
        serverExperiences, 
        serverOffers, 
        serverOrders, 
        serverTestimonials, 
        serverUploads, 
        serverCategories, 
        serverRecipes, 
        serverServices, 
        serverBookings,
        serverCoupons,
        serverSubscriptions
      ] = await Promise.all([
        experiencesApi.getAll({ page: 0, limit: 20 }),
        offersApi.getAll(),
        ordersApi.getAll(),
        testimonialsApi.getAll(),
        uploadsApi.getAll(),
        categoriesApi.getAll(),
        recipesApi.getAll(),
        servicesApi.getAll(),
        bookingsApi.getAll(),
        couponsApi.getAll(),
        subscriptionsApi.getAll()
      ]);

      setExperiences(serverExperiences);
      setExperiencePage(1);
      setHasMoreExperiences(serverExperiences.length === 20);
      
      setOffers(serverOffers);
      setOrders(serverOrders);
      setTestimonials(serverTestimonials);
      setUploads(serverUploads);
      setCategories(serverCategories);
      setRecipes(serverRecipes);
      setServices(serverServices);
      setBookings(serverBookings);
      setCoupons(serverCoupons);
      setSubscriptions(serverSubscriptions);

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
    const data = await experiencesApi.getAll({ page: 0, limit: 20 });
    setExperiences(data);
    setExperiencePage(1);
    setHasMoreExperiences(data.length === 20);
  };

  const loadMoreExperiences = async () => {
    if (!hasMoreExperiences) return;
    const newExps = await experiencesApi.getAll({ page: experiencePage, limit: 20 });
    setExperiences(prev => [...prev, ...newExps]);
    setExperiencePage(prev => prev + 1);
    setHasMoreExperiences(newExps.length === 20);
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

  const refreshCoupons = async () => {
    const data = await couponsApi.getAll();
    setCoupons(data);
  };

  const refreshSubscriptions = async () => {
    const data = await subscriptionsApi.getAll();
    setSubscriptions(data);
  };

  const addExperience = async (experience: Record<string, any>) => {
    const res = await experiencesApi.add(experience);
    if (res.success && res.data) {
      setExperiences(prev => [...prev, res.data!]);
    }
    return res;
  };

  const updateExperience = async (id: string, experience: Record<string, any>) => {
    const res = await experiencesApi.update(id, experience);
    if (res.success && res.data) {
      setExperiences(prev => prev.map((e) => (e.id === id ? res.data! : e)));
    }
    return res;
  };

  const deleteExperience = async (id: string) => {
    const res = await experiencesApi.delete(id);
    if (res.success) {
      setExperiences(prev => prev.filter((e) => e.id !== id));
    }
    return res;
  };

  const addOffer = async (offer: Omit<Offer, 'id' | 'created_at'>) => {
    const res = await offersApi.add(offer);
    if (res.success && res.data) {
      setOffers(prev => [...prev, res.data!]);
    }
    return res;
  };

  const updateOffer = async (id: string, offer: Record<string, any>) => {
    const res = await offersApi.update(id, offer);
    if (res.success && res.data) {
      setOffers(prev => prev.map((o) => (o.id === id ? res.data! : o)));
    }
    return res;
  };

  const deleteOffer = async (id: string) => {
    const res = await offersApi.delete(id);
    if (res.success) {
      setOffers(prev => prev.filter((o) => o.id !== id));
    }
    return res;
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
    return success;
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    const res = await ordersApi.update(id, order);
    if (res.success && res.data) {
      setOrders(prev => prev.map(o => o.id === id ? res.data! : o));
    }
    return res;
  };

  const deleteOrder = async (id: string) => {
    const res = await ordersApi.delete(id);
    if (res.success) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
    return res;
  };

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
    const res = await testimonialsApi.add(testimonial);
    if (res.success && res.data) {
      setTestimonials(prev => [...prev, res.data!]);
    }
    return res;
  };

  const updateTestimonial = async (id: string, testimonial: Partial<Testimonial>) => {
    const res = await testimonialsApi.update(id, testimonial);
    if (res.success && res.data) {
      setTestimonials(prev => prev.map(t => t.id === id ? res.data! : t));
    }
    return res;
  };

  const deleteTestimonial = async (id: string) => {
    const res = await testimonialsApi.delete(id);
    if (res.success) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
    return res;
  };

  const deleteUpload = async (id: string) => {
    const res = await uploadsApi.delete(id);
    if (res.success) {
      setUploads(prev => prev.filter(u => u.id !== id));
    }
    return res;
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    const res = await categoriesApi.add(category);
    if (res.success && res.data) {
      setCategories(prev => [...prev, res.data!]);
    }
    return res;
  };

  const updateCategory = async (id: string, category: Category) => {
    const res = await categoriesApi.update(id, category);
    if (res.success && res.data) {
      setCategories(prev => prev.map((c) => (c.id === id ? res.data! : c)));
    }
    return res;
  };

  const deleteCategory = async (id: string) => {
    const res = await categoriesApi.delete(id);
    if (res.success) {
      setCategories(prev => prev.filter((c) => c.id !== id));
    }
    return res;
  };

  const addRecipe = async (recipe: Partial<Recipe>) => {
    const res = await recipesApi.upsert(recipe);
    if (res.success && res.data) {
      setRecipes(prev => [res.data!, ...prev]);
    }
    return res;
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    const res = await recipesApi.upsert({ ...recipe, id });
    if (res.success && res.data) {
      setRecipes(prev => prev.map(r => r.id === id ? res.data! : r));
    }
    return res;
  };

  const deleteRecipe = async (id: string) => {
    const res = await recipesApi.delete(id);
    if (res.success) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    }
    return res;
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
    const res = await servicesApi.upsert(service);
    if (res.success && res.data) {
      setServices(prev => [res.data!, ...prev]);
    }
    return res;
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    const res = await servicesApi.upsert({ ...service, id });
    if (res.success && res.data) {
      setServices(prev => prev.map(s => s.id === id ? res.data! : s));
    }
    return res;
  };

  const deleteService = async (id: string) => {
    const res = await servicesApi.delete(id);
    if (res.success) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
    return res;
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    const res = await bookingsApi.updateStatus(id, status);
    if (res.success && res.data) {
      setBookings(prev => prev.map(b => b.id === id ? res.data! : b));
    }
    return res;
  };

  const addCoupon = async (coupon: Omit<Coupon, 'id' | 'created_at' | 'used_count'>) => {
    const res = await couponsApi.add(coupon);
    if (res.success && res.data) {
      setCoupons(prev => [...prev, res.data!]);
    }
    return res;
  };

  const updateCoupon = async (id: string, coupon: Partial<Coupon>) => {
    const res = await couponsApi.update(id, coupon);
    if (res.success && res.data) {
      setCoupons(prev => prev.map(c => c.id === id ? res.data! : c));
    }
    return res;
  };

  const deleteCoupon = async (id: string) => {
    const res = await couponsApi.delete(id);
    if (res.success) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
    return res;
  };

  const updateSubscriptionStatus = async (id: string, status: SubscriptionStatus) => {
    const res = await subscriptionsApi.updateStatus(id, status);
    if (res.success && res.data) {
      setSubscriptions(prev => prev.map(s => s.id === id ? res.data! : s));
    }
    return res;
  };

  return (
    <DataContext.Provider
      value={{
        experiences,
        hasMoreExperiences,
        loadMoreExperiences,
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
        refreshCoupons,
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
        updateBookingStatus,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        subscriptions,
        refreshSubscriptions,
        updateSubscriptionStatus
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
