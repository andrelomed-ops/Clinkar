
export interface StateLawProfile {
    state: string;
    jurisdiction: string;
    taxClause: string;
}

export const STATE_PROFILES: Record<string, StateLawProfile> = {
    'CDMX': {
        state: 'Ciudad de México',
        jurisdiction: 'Tribunales de la Ciudad de México',
        taxClause: 'De conformidad con el Código Fiscal de la Ciudad de México.'
    },
    'Jalisco': {
        state: 'Jalisco',
        jurisdiction: 'Tribunales de Guadalajara, Jalisco',
        taxClause: 'De conformidad con la Ley de Ingresos del Estado de Jalisco.'
    },
    'Nuevo León': {
        state: 'Nuevo León',
        jurisdiction: 'Tribunales de Monterrey, Nuevo León',
        taxClause: 'De conformidad con la Ley de Hacienda del Estado de Nuevo León.'
    },
    'Querétaro': {
        state: 'Querétaro',
        jurisdiction: 'Tribunales de Santiago de Querétaro, Qro.',
        taxClause: 'De conformidad con la Ley de Hacienda de Querétaro.'
    },
    'Puebla': {
        state: 'Puebla',
        jurisdiction: 'Tribunales de Puebla de Zaragoza, Pue.',
        taxClause: 'De conformidad con la Ley de Hacienda del Estado de Puebla.'
    }
};

export const getLegalProfile = (location: string = 'CDMX'): StateLawProfile => {
    // Try to find exact match or default to CDMX
    const entry = Object.entries(STATE_PROFILES).find(([key]) =>
        location.toLowerCase().includes(key.toLowerCase())
    );
    return entry ? entry[1] : STATE_PROFILES['CDMX'];
};

export const NOM_122_BOILERPLATE = {
    RECA_NUMBER: "RECA-CLK-001/2026", // Mock registry
    REPORT_VALIDITY_DAYS: 30,
    INSPECTION_COST: 900,
    WARRANTY_DISCLOSURE: "La operación se realiza 'Ad-Corpus' y en las condiciones reportadas en el certificado de inspección Clinkar (Vigencia 30 días). La garantía mecánica de 90 días es un servicio externo opcional gestionado por Clinkar pero prestado por terceros seguros.",
    NON_REFUNDABLE_NOTICE: "El costo de inspección inicial ($900.00 MXN) no es reembolsable ni bonificable bajo ninguna circunstancia, ya que cubre el servicio técnico profesional devengado.",
    DOCUMENTATION_LIST: [
        "Factura original o Re-facturación válida",
        "Tenencias pagadas (últimos 5 años)",
        "Verificación ambiental vigente (si aplica)",
        "Tarjeta de circulación",
        "Baja de placas o responsiva de trámite"
    ]
};

export const CUSTODIAL_DISCLOSURE = {
    PARTNER_TYPE: "Institución de Tecnología Financiera (ITF)",
    REGULATION: "Autorizada y Supervisada por la CNBV y CONDUSEF",
    DISCLAIMER_TEXT: "Clinkar no es una entidad financiera. Los fondos de esta operación son custodiados en Escrow por una Institución de Tecnología Financiera regulada, conforme a la Ley Fintech. Clinkar actúa únicamente como orquestador tecnológico de la transacción."
};
