import { Database } from '@/lib/database.types';
import { NotificationService } from './NotificationService';
import { SupabaseClient } from '@supabase/supabase-js';

export type ServiceTicket = Database['public']['Tables']['service_tickets']['Row'];

export class PartnerService {
    /**
     * Gets all service tickets assigned to a partner.
     */
    static async getTicketsByPartner(supabase: SupabaseClient<Database>) {
        const { data, error } = await supabase
            .from('service_tickets')
            .select(`
                *,
                cars (
                    make,
                    model,
                    year,
                    images,
                    seller_id
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching partner tickets:', error);
            return [];
        }

        return data as any[];
    }

    /**
     * Updates the status of a service ticket.
     */
    static async updateTicketStatus(supabase: SupabaseClient<Database>, ticketId: string, status: string) {
        // Get car/transaction info for notification
        const { data: ticket } = await supabase
            .from('service_tickets')
            .select('*, cars(id, make, model)')
            .eq('id', ticketId)
            .single();

        const { error } = await (supabase
            .from('service_tickets') as any)
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticketId);

        if (error) {
            console.error('Error updating ticket status:', error);
            return { success: false, error };
        }

        // If inspection is completed, notify the buyer
        if (ticket && status === 'COMPLETED') {
            const t = ticket as any;
            // Find the active transaction for this car
            const { data: transaction } = await supabase
                .from('transactions')
                .select('id, buyer_id')
                .eq('car_id', t.car_id)
                .neq('status', 'CANCELLED')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (transaction) {
                const trans = transaction as any;
                await NotificationService.notify(supabase, {
                    userId: trans.buyer_id,
                    title: "Inspección Completada",
                    message: `Tu ${t.cars.make} ${t.cars.model} ha superado con éxito la inspección de seguridad Clinkar.`,
                    type: 'SUCCESS',
                    link: `/dashboard/transactions/${trans.id}`
                });
            }
        }

        return { success: true };
    }
}
