import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { IVehicleCheckProvider } from './vehicle-check/VehicleCheckProvider';
import { DefaultVehicleCheckProvider } from './vehicle-check/DefaultVehicleCheckProvider';

import { RepuveVehicleCheckProvider } from './vehicle-check/RepuveVehicleCheckProvider';

export interface VehicleCheckResult {
    vin: string;
    status: 'CLEAN' | 'STOLEN' | 'RECOVERED';
    folio: string;
    checkedAt: string;
    source: 'OCRA' | 'REPUVE' | 'AMIS';
    metadata?: any;
}

/**
 * Servicio de Validación Vehicular (Anti-Fraude)
 * Automatiza la consulta a bases de datos de robo (OCRA/REPUVE).
 */
export class VehicleCheckService {
    private static provider: IVehicleCheckProvider | null = null;

    private static getProvider(): IVehicleCheckProvider {
        if (!this.provider) {
            const apiKey = process.env.VEHICLE_CHECK_API_KEY;
            if (apiKey && apiKey !== 'vc-placeholder') {
                this.provider = new RepuveVehicleCheckProvider(apiKey);
            } else {
                this.provider = new DefaultVehicleCheckProvider();
            }
        }
        return this.provider!;
    }

    /**
     * Realiza una consulta en tiempo real o devuelve el modo manual/demo.
     * @param vin Número de Identificación Vehicular
     */
    static async verifyTheftStatus(
        supabase: SupabaseClient<Database>,
        vin: string
    ): Promise<VehicleCheckResult> {
        return await this.getProvider().checkTheftStatus(vin);
    }

    /**
     * Genera la evidencia digital para el expediente.
     * En un futuro, esto podría crear un PDF real. Por ahora, guarda el JSON firmado.
     */
    static async generateCertificate(
        supabase: SupabaseClient<Database>,
        transactionId: string,
        result: VehicleCheckResult
    ) {
        // Guardar en Audit Log como evidencia inmutable
        await supabase.from('audit_logs' as any).insert({
            action: 'VEHICLE_THEFT_CHECK',
            entity_type: 'TRANSACTION',
            entity_id: transactionId,
            metadata: result,
            ip_address: 'SYSTEM_BOT',
            created_at: new Date().toISOString()
        } as any);

        console.log(`[OCRA-BOT] Certificado de No Robo generado: ${result.folio}`);
        return true;
    }
}
