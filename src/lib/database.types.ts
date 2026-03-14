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
                    brand: string
                    category: string
                    price: number
                    wholesale_price: number | null
                    stock: number
                    description: string | null
                    image_url: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    brand: string
                    category: string
                    price: number
                    wholesale_price?: number | null
                    stock: number
                    description?: string | null
                    image_url: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    brand?: string
                    category?: string
                    price?: number
                    wholesale_price?: number | null
                    stock?: number
                    description?: string | null
                    image_url?: string
                    created_at?: string
                }
            }
            rental_tools: {
                Row: {
                    id: string
                    name: string
                    rent_per_day: number
                    deposit: number
                    availability: string
                    description: string | null
                    image_url: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    rent_per_day: number
                    deposit: number
                    availability?: string
                    description?: string | null
                    image_url: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    rent_per_day?: number
                    deposit?: number
                    availability?: string
                    description?: string | null
                    image_url?: string
                    created_at?: string
                }
            }
            offers: {
                Row: {
                    id: string
                    name: string
                    type: 'festival' | 'combo'
                    discount_type: 'percentage' | 'flat'
                    discount_value: number
                    applies_to: 'all' | 'products' | 'rentals' | 'category'
                    category_name: string | null
                    priority: number
                    banner_image_url: string | null
                    start_date: string
                    end_date: string | null
                    status: 'active' | 'inactive'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'festival' | 'combo'
                    discount_type: 'percentage' | 'flat'
                    discount_value: number
                    applies_to: 'all' | 'products' | 'rentals' | 'category'
                    category_name?: string | null
                    priority?: number
                    banner_image_url?: string | null
                    start_date?: string
                    end_date?: string | null
                    status?: 'active' | 'inactive'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'festival' | 'combo'
                    discount_type?: 'percentage' | 'flat'
                    discount_value?: number
                    applies_to?: 'all' | 'products' | 'rentals' | 'category'
                    category_name?: string | null
                    priority?: number
                    banner_image_url?: string | null
                    start_date?: string
                    end_date?: string | null
                    status?: 'active' | 'inactive'
                    created_at?: string
                }
            }
            offer_products: {
                Row: {
                    id: string
                    offer_id: string
                    product_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    offer_id: string
                    product_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    offer_id?: string
                    product_id?: string
                    created_at?: string
                }
            }
            offer_rentals: {
                Row: {
                    id: string
                    offer_id: string
                    rental_tool_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    offer_id: string
                    rental_tool_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    offer_id?: string
                    rental_tool_id?: string
                    created_at?: string
                }
            }
            offer_categories: {
                Row: {
                    id: string
                    offer_id: string
                    category_name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    offer_id: string
                    category_name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    offer_id?: string
                    category_name?: string
                    created_at?: string
                }
            }
            enquiries: {
                Row: {
                    id: string
                    name: string
                    phone: string
                    message: string
                    type: 'Product' | 'Rental' | 'General'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    phone: string
                    message: string
                    type: 'Product' | 'Rental' | 'General'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    phone?: string
                    message?: string
                    type?: 'Product' | 'Rental' | 'General'
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
