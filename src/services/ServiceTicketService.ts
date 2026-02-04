import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export interface ServiceTicket {
    id: string;
    car_id: string;
    workshop_id: string;
    workshop_name: string;
    scheduled_date: string;
    status: 'PAID_PENDING_VISIT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT';
    payout_status: 'PENDING' | 'PAID' | 'FAILED';
    payout_amount: number;
    created_at: string;
}

export class ServiceTicketService {

    // Create a new ticket (Pending Payment)
    static async createTicket(supabase: SupabaseClient<Database>, carId: string, workshopId: string, workshopName: string, scheduledDate: string) {
        const { data, error } = await supabase
            .from('service_tickets' as any)
            .insert({
                car_id: carId,
                workshop_id: workshopId,
                workshop_name: workshopName,
                scheduled_date: scheduledDate,
                status: 'PENDING_PAYMENT',
                payout_amount: 750 // Default from simulation
            } as any)
            .select()
            .single();

        if (error) throw error;
        return data as any as ServiceTicket;
    }

    // Mark as PAID (after successful charge)
    static async markAsPaid(supabase: SupabaseClient<Database>, ticketId: string) {
        const { data, error } = await (supabase
            .from('service_tickets') as any)
            .update({ status: 'PAID_PENDING_VISIT' })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) throw error;

        // Also update car status if linked
        if (data) {
            await (supabase.from('cars') as any).update({ status: 'pending_inspection' }).eq('id', (data as any).car_id);
        }

        return data as any as ServiceTicket;
    }

    static async getTicketByCar(supabase: SupabaseClient<Database>, carId: string) {
        const { data, error } = await supabase
            .from('service_tickets' as any)
            .select('*')
            .eq('car_id', carId)
            .maybeSingle();

        if (error) throw error;
        return data as any as ServiceTicket | null;
    }
}
