import { z } from "zod";

/**
 * Zod Schemas for Clinkar Data Models
 * These schemas provide runtime validation and static type safety.
 */

export const CarSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    price: z.number().positive(),
    kilometers: z.number().nonnegative(),
    transmission: z.enum(["Automatic", "Manual"]),
    fuel_type: z.enum(["Gasoline", "Diesel", "Electric", "Hybrid"]),
    location: z.string().optional(),
    images: z.array(z.string()).default([]),
    description: z.string().optional(),
    created_at: z.string().datetime().optional(),
});

export const TransactionSchema = z.object({
    id: z.string(),
    car_id: z.string().uuid(),
    buyer_id: z.string().uuid().optional(),
    seller_id: z.string().uuid(),
    status: z.enum(["PENDING", "ACTIVE", "FUNDS_HELD", "RELEASED", "CANCELLED"]),
    car_price: z.number().positive(),
    logistics_cost: z.number().nonnegative().default(0),
    operation_fee: z.number().nonnegative().default(3448),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime().optional(),
});

export type Car = z.infer<typeof CarSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Result pattern for safe service responses
 */
export type ServiceResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };
