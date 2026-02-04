/**
 * FISCAL UTILS - MÉXICO
 * 
 * Cumplimiento con:
 * - Ley del IVA (Plataformas Digitales)
 * - Ley del ISR (Retenciones Art. 113-A)
 * - Ley Anti-Lavado (LFPIORPI)
 */

export type UserFiscalRegime = 'RESICO' | 'PFF' | 'PM' | 'EXTRANJERO';

// Configuración de comisiones Clinkar 2026 (CEO Plan)
export const BUSINESS_RULES = {
    INSPECTION_TOTAL: 1500,
    INSPECTION_PHASE_1: 900,
    INSPECTION_PHASE_2: 600,
    PLATFORM_BASE_FEE: 1999, // Fijo operativo (IVA incluido)
    PLATFORM_VARIABLE_RATE: 0.015, // 1.5% del valor de venta (IVA incluido)
    BUYER_FEE: 0, // Clinkar es gratis para el comprador (atracción de mercado)
    IVA_RATE: 0.16,
    INCENTIVE_THRESHOLD: 120000, // Autos económicos bonificables
    MAX_TOTAL_FEE: 9999 + 1600 // Tope máximo sugerido en estrategia ($9,999 + IVA aprox, ajustaremos a neto)
};

/**
 * Calcula la comisión total de la plataforma para el vendedor.
 * Modelo: Base Fija + % Variable.
 */
export const calculatePlatformFee = (carPrice: number) => {
    let variable = carPrice * BUSINESS_RULES.PLATFORM_VARIABLE_RATE;
    let base = BUSINESS_RULES.PLATFORM_BASE_FEE;

    // Lógica de incentivo para autos menores a $120k
    // El costo de inspección ($1,500) se bonifica de la comisión total de Clinkar
    if (carPrice < BUSINESS_RULES.INCENTIVE_THRESHOLD) {
        const credit = BUSINESS_RULES.INSPECTION_TOTAL;

        if (variable >= credit) {
            variable -= credit;
        } else {
            const remainder = credit - variable;
            variable = 0;
            base = Math.max(0, base - remainder);
        }
    }

    let total = base + variable;

    // Tope Máximo de Comisión (Estrategia High-End)
    // "Nunca pagarás más de $11,999 (IVA Inc.)" -> $9999 + IVA aprox
    // Ajustamos a un número psicológico atractivo
    const MAX_CAP = 11999;

    if (total > MAX_CAP) {
        total = MAX_CAP;
    }

    return total;
};

interface TaxCalculation {
    isrWithholding: number;
    ivaWithholding: number;
    netToSeller: number;
    isVulnerableActivity: boolean;
}


export const FISCAL_CONSTANTS = {
    UMA_2025: 113.14, // Valor diario UMA 2025 (Inegi)
    IDENTIFICATION_THRESHOLD_UMA: 3210, // Umbral para integrar expediente
    NOTICE_THRESHOLD_UMA: 6420 // Umbral para Aviso al SAT
};

export const FISCAL_THRESHOLDS = {
    IDENTIFICATION: FISCAL_CONSTANTS.IDENTIFICATION_THRESHOLD_UMA * FISCAL_CONSTANTS.UMA_2025, // ~$363,179.40
    NOTICE: FISCAL_CONSTANTS.NOTICE_THRESHOLD_UMA * FISCAL_CONSTANTS.UMA_2025, // ~$726,358.80
    PLD_BOATS_PLANES: 1,
};

/**
 * Calcula las retenciones aplicables para plataformas digitales en México.
 * 
 * NOTA LEGAL: El SAT excluye de la retención por plataformas digitales la 
 * enajenación de BIENES MUEBLES USADOS (Art. 18-B Ley IVA y Reglas Misceláneas).
 * 
 * @param amount Monto total de la venta
 * @param regime Régimen fiscal del vendedor
 * @param category Categoría del activo
 * @param isUsed Si el activo es usado (Predeterminado: true)
 */
export const calculateFiscalImpact = (
    amount: number,
    regime: UserFiscalRegime,
    category: 'Car' | 'Motorcycle' | 'Heavy' | 'Marine' | 'Air' | 'Industrial' | 'Recreational',
    isUsed: boolean = true
): TaxCalculation & { pldAlerts: { identification: boolean; notice: boolean } } => {
    let isrRate = 0;
    let ivaRate = 0;

    // Si es un BIEN USADO, la plataforma NO está obligada a retener ISR/IVA 
    // bajo el esquema de plataformas digitales.
    if (!isUsed) {
        if (regime === 'PFF' || regime === 'RESICO') {
            isrRate = 0.01;
            ivaRate = 0.08;
        }
    }

    const isrWithholding = amount * isrRate;
    const ivaWithholding = amount * ivaRate;

    // Verificación de Actividad Vulnerable (Anti-Lavado)
    let identification = false;
    let notice = false;

    if (category === 'Car' || category === 'Motorcycle' || category === 'Recreational' || category === 'Heavy') {
        identification = amount >= FISCAL_THRESHOLDS.IDENTIFICATION;
        notice = amount >= FISCAL_THRESHOLDS.NOTICE;
    } else if (category === 'Marine' || category === 'Air') {
        // Blindaje y naves suelen requerir identificación desde monto bajo, 
        // pero simplificamos usando la misma lógica o estricta si es 1 peso
        identification = true;
        notice = amount >= FISCAL_THRESHOLDS.NOTICE; // Ajustar según regla específica de blindaje/naves
    }

    return {
        isrWithholding,
        ivaWithholding,
        netToSeller: amount - isrWithholding - ivaWithholding,
        isVulnerableActivity: identification || notice, // Legacy flag support
        pldAlerts: {
            identification,
            notice
        }
    };
};

/**
 * Genera el concepto para el CFDI de la comisión de Clinkar.
 */
export const getInvoiceConcept = (carDetails: string) => {
    return `Servicios de intermediación tecnológica y gestión de transacción para activo: ${carDetails}`;
};

/**
 * Calcula si hay Ganancia Patrimonial y genera un reporte sugerido para el SAT.
 * Útil cuando el vendedor vende por más de lo que compró originalmente.
 */
export const generateAssetGainReport = (sellPrice: number, purchasePrice: number) => {
    const gain = sellPrice - purchasePrice;
    if (gain <= 0) return null;

    return {
        gain,
        taxableAmount: gain * 0.8, // Simplificación: deducción ciega del 20% permitida en algunos supuestos
        type: 'Ganancia Patrimonial',
        satForm: 'Declaración Anual - Enajenación de Bienes',
        disclaimer: 'Este reporte es informativo y automatizado por Clinkar. El cálculo exacto requiere aplicar factores de actualización por inflación del INPC.'
    };
};
