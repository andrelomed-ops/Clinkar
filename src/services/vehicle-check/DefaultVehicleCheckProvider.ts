import { VehicleCheckResult } from '../VehicleCheckService';
import { IVehicleCheckProvider } from './VehicleCheckProvider';
import { Logger } from '@/lib/logger';

export class DefaultVehicleCheckProvider implements IVehicleCheckProvider {
    async checkTheftStatus(vin: string): Promise<VehicleCheckResult> {
        Logger.info(`[VehicleCheck] Consultando estatus legal para VIN: ${vin}...`);

        // Simulación de latencia de red
        await new Promise(resolve => setTimeout(resolve, 1500));

        const upperVin = vin.toUpperCase();

        if (upperVin.includes("ROBADO")) {
            return {
                vin,
                status: 'STOLEN',
                folio: `ALERT-THEFT-${Date.now()}`,
                checkedAt: new Date().toISOString(),
                source: 'OCRA',
                metadata: {
                    reason: 'Reporte de robo vigente',
                    authority: 'Fiscalía General de Justicia',
                    isDemo: true,
                    manualVerifyUrl: 'https://www2.repuve.gob.mx:8443/ciudadania/'
                }
            };
        }

        return {
            vin,
            status: 'CLEAN',
            folio: `REP-OK-${Math.floor(Math.random() * 1000000)}`,
            checkedAt: new Date().toISOString(),
            source: 'REPUVE',
            metadata: {
                isDemo: true,
                manualVerifyUrl: 'https://www2.repuve.gob.mx:8443/ciudadania/',
                instructions: 'Para verificación oficial gratuita, use el enlace manual.'
            }
        };
    }
}
