import { BaseService } from './BaseService';
import { v4 as uuidv4 } from 'uuid';
import { ServiceTicketService } from './ServiceTicketService';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export class PaymentService extends BaseService {

    // Simulates charging a card and records it in DB
    static async chargeCard(supabase: SupabaseClient<Database>, ticketId: string, amount: number) {


        // TODO: Replace with real Stripe Charge
        await new Promise(r => setTimeout(r, 500));
        const txnId = `ch_${uuidv4().substring(0, 8)}`;

        try {
            // Record in DB
            const { error, data } = await supabase
                .from('service_payments' as any)
                .insert({
                    ticket_id: ticketId,
                    amount: amount,
                    type: 'CHARGE',
                    stripe_id: txnId,
                    status: 'SUCCEEDED'
                } as any)
                .select()
                .single();

            if (error) {
                return this.handleResponse(null, error);
            }

            // Update Ticket Status
            await ServiceTicketService.markAsPaid(supabase, ticketId);

            return { data: { success: true, txnId, payment: data }, error: null };
        } catch (e) {
            return this.handleError(e);
        }
    }

    // Simulates payout to partner
    static async payoutToPartner(supabase: SupabaseClient<Database>, ticketId: string, amount: number) {


        // TODO: Replace with real Stripe Transfer
        await new Promise(r => setTimeout(r, 500));
        const txnId = `po_${uuidv4().substring(0, 8)}`;

        try {
            const { error, data } = await supabase
                .from('service_payments' as any)
                .insert({
                    ticket_id: ticketId,
                    amount: amount,
                    type: 'PAYOUT',
                    stripe_id: txnId,
                    status: 'SUCCEEDED'
                } as any)
                .select()
                .single();

            if (error) return this.handleResponse(null, error);

            // Update Ticket Payout Status
            await (supabase
                .from('service_tickets') as any)
                .update({ payout_status: 'PAID' })
                .eq('id', ticketId);

            return { data: { success: true, txnId, payment: data }, error: null };
        } catch (e) {
            return this.handleError(e);
        }
    }
}
