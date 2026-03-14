import { Product, RentalTool, Enquiry, Offer, OfferProduct, OfferCategory, OfferCombo, OfferUsage } from '../types';
import { supabase } from '../../lib/supabase';

// Helper function to convert database row to Product type
function dbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    wholesalePrice: row.wholesale_price,
    image: row.image_url, // Map image_url to image
    stock: row.stock,
    inStock: row.stock > 0, // Derive inStock from stock
    description: row.description,
  };
}

// Helper function to convert Product type to database row
function productToDb(product: Partial<Product>): any {
  const dbRow: any = {};

  if (product.name !== undefined) {
    dbRow.name = product.name;
    // Generate slug from name
    dbRow.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (product.brand !== undefined) dbRow.brand = product.brand;
  if (product.category !== undefined) dbRow.category = product.category;
  if (product.price !== undefined) dbRow.price = product.price;
  if (product.wholesalePrice !== undefined) dbRow.wholesale_price = product.wholesalePrice;
  if (product.image !== undefined) dbRow.image_url = product.image; // Map image to image_url
  if (product.stock !== undefined) dbRow.stock = product.stock;
  if (product.description !== undefined) dbRow.description = product.description;

  return dbRow;
}

// Helper function to convert database row to RentalTool type
function dbToRental(row: any): RentalTool {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || 'INGCO', // Handle missing brand
    image: row.image_url, // Map image_url to image
    rentPerDay: row.rent_per_day,
    rentPerHour: row.rent_per_hour, // Now included in schema
    deposit: row.deposit,
    available: row.available, // Now boolean in schema
    description: row.description,
  };
}

// Helper function to convert RentalTool type to database row
function rentalToDb(rental: Partial<RentalTool>): any {
  const dbRow: any = {};

  if (rental.name !== undefined) {
    dbRow.name = rental.name;
    dbRow.slug = rental.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (rental.brand !== undefined) dbRow.brand = rental.brand;
  if (rental.image !== undefined) dbRow.image_url = rental.image; // Map image to image_url
  if (rental.rentPerDay !== undefined) dbRow.rent_per_day = rental.rentPerDay;
  if (rental.rentPerHour !== undefined) dbRow.rent_per_hour = rental.rentPerHour;
  if (rental.deposit !== undefined) dbRow.deposit = rental.deposit;
  if (rental.available !== undefined) dbRow.available = rental.available;
  if (rental.description !== undefined) dbRow.description = rental.description;

  return dbRow;
}

// Helper function to convert database row to Enquiry type
function dbToEnquiry(row: any): Enquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    message: row.message,
    type: row.type.toLowerCase() as 'product' | 'rental' | 'general',
    date: row.created_at,
  };
}

// Helper function to convert Enquiry type to database row
function enquiryToDb(enquiry: Partial<Enquiry>): any {
  const dbRow: any = {};

  if (enquiry.name !== undefined) dbRow.name = enquiry.name;
  if (enquiry.phone !== undefined) dbRow.phone = enquiry.phone;
  if (enquiry.message !== undefined) dbRow.message = enquiry.message;
  if (enquiry.type !== undefined) dbRow.type = enquiry.type;
  if (enquiry.date !== undefined) dbRow.created_at = enquiry.date;

  return dbRow;
}

// Helper function to convert database row to Offer type
function dbToOffer(row: any): Offer {
  return {
    id: row.id,
    offer_name: row.offer_name,
    offer_description: row.offer_description,
    offer_type: row.offer_type,
    discount_type: row.discount_type,
    discount_value: row.discount_value,
    min_quantity: row.min_quantity,
    max_discount: row.max_discount,
    start_date: row.start_date,
    end_date: row.end_date,
    priority: row.priority,
    status: row.status,
    banner_image_url: row.banner_image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    products: row.offer_products?.map((op: any) => op.product_id) || [],
    categories: row.offer_categories?.map((oc: any) => oc.category_id) || [],
    combo_products: row.offer_combos?.map((oc: any) => oc.product_id) || [],
  };
}

