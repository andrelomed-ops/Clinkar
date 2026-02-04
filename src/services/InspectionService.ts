import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { PaymentService } from './PaymentService';

interface InspectionReport {
    carId: string;
    score: number;
    details: any;
}

export class InspectionService {
    static async submitReport(supabase: SupabaseClient<Database>, ticketId: string, report: InspectionReport, inspectorId: string) {
        console.log(`[📝 INSPECTION] Submitting report for Ticket ${ticketId}`);

        // 1. Get Ticket to verify logic
        const { data: ticket, error: ticketError } = await supabase
            .from('service_tickets' as any)
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) throw new Error("Ticket not found");
        const t = ticket as any;

        // 2. Save Report (using the 150 points table)
        const overallResult = report.score > 80 ? 'APROBADO' : 'RECHAZADO';

        const { error: reportError } = await (supabase as any)
            .from('inspection_reports_150')
            .insert({
                car_id: t.car_id,
                inspector_id: inspectorId,
                data: report.details,
                overall_result: overallResult,
                notes: `Score: ${report.score}`
            } as any);

        if (reportError) throw reportError;

        // 3. Trigger Payout to Mechanic (Business Logic)
        await PaymentService.payoutToPartner(supabase, ticketId, t.payout_amount);

        // 4. Update Car Status
        const newStatus = overallResult === 'APROBADO' ? 'published' : 'draft';
        const { data: car } = await (supabase.from('cars') as any).update({ status: newStatus } as Database['public']['Tables']['cars']['Update']).eq('id', t.car_id).select('seller_id, make, model').single();

        // 5. Send Notification
        if (car) {
            const { NotificationService } = await import('./NotificationService');
            await NotificationService.notify(supabase, {
                userId: (car as any).seller_id,
                title: "Reporte de Inspección Listo",
                message: `La inspección de tu ${(car as any).make} ${(car as any).model} ha finalizado con resultado: ${overallResult}.`,
                type: overallResult === 'APROBADO' ? 'SUCCESS' : 'WARNING',
                link: `/dashboard/cars/${t.car_id}`
            });
        }

        return { success: true, result: overallResult };
    }

    static async getLatestReport(supabase: SupabaseClient<Database>, carId: string) {
        const { data, error } = await supabase
            .from('inspection_reports_150' as any)
            .select('*')
            .eq('car_id', carId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data as any;
    }
}
