export const NAUTICAL_SECTIONS = [
    {
        id: "hull_exterior",
        label: "Casco y Exterior",
        items: [
            { id: "n1", label: "Integridad del casco (ausencia de ósmosis/golpes)" },
            { id: "n2", label: "Estado del antifouling (pintura de fondo)" },
            { id: "n3", label: "Anodos de sacrificio (desgaste)" },
            { id: "n4", label: "Estado de la hélice y eje" },
            { id: "n5", label: "Escalera de baño y plataforma" },
            { id: "n6", label: "Estado de defensas y cabos de amarre" },
            { id: "n7", label: "Limpieza general de cubierta" },
            { id: "n8", label: "Estado de la teca / gelcoat" },
            { id: "n9", label: "Toldilla y cerramientos (lona)" },
            { id: "n10", label: "Barandillas y pasamanos (seguridad)" }
        ]
    },
    {
        id: "machinery",
        label: "Maquinaria y Motores",
        items: [
            { id: "n11", label: "Nivel y estado de aceite motor(es)" },
            { id: "n12", label: "Horas de motor verificadas" },
            { id: "n13", label: "Sistema de refrigeración (agua salada/dulce)" },
            { id: "n14", label: "Estado de correas y mangueras" },
            { id: "n15", label: "Fugas de combustible en sentina" },
            { id: "n16", label: "Bombas de sentina (automáticas/manuales)" },
            { id: "n17", label: "Estado de baterías marinas" },
            { id: "n18", label: "Cargador de baterías y conexión a tierra" },
            { id: "n19", label: "Extractor de gases de motor" },
            { id: "n20", label: "Estado de las colas / transmisiones" }
        ]
    },
    {
        id: "navigation",
        label: "Electrónica y Navegación",
        items: [
            { id: "n21", label: "Funcionamiento del GPS/Plotter" },
            { id: "n22", label: "Radio VHF (transmisión/recepción)" },
            { id: "n23", label: "Sonda de profundidad" },
            { id: "n24", label: "Radar (si aplica)" },
            { id: "n25", label: "Piloto automático" },
            { id: "n26", label: "Luces de navegación" },
            { id: "n27", label: "Compás magnético" },
            { id: "n28", label: "Indicadores de motor (RPM, Temp, Presión)" },
            { id: "n29", label: "Bocina / Claxon marino" },
            { id: "n30", label: "Ancla y molinete eléctrico" }
        ]
    }
    // ... Se completarían hasta los 150 puntos en producción
];

export const AVIATION_SECTIONS = [
    {
        id: "airframe",
        label: "Célula y Estructura",
        items: [
            { id: "a1", label: "Estado del revestimiento (remaches/corrosión)" },
            { id: "a2", label: "Superficies de mando (alerones, flaps)" },
            { id: "a3", label: "Tren de aterrizaje (amortiguadores/neumáticos)" },
            { id: "a4", label: "Parabrisas y ventanas (sin microfisuras)" },
            { id: "a5", label: "Estado de las luces estroboscópicas/posicionamiento" }
        ]
    },
    {
        id: "powerplant",
        label: "Planta Motriz",
        items: [
            { id: "a11", label: "Compresión de cilindros (según bitácora)" },
            { id: "a12", label: "Ciclos de motor verificados" },
            { id: "a13", label: "Estado de la hélice (mellas/fisuras)" },
            { id: "a14", label: "Fugas de aceite en el cárter" },
            { id: "a15", label: "Filtros de combustible y aceite" }
        ]
    },
    {
        id: "avionics",
        label: "Aviónica y Sistemas",
        items: [
            { id: "a21", label: "Altímetro y Velocímetro (certificados)" },
            { id: "a22", label: "Transpondedor (Modo S/C)" },
            { id: "a23", label: "Radio Comunicación (COM1 / COM2)" },
            { id: "a24", label: "ELT (Transmisor de Localización de Emergencia)" },
            { id: "a25", label: "Sistema de oxígeno (si aplica)" }
        ]
    }
];

export const INDUSTRIAL_SECTIONS = [
    {
        id: "hydraulics",
        label: "Sistemas Hidráulicos",
        items: [
            { id: "i1", label: "Cilindros hidráulicos (sin fugas/rayaduras)" },
            { id: "i2", label: "Mangueras y conexiones de alta presión" },
            { id: "i3", label: "Bomba hidráulica (presión/ruido)" },
            { id: "i4", label: "Estado del aceite hidráulico" },
            { id: "i5", label: "Funcionamiento de mandos (joysticks)" }
        ]
    },
    {
        id: "structure_cabin",
        label: "Estructura y Cabina",
        items: [
            { id: "i11", label: "Estado de orugas / neumáticos industriales" },
            { id: "i12", label: "Soldaduras estructurales (sin grietas)" },
            { id: "i13", label: "Estado de la cuchara / herramienta" },
            { id: "i14", label: "Cabina ROPS/FOPS certificada" },
            { id: "i15", label: "Cristales de seguridad" }
        ]
    }
];

export const getAssetInspectionSections = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'nautical':
        case 'yacht':
        case 'boat':
            return NAUTICAL_SECTIONS;
        case 'aviation':
        case 'plane':
        case 'aircraft':
            return AVIATION_SECTIONS;
        case 'industrial':
        case 'heavy_machinery':
            return INDUSTRIAL_SECTIONS;
        default:
            return null; // Fallback to standard car sections handled in page
    }
};