// Helper function to convert Offer type to database row
function offerToDb(offer: Partial<Offer>): any {
  const dbRow: any = {};

  if (offer.offer_name !== undefined) dbRow.offer_name = offer.offer_name;
  if (offer.offer_description !== undefined) dbRow.offer_description = offer.offer_description;
  if (offer.offer_type !== undefined) dbRow.offer_type = offer.offer_type;
  if (offer.discount_type !== undefined) dbRow.discount_type = offer.discount_type;
  if (offer.discount_value !== undefined) dbRow.discount_value = offer.discount_value;
  if (offer.min_quantity !== undefined) dbRow.min_quantity = offer.min_quantity;
  if (offer.max_discount !== undefined) dbRow.max_discount = offer.max_discount;
  if (offer.start_date !== undefined) dbRow.start_date = offer.start_date;
  if (offer.end_date !== undefined) dbRow.end_date = offer.end_date;
  if (offer.priority !== undefined) dbRow.priority = offer.priority;
  if (offer.status !== undefined) dbRow.status = offer.status;
  if (offer.banner_image_url !== undefined) dbRow.banner_image_url = offer.banner_image_url;
  if (offer.updated_at !== undefined) dbRow.updated_at = offer.updated_at;

  return dbRow;
}

// Helper function to convert database row to OfferUsage type
function dbToOfferUsage(row: any): OfferUsage {
  return {
    id: row.id,
    offer_id: row.offer_id,
    order_id: row.order_id,
    customer_id: row.customer_id,
    product_id: row.product_id,
    original_price: row.original_price,
    discounted_price: row.discounted_price,
    discount_applied: row.discount_applied,
    quantity: row.quantity,
    created_at: row.created_at,
  };
}

// Helper function to convert OfferUsage type to database row
function offerUsageToDb(usage: Partial<OfferUsage>): any {
  const dbRow: any = {};

  if (usage.offer_id !== undefined) dbRow.offer_id = usage.offer_id;
  if (usage.order_id !== undefined) dbRow.order_id = usage.order_id;
  if (usage.customer_id !== undefined) dbRow.customer_id = usage.customer_id;
  if (usage.product_id !== undefined) dbRow.product_id = usage.product_id;
  if (usage.original_price !== undefined) dbRow.original_price = usage.original_price;
  if (usage.discounted_price !== undefined) dbRow.discounted_price = usage.discounted_price;
  if (usage.discount_applied !== undefined) dbRow.discount_applied = usage.discount_applied;
  if (usage.quantity !== undefined) dbRow.quantity = usage.quantity;
  if (usage.created_at !== undefined) dbRow.created_at = usage.created_at;

  return dbRow;
}

// ========== PRODUCTS API ==========
export const productsApi = {
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return ((data || []) as any[]).map(dbToProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data ? dbToProduct(data) : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  async add(product: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      const productData = productToDb(product);

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        return null;
      }

      return data ? dbToProduct(data) : null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  },

  async update(id: string, product: Product): Promise<boolean> {
    try {
      const productData = productToDb(product);
      delete productData.id; // Don't update the ID

      const { error } = await supabase
        .from('products')
        .update(productData as any)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },
};

// ========== RENTALS API ==========
export const rentalsApi = {
  async getAll(): Promise<RentalTool[]> {
    try {
      const { data, error } = await supabase
        .from('rental_tools')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching rentals:', error);
        return [];
      }

      return ((data || []) as any[]).map(dbToRental);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      return [];
    }
  },

  async getById(id: string): Promise<RentalTool | null> {
    try {
      const { data, error } = await supabase
        .from('rental_tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching rental:', error);
        return null;
      }

      return data ? dbToRental(data) : null;
    } catch (error) {
      console.error('Error fetching rental:', error);
      return null;
    }
  },

  async add(rental: Omit<RentalTool, 'id'>): Promise<RentalTool | null> {
    try {
      const rentalData = rentalToDb(rental);

      const { data, error } = await supabase
        .from('rental_tools')
        .insert(rentalData)
        .select()
        .single();

      if (error) {
        console.error('Error adding rental:', error);
        return null;
      }

      return data ? dbToRental(data) : null;
    } catch (error) {
      console.error('Error adding rental:', error);
      return null;
    }
  },

  async update(id: string, rental: RentalTool): Promise<boolean> {
    try {
      const rentalData = rentalToDb(rental);
      delete rentalData.id; // Don't update the ID

      const { error } = await supabase
        .from('rental_tools')
        .update(rentalData as any)
        .eq('id', id);

      if (error) {
        console.error('Error updating rental:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating rental:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rental_tools')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting rental:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting rental:', error);
      return false;
    }
  },
};

