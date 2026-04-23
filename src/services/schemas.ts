import { z } from "zod";

/**
 * Zod Schemas for StarterKar Data Models
 * These schemas provide runtime validation and static type safety.
 */

export const CarSchema = z.object({
    id: z.string(),
    make: z.string().default("Vehículo"),
    model: z.string().default("Desconocido"),
    year: z.number().int().default(new Date().getFullYear()),
    price: z.number().default(0),
    description: z.string().optional().nullable(),
    images: z.array(z.string()).default([]).nullable(),
    status: z.string().optional().nullable(),
    vin: z.string().optional().nullable(),
    has_starterkar_seal: z.boolean().default(false).nullable(),
    mileage: z.number().optional().nullable(),
    fuel_type: z.string().optional().nullable(),
    transmission: z.string().optional().nullable(),
    sensory_data: z.any().optional().nullable(),
    market_data: z.any().optional().nullable(),
    digital_passport_data: z.any().optional().nullable(),
    created_at: z.string().optional().nullable(),
});

export const TransactionSchema = z.object({
    id: z.string().uuid(),
    car_id: z.string().uuid(),
    buyer_id: z.string().uuid(),
    seller_id: z.string().uuid(),
    car_price: z.number().positive(),
    status: z.string(),
    stripe_session_id: z.string().optional().nullable(),
    insurance_id: z.string().optional().nullable(),
    logistics_id: z.string().optional().nullable(),
    insurance_cost: z.number().nonnegative().optional().nullable(),
    logistics_cost: z.number().nonnegative().optional().nullable(),
    warranty_id: z.string().optional().nullable(),
    warranty_cost: z.number().nonnegative().optional().nullable(),
    gestoria_cost: z.number().nonnegative().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const DemandRequestSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid().optional().nullable(),
    brand: z.string(),
    model: z.string().optional().nullable(),
    year_min: z.number().optional().nullable(),
    year_max: z.number().optional().nullable(),
    budget_min: z.number().optional().nullable(),
    budget_max: z.number().optional().nullable(),
    status: z.enum(['pending', 'notified', 'matched', 'fulfilled', 'expired']),
    match_found: z.boolean().optional().nullable(),
});

export const SellerLeadSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid().optional().nullable(),
    current_brand: z.string(),
    current_model: z.string(),
    current_year: z.number(),
    status: z.string(),
});

export const AuditLogSchema = z.object({
    id: z.string().uuid(),
    actor_id: z.string().uuid(),
    action: z.string(),
    entity_type: z.string(),
    entity_id: z.string().optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional().nullable(),
    created_at: z.string(),
});

export type Car = z.infer<typeof CarSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type DemandRequest = z.infer<typeof DemandRequestSchema>;
export type SellerLead = z.infer<typeof SellerLeadSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Result pattern for safe service responses
 */
export type ServiceResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };

