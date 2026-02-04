export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            cars: {
                Row: {
                    created_at: string | null
                    description: string | null
                    has_clinkar_seal: boolean | null
                    id: string
                    images: string[] | null
                    make: string
                    model: string
                    price: number
                    seller_id: string
                    status: string | null
                    vin: string | null
                    year: number
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    has_clinkar_seal?: boolean | null
                    id?: string
                    images?: string[] | null
                    make: string
                    model: string
                    price: number
                    seller_id: string
                    status?: string | null
                    vin?: string | null
                    year: number
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    has_clinkar_seal?: boolean | null
                    id?: string
                    images?: string[] | null
                    make?: string
                    model?: string
                    price?: number
                    seller_id?: string
                    status?: string | null
                    vin?: string | null
                    year?: number
                }
            }
            notifications: {
                Row: {
                    created_at: string
                    id: string
                    is_read: boolean
                    link: string | null
                    message: string
                    title: string
                    type: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    is_read?: boolean
                    link?: string | null
                    message: string
                    title: string
                    type?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    is_read?: boolean
                    link?: string | null
                    message?: string
                    title?: string
                    type?: string
                    user_id?: string
                }
            }
            transactions: {
                Row: {
                    car_id: string
                    car_price: number
                    created_at: string
                    id: string
                    status: string
                    stripe_session_id: string | null
                    buyer_id: string
                    seller_id: string
                    updated_at: string
                    insurance_id: string | null
                    logistics_id: string | null
                    insurance_cost: number | null
                    logistics_cost: number | null
                    warranty_id: string | null
                    warranty_cost: number | null
                    gestoria_cost: number | null
                }
                Insert: {
                    car_id: string
                    car_price: number
                    created_at?: string
                    id?: string
                    status?: string
                    stripe_session_id?: string | null
                    buyer_id: string
                    seller_id: string
                    updated_at?: string
                    insurance_id?: string | null
                    logistics_id?: string | null
                    insurance_cost?: number | null
                    logistics_cost?: number | null
                    warranty_id?: string | null
                    warranty_cost?: number | null
                    gestoria_cost?: number | null
                }
                Update: {
                    car_id?: string
                    car_price?: number
                    created_at?: string
                    id?: string
                    status?: string
                    stripe_session_id?: string | null
                    buyer_id?: string
                    seller_id?: string
                    updated_at?: string
                    insurance_id?: string | null
                    logistics_id?: string | null
                    insurance_cost?: number | null
                    logistics_cost?: number | null
                    warranty_id?: string | null
                    warranty_cost?: number | null
                    gestoria_cost?: number | null
                }
            }
            logistics_orders: {
                Row: {
                    id: string
                    transaction_id: string
                    origin_address: string
                    destination_address: string
                    distance_km: number
                    cost: number
                    status: string
                    tracking_number: string | null
                    provider: string | null
                    estimated_delivery_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    origin_address: string
                    destination_address: string
                    distance_km: number
                    cost: number
                    status?: string
                    tracking_number?: string | null
                    provider?: string | null
                    estimated_delivery_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    origin_address?: string
                    destination_address?: string
                    distance_km?: number
                    cost?: number
                    status?: string
                    tracking_number?: string | null
                    provider?: string | null
                    estimated_delivery_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            warranty_policies: {
                Row: {
                    id: string
                    car_id: string
                    transaction_id: string
                    type: string
                    status: string
                    start_date: string
                    end_date: string
                    coverage_cap_amount: number | null
                    coverage_details: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    car_id: string
                    transaction_id: string
                    type: string
                    status?: string
                    start_date: string
                    end_date: string
                    coverage_cap_amount?: number | null
                    coverage_details?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    car_id?: string
                    transaction_id?: string
                    type?: string
                    status?: string
                    start_date?: string
                    end_date?: string
                    coverage_cap_amount?: number | null
                    coverage_details?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            service_tickets: {
                Row: {
                    id: string
                    car_id: string
                    partner_id: string | null
                    status: string
                    type: string
                    scheduled_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    car_id: string
                    partner_id?: string | null
                    status?: string
                    type: string
                    scheduled_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    car_id?: string
                    partner_id?: string | null
                    status?: string
                    type?: string
                    scheduled_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
