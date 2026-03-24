export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          subcategory: string | null
          type: string
          price: number
          stock: number
          unit: string | null
          description: string | null
          image: string | null
          image_url: string | null
          is_featured: boolean
          is_active: boolean
          is_subscription_available: boolean | null
          is_recipe_kit: boolean | null
          is_veg: boolean | null
          sku: string | null
          tags: Json | null
          discount_price: number | null
          discount_percentage: number | null
          allowed_frequencies: Json | null
          variants: Json | null
          media: Json | null
          experience_config: Json | null
          service_type: string | null
          service_price_type: string | null
          service_duration: string | null
          service_area: Json | null
          peak_hour_multiplier: number | null
          subscription_type: string | null
          subscription_frequency: string | null
          serving_size: string | null
          cooking_time: string | null
          brand: string | null
          wholesale_price: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          category: string
          subcategory?: string | null
          type?: string
          price: number
          stock?: number
          unit?: string | null
          description?: string | null
          image?: string | null
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          is_subscription_available?: boolean | null
          is_recipe_kit?: boolean | null
          is_veg?: boolean | null
          sku?: string | null
          tags?: Json | null
          discount_price?: number | null
          discount_percentage?: number | null
          allowed_frequencies?: Json | null
          variants?: Json | null
          media?: Json | null
          experience_config?: Json | null
          service_type?: string | null
          service_price_type?: string | null
          service_duration?: string | null
          service_area?: Json | null
          peak_hour_multiplier?: number | null
          subscription_type?: string | null
          subscription_frequency?: string | null
          serving_size?: string | null
          cooking_time?: string | null
          brand?: string | null
          wholesale_price?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          subcategory?: string | null
          type?: string
          price?: number
          stock?: number
          unit?: string | null
          description?: string | null
          image?: string | null
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          is_subscription_available?: boolean | null
          is_recipe_kit?: boolean | null
          is_veg?: boolean | null
          sku?: string | null
          tags?: Json | null
          discount_price?: number | null
          discount_percentage?: number | null
          allowed_frequencies?: Json | null
          variants?: Json | null
          media?: Json | null
          experience_config?: Json | null
          service_type?: string | null
          service_price_type?: string | null
          service_duration?: string | null
          service_area?: Json | null
          peak_hour_multiplier?: number | null
          subscription_type?: string | null
          subscription_frequency?: string | null
          serving_size?: string | null
          cooking_time?: string | null
          brand?: string | null
          wholesale_price?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string | null
          icon: string | null
          display_order: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          icon?: string | null
          display_order?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          icon?: string | null
          display_order?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          slug: string | null
          category: string
          cuisine: string | null
          prep_time: string | null
          difficulty: string | null
          image: string | null
          description: string | null
          instructions: Json | null
          video_url: string | null
          portion_size: number | null
          calories: number | null
          tags: Json | null
          is_trending: boolean
          is_featured: boolean
          is_seasonal: boolean | null
          views_count: number | null
          orders_count: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          category: string
          cuisine?: string | null
          prep_time?: string | null
          difficulty?: string | null
          image?: string | null
          description?: string | null
          instructions?: Json | null
          video_url?: string | null
          portion_size?: number | null
          calories?: number | null
          tags?: Json | null
          is_trending?: boolean
          is_featured?: boolean
          is_seasonal?: boolean | null
          views_count?: number | null
          orders_count?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          category?: string
          cuisine?: string | null
          prep_time?: string | null
          difficulty?: string | null
          image?: string | null
          description?: string | null
          instructions?: Json | null
          video_url?: string | null
          portion_size?: number | null
          calories?: number | null
          tags?: Json | null
          is_trending?: boolean
          is_featured?: boolean
          is_seasonal?: boolean | null
          views_count?: number | null
          orders_count?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          product_id: string
          quantity_label: string
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          product_id: string
          quantity_label: string
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          product_id?: string
          quantity_label?: string
          display_order?: number | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_phone: string
          product_id: string
          status: string
          frequency: string
          quantity: number
          total_per_delivery: number | null
          start_date: string
          end_date: string | null
          next_delivery_date: string | null
          delivery_slot: string | null
          address: string | null
          auto_renew: boolean | null
          schedule: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_phone: string
          product_id: string
          status?: string
          frequency: string
          quantity: number
          total_per_delivery?: number | null
          start_date: string
          end_date?: string | null
          next_delivery_date?: string | null
          delivery_slot?: string | null
          address?: string | null
          auto_renew?: boolean | null
          schedule?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_phone?: string
          product_id?: string
          status?: string
          frequency?: string
          quantity?: number
          total_per_delivery?: number | null
          start_date?: string
          end_date?: string | null
          next_delivery_date?: string | null
          delivery_slot?: string | null
          address?: string | null
          auto_renew?: boolean | null
          schedule?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          service_id: string
          customer_name: string
          customer_phone: string
          booking_date: string
          slot_time: string
          status: string
          total_price: number
          notes: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          customer_name: string
          customer_phone: string
          booking_date: string
          slot_time: string
          status?: string
          total_price: number
          notes?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          customer_name?: string
          customer_phone?: string
          booking_date?: string
          slot_time?: string
          status?: string
          total_price?: number
          notes?: string | null
          address?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          product_id: string | null
          customer_name: string | null
          phone: string | null
          address: string | null
          delivery_type: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          customer_name?: string | null
          phone?: string | null
          address?: string | null
          delivery_type?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          customer_name?: string | null
          phone?: string | null
          address?: string | null
          delivery_type?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          name: string
          message: string
          rating: number | null
          media: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          message: string
          rating?: number | null
          media?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          message?: string
          rating?: number | null
          media?: string | null
          created_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          name: string | null
          slug: string | null
          description: string | null
          offer_type: string
          discount_type: string
          discount_value: number
          min_quantity: number | null
          max_discount: number | null
          start_date: string | null
          end_date: string | null
          banner_image: string | null
          badge: string | null
          is_active: boolean
          is_featured: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          slug?: string | null
          description?: string | null
          offer_type: string
          discount_type: string
          discount_value: number
          min_quantity?: number | null
          max_discount?: number | null
          start_date?: string | null
          end_date?: string | null
          banner_image?: string | null
          badge?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          slug?: string | null
          description?: string | null
          offer_type?: string
          discount_type?: string
          discount_value?: number
          min_quantity?: number | null
          max_discount?: number | null
          start_date?: string | null
          end_date?: string | null
          banner_image?: string | null
          badge?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          created_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          file_url: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          file_url: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          file_url?: string
          file_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
