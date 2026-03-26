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
          description: string | null
          image: string | null
          image_url: string | null
          media: string[] | null
          unit: string | null
          sku: string | null
          tags: string[] | null
          base_unit: string | null
          conversion_factor: number | null
          discount_price: number | null
          discount_percentage: number | null
          is_subscription_available: boolean | null
          allowed_frequencies: string[] | null
          subscription_options: Json | null
          variants: Json | null
          is_recipe_kit: boolean | null
          is_veg: boolean | null
          serving_size: string | null
          cooking_time: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['products']['Row']>
        Update: Partial<Database['public']['Tables']['products']['Row']>
      }
      recipes: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          prep_time: string | null
          difficulty: string | null
          image: string | null
          description: string | null
          instructions: Json | null
          video_url: string | null
          portion_size: number | null
          calories: number | null
          tags: Json | null
          is_trending: boolean | null
          is_featured: boolean | null
          is_seasonal: boolean | null
          views_count: number | null
          orders_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['recipes']['Row']>
        Update: Partial<Database['public']['Tables']['recipes']['Row']>
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          product_id: string
          quantity: number
          uom: string
          price_override: number | null
          display_order: number | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['recipe_ingredients']['Row']>
        Update: Partial<Database['public']['Tables']['recipe_ingredients']['Row']>
      }
      offers: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          offer_type: string
          discount_type: string
          discount_value: number
          min_quantity: number
          max_discount: number | null
          start_date: string
          end_date: string | null
          banner_image: string | null
          badge: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['offers']['Row']>
        Update: Partial<Database['public']['Tables']['offers']['Row']>
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          phone: string
          address: string | null
          status: string
          total_amount: number
          created_at: string
          user_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['orders']['Row']>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['categories']['Row']>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      services: {
        Row: {
          id: string
          name: string
          slug: string
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['services']['Row']>
        Update: Partial<Database['public']['Tables']['services']['Row']>
      }
      bookings: {
        Row: {
          id: string
          service_id: string
          status: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['bookings']['Row']>
        Update: Partial<Database['public']['Tables']['bookings']['Row']>
      }
      testimonials: {
        Row: {
          id: string
          name: string
          message: string
          rating: number
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['testimonials']['Row']>
        Update: Partial<Database['public']['Tables']['testimonials']['Row']>
      }
      uploads: {
        Row: {
          id: string
          file_url: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['uploads']['Row']>
        Update: Partial<Database['public']['Tables']['uploads']['Row']>
      }
    }
  }
}
