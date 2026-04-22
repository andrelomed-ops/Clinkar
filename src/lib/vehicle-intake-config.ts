
export type VehicleCategory = 'PRIVATE' | 'SECONDARY' | 'INSURANCE' | 'RECOVERED_THEFT' | 'IMPORTED' | 'REPAIRED_ACCIDENT';

export interface DocumentRequirement {
    id: string;
    label: string;
    description: string;
    required: boolean;
    helperText?: string;
    managedByStarterKar?: boolean;
}

export interface VehicleCategoryConfig {
    id: VehicleCategory;
    title: string;
    description: string;
    icon: string;
    documents: string[]; // List of Doc IDs required for this category
}

export const ALL_DOCUMENTS: Record<string, DocumentRequirement> = {
    ine_current: {
        id: 'ine_current',
        label: 'INE / ID Oficial (Vendedor Actual)',
        description: 'Frente y reverso legible de tu identificación oficial.',
        required: true
    },
    invoice_original: {
        id: 'invoice_original',
        label: 'Factura Original / Respaldo',
        description: 'Factura de origen o secuencia completa de facturación.',
        required: true
    },
    circulation_card: {
        id: 'circulation_card',
        label: 'Tarjeta de Circulación',
        description: 'Vigente. Si está vencida, adjunta el documento de extensión.',
        required: true
    },
    responsiva: {
        id: 'responsiva',
        label: 'Carta Responsiva',
        description: 'Firmada por el vendedor actual.',
        required: true
    },
    contracts_secondary: {
        id: 'contracts_secondary',
        label: 'Contratos de Compraventa Anteriores',
        description: 'Documentos que amparen la cadena de propiedad.',
        required: true,
        helperText: 'Necesario para validar la legalidad entre dueños anteriores.'
    },
    insurance_invoice: {
        id: 'insurance_invoice',
        label: 'Factura de Seminuevos (Aseguradora)',
        description: 'Emitida por la compañía de seguros.',
        required: true
    },
    theft_report: {
        id: 'theft_report',
        label: 'Reporte de Robo / MP',
        description: 'Denuncia presentada ante el Ministerio Público.',
        required: true
    },
    liberation_office: {
        id: 'liberation_office',
        label: 'Oficio de Liberación (Fiscalía)',
        description: 'Documento que acredita la recuperación legal.',
        required: true
    },
    ine_original_owner: {
        id: 'ine_original_owner',
        label: 'INE Propietario Original',
        description: 'Identificación de la persona que aparece en la factura original.',
        required: false
    },
    pedimento: {
        id: 'pedimento',
        label: 'Pedimento de Importación',
        description: 'Documento de aduana para autos importados.',
        required: true
    },
    prosec: {
        id: 'prosec',
        label: 'Constancia de Regularización (PROSEC)',
        description: 'Acreditación de legalización en el país.',
        required: true
    },
    peritaje: {
        id: 'peritaje',
        label: 'Dictamen de Peritaje / Reparación',
        description: 'Documento técnico de la reparación del siniestro.',
        required: true
    },
    // Managed by StarterKar
    repuv: {
        id: 'repuve',
        label: 'Consulta REPUVE',
        description: 'Validación de no robo.',
        required: false,
        managedByStarterKar: true
    },
    tenencias: {
        id: 'tenencias',
        label: 'Historial de Tenencias (5 años)',
        description: 'Validación de adeudos estatales.',
        required: false,
        managedByStarterKar: true
    },
    infracciones: {
        id: 'infracciones',
        label: 'Consulta de Infracciones',
        description: 'Multas de tránsito pendientes.',
        required: false,
        managedByStarterKar: true
    },
    rfc: {
        id: 'rfc',
        label: 'Constancia de Situación Fiscal (RFC)',
        description: 'Documento oficial del SAT con fecha reciente.',
        required: true
    },
    proof_of_address: {
        id: 'proof_of_address',
        label: 'Comprobante de Domicilio',
        description: 'Luz, agua o telefonía fija (no mayor a 3 meses).',
        required: true
    }
};

export const VEHICLE_CATEGORIES: VehicleCategoryConfig[] = [
    {
        id: 'PRIVATE',
        title: 'Nacional / Dueño Directo',
        description: 'Comprado nuevo en agencia o seminuevo de un solo dueño.',
        icon: '🚗',
        documents: ['ine_current', 'invoice_original', 'circulation_card', 'responsiva', 'rfc', 'proof_of_address']
    },
    {
        id: 'SECONDARY',
        title: '2do / 3er Propietario',
        description: 'Vehículo que ha tenido múltiples dueños privados.',
        icon: '👥',
        documents: ['ine_current', 'invoice_original', 'circulation_card', 'responsiva', 'contracts_secondary']
    },
    {
        id: 'INSURANCE',
        title: 'Recuperado de Aseguradora',
        description: 'Vendido por aseguradora tras siniestro o pérdida total.',
        icon: '🛡️',
        documents: ['ine_current', 'invoice_original', 'insurance_invoice', 'circulation_card', 'responsiva']
    },
    {
        id: 'RECOVERED_THEFT',
        title: 'Recuperado de Robo',
        description: 'Vehículo que cuenta con reporte de robo y liberación.',
        icon: '🚨',
        documents: ['ine_current', 'invoice_original', 'theft_report', 'liberation_office', 'ine_original_owner', 'circulation_card', 'responsiva']
    },
    {
        id: 'IMPORTED',
        title: 'Importado / Legalizado',
        description: 'Vehículos de procedencia extranjera regularizados.',
        icon: '🌎',
        documents: ['ine_current', 'invoice_original', 'pedimento', 'prosec', 'circulation_card', 'responsiva']
    },
    {
        id: 'REPAIRED_ACCIDENT',
        title: 'Siniestro Reparado',
        description: 'Auto con daño estructural o estético reparado.',
        icon: '🔧',
        documents: ['ine_current', 'invoice_original', 'peritaje', 'circulation_card', 'responsiva']
    }
];
