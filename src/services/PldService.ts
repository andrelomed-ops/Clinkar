import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export type PldRiskLevel = 'CLEAN' | 'WARNING' | 'BLOCKED';

export interface PldMatch {
    list: 'OFAC' | 'SAT_69B' | 'UIF' | 'INTERPOL';
    reason: string;
    details: string;
}

export interface PldScreeningResult {
    name: string;
    rfc: string;
    riskLevel: PldRiskLevel;
    matches: PldMatch[];
    checkedAt: string;
    screeningId: string;
}

/**
 * Servicio de Prevención de Lavado de Dinero (PLD / AML)
 * Simula la consulta a listas negras internacionales y nacionales.
 */
export class PldService {

    /**
     * Ejecuta un screening completo de una persona o entidad y guarda el log de auditoría.
     */
    static async screenPerson(
        supabase: SupabaseClient<Database>,
        userId: string,
        name: string,
        rfc: string = "XAXX010101000",
        context: 'ONBOARDING' | 'TRANSACTION' = 'TRANSACTION'
    ): Promise<PldScreeningResult> {
        console.log(`[PLD-AUDIT] Ejecutando screening para: ${name} (User: ${userId})...`);

        // 0. SMART CACHING (Optimización Operativa)
        // Verificar si ya existe un perfil de riesgo vigente (< 24 horas)
        try {
            const { data: profile } = await supabase
                .from('risk_profiles' as any)
                .select('*')
                .eq('user_id', userId)
                .single();

            if (profile) {
                const p = profile as any;
                const lastCheck = new Date(p.last_assessment_at);
                const now = new Date();
                const hoursDiff = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);

                if (hoursDiff < 24) {
                    console.log(`[PLD-CACHE] Perfil vigente encontrado (Hace ${hoursDiff.toFixed(1)}h). Saltando scan externo.`);
                    return {
                        name,
                        rfc,
                        riskLevel: p.risk_level === 'BLOCKED' ? 'BLOCKED' :
                            p.risk_level === 'HIGH' ? 'WARNING' : 'CLEAN',
                        matches: [], // En cache simplificado no devolvemos detalle completo, o podríamos guardarlo en JSON column
                        checkedAt: p.last_assessment_at,
                        screeningId: `CACHE-${p.user_id.substring(0, 8)}`
                    };
                }
            }
        } catch (e) {
            console.warn("Error leyendo cache PLD, procediendo a scan completo:", e);
        }

        // Simular latencia de red (Simulación de API externa - Solo si no hubo Cache Hit)
        await new Promise(resolve => setTimeout(resolve, 800));

        const matches: PldMatch[] = [];
        const upperName = name.toUpperCase();

        // 1. Check OFAC (EE.UU.) - "Hard Block"
        if (upperName.includes("PABLO") && upperName.includes("ESCOBAR")) {
            matches.push({
                list: 'OFAC',
                reason: 'Narcotráfico / SDNTK',
                details: 'Coincidencia exacta en lista SDN (Specially Designated Nationals).'
            });
        }

        if (upperName.includes("EL CHAPO") || upperName.includes("GUZMAN")) {
            matches.push({
                list: 'OFAC',
                reason: 'Narcotráfico / SDNTK',
                details: 'Coincidencia parcial en lista Kingpin Act.'
            });
        }

        // 2. Check SAT 69-B (Empresas Fantasma) - "Hard Block"
        if (upperName.includes("FANTASMA") || upperName.includes("FACTURERA") || upperName.includes("LAVADO")) {
            matches.push({
                list: 'SAT_69B',
                reason: 'Contribuyente Incumplido (Definitivo)',
                details: 'Empresa listada en el Art. 69-B del CFF como presunta EFO.'
            });
        }

        // 3. Check UIF (Personas Bloqueadas) - "Warning / Enhanced Due Diligence"
        if (upperName.includes("POLITICO") || upperName.includes("GOBERNADOR")) {
            matches.push({
                list: 'UIF',
                reason: 'PEP (Persona Políticamente Expuesta)',
                details: 'Requiere debida diligencia reforzada (EDD).'
            });
        }

        // Determine Risk Level
        let riskLevel: PldRiskLevel = 'CLEAN';
        let resultDb: 'CLEAR' | 'WARNING' | 'BLOCKED' = 'CLEAR';

        if (matches.some(m => m.list === 'OFAC' || m.list === 'SAT_69B')) {
            riskLevel = 'BLOCKED';
            resultDb = 'BLOCKED';
        } else if (matches.length > 0) {
            riskLevel = 'WARNING';
            resultDb = 'WARNING';
        }

        // PERSISTENCIA EN BÓVEDA (Audit Trail)
        // Se guarda el registro inmutable en compliance_checks
        try {
            await supabase.from('compliance_checks' as any).insert({
                user_id: userId,
                check_type: context,
                provider: 'CLINKAR_INTERNAL_ENGINE_V1',
                result: resultDb,
                matches: matches,
                created_at: new Date().toISOString()
            } as any);

            // Actualizar Risk Profile del usuario
            if (riskLevel !== 'CLEAN') {
                await supabase.from('risk_profiles' as any).upsert({
                    user_id: userId,
                    risk_level: riskLevel === 'BLOCKED' ? 'BLOCKED' : 'HIGH',
                    risk_score: riskLevel === 'BLOCKED' ? 100 : 75,
                    last_assessment_at: new Date().toISOString(),
                    flags: matches.map(m => m.list)
                } as any);
            }
        } catch (e) {
            console.error("Error persistiendo log PLD:", e);
            // No detenemos el flujo aquí, pero en producción esto debería ser crítico.
        }

        return {
            name,
            rfc,
            riskLevel,
            matches,
            checkedAt: new Date().toISOString(),
            screeningId: `PLD-${Math.floor(Math.random() * 1000000)}`
        };
    }
}
