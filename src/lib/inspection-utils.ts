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
