import { Vehicle } from "@/data/cars";

export const getInspectionLabel = (category: Vehicle['category']): string => {
    const mapping: Record<Vehicle['category'], string> = {
        'Car': 'Inspección de 150 Puntos',
        'Motorcycle': 'Revisión Técnica de 50 Puntos',
        'Heavy': 'Certificación de Maquinaria Pesada',
        'Marine': 'Inspección de Casco y Motores (Survey)',
        'Air': 'Auditoría de Aeronavegabilidad (FAA/AFAC)',
        'Industrial': 'Certificación de Seguridad Industrial',
        'Recreational': 'Inspección Técnica Off-Road'
    };

    return mapping[category] || 'Inspección Técnica Certificada';
};

export const getInspectionBadge = (category: Vehicle['category']): string => {
    const mapping: Record<Vehicle['category'], string> = {
        'Car': '[ INSPECTOR PRO - 150 PUNTOS ]',
        'Motorcycle': '[ MOTO CHECK - certified ]',
        'Heavy': '[ HEAVY DUTY - certified ]',
        'Marine': '[ MARINE SURVEY - certified ]',
        'Air': '[ AVIONICS AUDIT - certified ]',
        'Industrial': '[ INDUSTRIAL SAFETY - certified ]',
        'Recreational': '[ OFF-ROAD READY - certified ]'
    };

    return mapping[category] || '[ CERTIFIED INSPECTION ]';
};
export const translateFinding = (itemId: string): { label: string; severity: 'CRITICAL' | 'MAINTENANCE' | 'ESTHETIC' } => {
    const dictionary: Record<string, { label: string; severity: 'CRITICAL' | 'MAINTENANCE' | 'ESTHETIC' }> = {
        // Motor
        'engine_leaks': { label: 'Requiere sellado preventivo de motor', severity: 'MAINTENANCE' },
        'engine_noises': { label: 'Atención mecánica requerida en tren de válvulas', severity: 'CRITICAL' },
        'coolant_level': { label: 'Necesita servicio de sistema de enfriamiento', severity: 'MAINTENANCE' },
        'belts_hoses': { label: 'Riesgo de ruptura en bandas de accesorios', severity: 'MAINTENANCE' },
        
        // Frenos / Suspensión
        'brake_pads': { label: 'Desgaste avanzado en balatas (Seguridad)', severity: 'CRITICAL' },
        'shocks_struts': { label: 'Amortiguadores presentan pérdida de eficiencia', severity: 'MAINTENANCE' },
        'tire_tread': { label: 'Neumáticos requieren reemplazo por seguridad', severity: 'CRITICAL' },
        'wheel_alignment': { label: 'Alineación y balanceo fuera de rango', severity: 'MAINTENANCE' },
        
        // Estética / Estructura
        'body_dents': { label: 'Detalles estéticos por uso natural (Facias/Puertas)', severity: 'ESTHETIC' },
        'paint_scratches': { label: 'Microrrayaduras en capa transparente de pintura', severity: 'ESTHETIC' },
        'interior_wear': { label: 'Desgaste en tapicería acorde a kilometraje', severity: 'ESTHETIC' },
        'glass_cracks': { label: 'Presencia de impacto menor en cristal', severity: 'MAINTENANCE' },
        
        // Legal (Si acaso se filtra algo, manejar con elegancia)
        'tax_arrears': { label: 'Pendiente de actualización administrativa fiscal', severity: 'CRITICAL' },
        'registration_status': { label: 'Trámite de baja/alta sugerido', severity: 'MAINTENANCE' }
    };

    return dictionary[itemId] || { 
        label: itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        severity: 'MAINTENANCE' 
    };
};

export const getSeverityColor = (severity: string): string => {
    switch (severity) {
        case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
        case 'MAINTENANCE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case 'ESTHETIC': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
};
