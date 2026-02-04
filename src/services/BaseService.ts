import { PostgrestError } from '@supabase/supabase-js';
import { z } from 'zod';
import { ServiceResult } from './schemas';

export type ServiceResponse<T> = {
    data: T | null;
    error: PostgrestError | Error | null;
};

export class BaseService {
    /**
     * Standard response handler
     */
    protected static handleResponse<T>(
        data: T | null,
        error: PostgrestError | null
    ): ServiceResponse<T> {
        if (error) {
            console.error(`[Supabase Error]: ${error.message}`, error);
            return { data: null, error };
        }
        return { data, error: null };
    }

    /**
     * Advanced handler with Zod validation for fail-safe runtime integrity.
     * Prevents "Cannot read property of undefined" errors.
     */
    public static async validateAndHandle<T>(
        query: Promise<{ data: any; error: PostgrestError | null }>,
        schema: z.ZodType<T>
    ): Promise<ServiceResult<T>> {
        try {
            const { data, error } = await query;

            if (error) {
                console.error(`[Data Fetch Error]: ${error.message}`, error);
                return { success: false, error: error.message, code: error.code };
            }

            if (!data) {
                return { success: false, error: "No data found" };
            }

            const result = schema.safeParse(data);
            if (!result.success) {
                console.error(`[Validation Failed]:`, result.error.format());
                return { success: false, error: "Data integrity violation (Schema Mismatch)" };
            }

            return { success: true, data: result.data };
        } catch (err) {
            console.error(`[Critical Service Failure]:`, err);
            return {
                success: false,
                error: err instanceof Error ? err.message : "Inesperado fallo en el servicio"
            };
        }
    }

    protected static handleError(error: any): ServiceResponse<null> {
        console.error(`[Service Error]:`, error);
        return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
}