// ========== ENQUIRIES API ==========
export const enquiriesApi = {
  async getAll(): Promise<Enquiry[]> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enquiries:', error);
        return [];
      }

      return ((data || []) as any[]).map(dbToEnquiry);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      return [];
    }
  },

  async add(enquiry: Omit<Enquiry, 'id' | 'date'>): Promise<Enquiry | null> {
    try {
      const enquiryData = enquiryToDb(enquiry);

      const { data, error } = await supabase
        .from('enquiries')
        .insert(enquiryData)
        .select()
        .single();

      if (error) {
        console.error('Error adding enquiry:', error);
        return null;
      }

      return data ? dbToEnquiry(data) : null;
    } catch (error) {
      console.error('Error adding enquiry:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting enquiry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      return false;
    }
  },
};

// ========== OFFERS API ==========
export const offersApi = {
  async getAll(): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          offer_products(product_id),
          offer_categories(category_id),
          offer_combos(product_id)
        `)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        return [];
      }

      return ((data || []) as any[]).map(dbToOffer);
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  },

  async getActive(): Promise<Offer[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          offer_products(product_id),
          offer_categories(category_id),
          offer_combos(product_id)
        `)
        .eq('status', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching active offers:', error);
        return [];
      }

      return ((data || []) as any[]).map(dbToOffer);
    } catch (error) {
      console.error('Error fetching active offers:', error);
      return [];
    }
  },

  async add(offer: Omit<Offer, 'id' | 'created_at'>): Promise<Offer | null> {
    try {
      console.log('Adding offer:', offer);
      
      const offerData = offerToDb(offer);
      delete offerData.id; // Remove id if present

      const { data, error } = await supabase
        .from('offers')
        .insert(offerData)
        .select()
        .single();

      if (error) {
        console.error('Error adding offer:', error);
        return null;
      }

      const newOffer = data ? dbToOffer(data) : null;
      if (!newOffer) return null;

      // Add related records if they exist
      if (offer.products && offer.products.length > 0) {
        const productRelations = offer.products.map(product_id => ({
          offer_id: newOffer.id,
          product_id
        }));
        
        await supabase
          .from('offer_products')
          .insert(productRelations as any);
      }

      if (offer.categories && offer.categories.length > 0) {
        const categoryRelations = offer.categories.map(category_id => ({
          offer_id: newOffer.id,
          category_id
        }));
        
        await supabase
          .from('offer_categories')
          .insert(categoryRelations as any);
      }

      if (offer.combo_products && offer.combo_products.length > 0) {
        const comboRelations = offer.combo_products.map(product_id => ({
          offer_id: newOffer.id,
          product_id
        }));
        
        await supabase
          .from('offer_combos')
          .insert(comboRelations as any);
      }

      // Return the complete offer with relations
      return await this.getById(newOffer.id);
    } catch (error) {
      console.error('Error adding offer:', error);
      return null;
    }
  },

  async update(id: string, offer: Offer): Promise<boolean> {
    try {
      const offerData = offerToDb(offer);
      delete offerData.id; // Don't update the ID

      const { error } = await supabase
        .from('offers')
        .update(offerData as any)
        .eq('id', id);

      if (error) {
        console.error('Error updating offer:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating offer:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting offer:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting offer:', error);
      return false;
    }
  },

  async getById(id: string): Promise<Offer | null> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          offer_products(product_id),
          offer_categories(category_id),
          offer_combos(product_id)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching offer:', error);
        return null;
      }

      return data ? dbToOffer(data) : null;
    } catch (error) {
      console.error('Error fetching offer:', error);
      return null;
    }
  },

  async getUsageStats(offerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('offer_usage')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offer usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching offer usage:', error);
      return [];
    }
  }
};
