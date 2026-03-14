// Database types for the offer system
// These types should match the database schema exactly

export interface Database {
  public: {
    Tables: {
      offers: {
        Row: {
          id: string;
          offer_name: string;
          offer_description: string | null;
          offer_type: 'product' | 'category' | 'combo';
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_quantity: number;
          max_discount: number | null;
          start_date: string;
          end_date: string | null;
          priority: number;
          status: 'active' | 'inactive';
          banner_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          offer_name: string;
          offer_description?: string | null;
          offer_type: 'product' | 'category' | 'combo';
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_quantity?: number;
          max_discount?: number | null;
          start_date?: string;
          end_date?: string | null;
          priority?: number;
          status?: 'active' | 'inactive';
          banner_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          offer_name?: string;
          offer_description?: string | null;
          offer_type?: 'product' | 'category' | 'combo';
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          min_quantity?: number;
          max_discount?: number | null;
          start_date?: string;
          end_date?: string | null;
          priority?: number;
          status?: 'active' | 'inactive';
          banner_image_url?: string | null;
          updated_at?: string;
        };
      };
      offer_products: {
        Row: {
          id: string;
          offer_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          product_id?: string;
        };
      };
      offer_categories: {
        Row: {
          id: string;
          offer_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          category_id?: string;
        };
      };
      offer_combos: {
        Row: {
          id: string;
          offer_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          product_id?: string;
        };
      };
      offer_usage: {
        Row: {
          id: string;
          offer_id: string;
          user_id: string;
          product_id: string | null;
          original_price: number;
          discounted_price: number;
          discount_amount: number;
          quantity: number;
          used_at: string;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
        };
        Insert: {
          id?: string;
          offer_id: string;
          user_id?: string;
          product_id?: string | null;
          original_price?: number;
          discounted_price?: number;
          discount_amount?: number;
          quantity?: number;
          used_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
        };
        Update: {
          id?: string;
          offer_id?: string;
          user_id?: string;
          product_id?: string | null;
          original_price?: number;
          discounted_price?: number;
          discount_amount?: number;
          quantity?: number;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
        };
      };
    };
    Views: {
      offers_with_relations: {
        Row: {
          id: string;
          offer_name: string;
          offer_description: string | null;
          offer_type: 'product' | 'category' | 'combo';
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_quantity: number;
          max_discount: number | null;
          start_date: string;
          end_date: string | null;
          priority: number;
          status: 'active' | 'inactive';
          banner_image_url: string | null;
          created_at: string;
          updated_at: string;
          products: string[] | null;
          categories: string[] | null;
          combo_products: string[] | null;
          usage_count: number;
        };
      };
    };
    Functions: {
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
}
