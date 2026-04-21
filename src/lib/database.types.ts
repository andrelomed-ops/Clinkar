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
                    has_starterkar_seal: boolean | null
                    id: string
                    images: string[] | null
                    make: string
                    model: string
                    price: number
                    seller_id: string
                    status: string | null
                    vin: string | null
                    year: number
                    mileage: number | null
                    fuel_type: string | null
                    transmission: string | null
                    sensory_data: Json | null
                    market_data: Json | null
                    digital_passport_data: Json | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    has_starterkar_seal?: boolean | null
                    id?: string
                    images?: string[] | null
                    make: string
                    model: string
                    price: number
                    seller_id: string
                    status?: string | null
                    vin?: string | null
                    year: number
                    mileage?: number | null
                    fuel_type?: string | null
                    transmission?: string | null
                    sensory_data?: Json | null
                    market_data?: Json | null
                    digital_passport_data?: Json | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    has_starterkar_seal?: boolean | null
                    id?: string
                    images?: string[] | null
                    make?: string
                    model?: string
                    price?: number
                    seller_id?: string
                    status?: string | null
                    vin?: string | null
                    year?: number
                    mileage?: number | null
                    fuel_type?: string | null
                    transmission?: string | null
                    sensory_data?: Json | null
                    market_data?: Json | null
                    digital_passport_data?: Json | null
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
            audit_logs: {
                Row: {
                    id: string
                    actor_id: string
                    action: string
                    entity_type: string
                    entity_id: string | null
                    metadata: Json | null
                    ip_address: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    actor_id: string
                    action: string
                    entity_type: string
                    entity_id?: string | null
                    metadata?: Json | null
                    ip_address?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    actor_id?: string
                    action?: string
                    entity_type?: string
                    entity_id?: string | null
                    metadata?: Json | null
                    ip_address?: string | null
                    created_at?: string
                }
            }
            risk_profiles: {
                Row: {
                    user_id: string
                    verification_status: string
                    risk_level: string
                    risk_score: number | null
                    last_assessment_at: string | null
                    flags: string[] | null
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    verification_status?: string
                    risk_level?: string
                    risk_score?: number | null
                    last_assessment_at?: string | null
                    flags?: string[] | null
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    verification_status?: string
                    risk_level?: string
                    risk_score?: number | null
                    last_assessment_at?: string | null
                    flags?: string[] | null
                    updated_at?: string
                }
            }
            compliance_checks: {
                Row: {
                    id: string
                    user_id: string
                    check_type: string
                    provider: string | null
                    result: string
                    matches: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    check_type: string
                    provider?: string | null
                    result: string
                    matches?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    check_type?: string
                    provider?: string | null
                    result?: string
                    matches?: Json | null
                    created_at?: string
                }
            }
            demand_registry: {
                Row: {
                    id: string
                    user_id: string | null
                    brand: string
                    model: string | null
                    year_min: number | null
                    year_max: number | null
                    budget_min: number | null
                    budget_max: number | null
                    location: string | null
                    notes: string | null
                    status: string
                    match_found: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    brand: string
                    model?: string | null
                    year_min?: number | null
                    year_max?: number | null
                    budget_min?: number | null
                    budget_max?: number | null
                    location?: string | null
                    notes?: string | null
                    status?: string
                    match_found?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    brand?: string
                    model?: string | null
                    year_min?: number | null
                    year_max?: number | null
                    budget_min?: number | null
                    budget_max?: number | null
                    location?: string | null
                    notes?: string | null
                    status?: string
                    match_found?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            seller_leads: {
                Row: {
                    id: string
                    user_id: string | null
                    current_brand: string
                    current_model: string
                    current_year: number
                    current_price_expected: number | null
                    condition: string | null
                    looking_for: string | null
                    contact_preference: string | null
                    status: string
                    demand_match_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    current_brand: string
                    current_model: string
                    current_year: number
                    current_price_expected?: number | null
                    condition?: string | null
                    looking_for?: string | null
                    contact_preference?: string | null
                    status?: string
                    demand_match_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    current_brand?: string
                    current_model?: string
                    current_year?: number
                    current_price_expected?: number | null
                    condition?: string | null
                    looking_for?: string | null
                    contact_preference?: string | null
                    status?: string
                    demand_match_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_perks: {
                Row: {
                    id: string
                    user_id: string
                    perk_type: string
                    status: string
                    metadata: Json | null
                    created_at: string
                    expires_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    perk_type: string
                    status?: string
                    metadata?: Json | null
                    created_at?: string
                    expires_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    perk_type?: string
                    status?: string
                    metadata?: Json | null
                    created_at?: string
                    expires_at?: string | null
                }
            }
            car_locks: {
                Row: {
                    id: string
                    car_id: string
                    locked_by: string
                    expires_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    car_id: string
                    locked_by: string
                    expires_at: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    car_id?: string
                    locked_by?: string
                    expires_at?: string
                    created_at?: string
                }
            }
            car_waitlists: {
                Row: {
                    id: string
                    car_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    car_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    car_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            partners: {
                Row: {
                    id: string
                    name: string
                    address: string
                    city: string
                    phone: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    address: string
                    city: string
                    phone?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    address?: string
                    city?: string
                    phone?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
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
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
