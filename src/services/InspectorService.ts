
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export type InspectionData = Record<string, { pass: boolean; note?: string; photos?: string[] }>;

export class InspectorService {

    // 1. Create Report
    static async createReport(
        supabase: SupabaseClient<Database>,
        carId: string,
        inspectorId: string,
        data: InspectionData,
        overallResult: 'APROBADO' | 'RECHAZADO',
        notes?: string
    ) {
        // DEMO BYPASS: If carId is a mock ID, simulate success
        if (carId.startsWith('mock-')) {
            console.log("Demo Mode: Simulating report save for", carId);
            return { id: `mock-report-${Date.now()}`, created_at: new Date().toISOString() };
        }

        const { data: report, error } = await supabase
            .from('inspection_reports_150' as any)
            // @ts-ignore
            .insert({
                car_id: carId,
                inspector_id: inspectorId,
                data: data,
                overall_result: overallResult,
                notes: notes
            })
            .select()
            .single();

        if (error) throw error;

        // If Approved, Seal the Car (Auto-magic)
        if (overallResult === 'APROBADO') {
            await supabase
                .from('cars')
                // @ts-ignore
                .update({ has_clinkar_seal: true } as any)
                .eq('id', carId);
        }

        return report;
    }

    // 2. Create Quotation (For repairs if rejected)
    static async createQuotation(
        supabase: SupabaseClient<Database>,
        carId: string,
        inspectorId: string,
        reportId: string,
        items: { id: string; label: string; cost: number }[]
    ) {
        const total = items.reduce((sum, item) => sum + item.cost, 0);

        const { data: quote, error } = await supabase
            .from('repair_quotations' as any)
            // @ts-ignore
            .insert({
                car_id: carId,
                inspector_id: inspectorId,
                inspection_report_id: reportId,
                items: items,
                total_amount: total,
                status: 'PENDING_BUYER'
            })
            .select()
            .single();

        if (error) throw error;
        return quote;
    }

    // 3. Get Report by Car
    static async getReportByCar(supabase: SupabaseClient<Database>, carId: string) {
        return await supabase
            .from('inspection_reports_150' as any)
            .select('*')
            .eq('car_id', carId)
            .maybeSingle(); // Use maybeSingle as it might not exist
    }

    // 4. Upload Evidence to Storage
    static async uploadEvidence(
        supabase: SupabaseClient<Database>,
        carId: string,
        file: File
    ) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${carId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `evidence/${fileName}`;

        const { data, error } = await supabase.storage
            .from('inspection-evidence')
            .upload(filePath, file);

        if (error) throw error;

        // Return the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('inspection-evidence')
            .getPublicUrl(filePath);

        return publicUrl;
    }
}
