import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export class ReviewService {
    static async createReview(supabase: SupabaseClient<Database>, data: {
        transaction_id: string;
        car_id: string;
        rating: number;
        comment: string;
    }) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Debes estar autenticado para calificar.");

        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                user_id: user.id,
                transaction_id: data.transaction_id,
                car_id: data.car_id,
                rating: data.rating,
                comment: data.comment
            } as any)
            .select()
            .single();

        if (error) throw error;
        return review;
    }

    static async getCarReviews(supabase: SupabaseClient<Database>, carId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles:user_id(full_name, avatar_url)')
            .eq('car_id', carId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getTransactionReview(supabase: SupabaseClient<Database>, transactionId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('transaction_id', transactionId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
}
