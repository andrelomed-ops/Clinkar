
export interface OpsResponse {
    id: string;
    role: 'assistant';
    content: string;
    offerHuman: boolean;
}

const PROCESS_KNOWLEDGE: Record<string, string> = {
    "boveda": "🛡️ La Bóveda Digital es nuestro sistema de garantía Escrow. Tu pago se retiene de forma segura y solo se libera al vendedor cuando tú confirmas (vía QR) que has recibido el coche y todo está en orden.",
    "inspeccion": "📋 Nuestra inspección de 150 puntos es la más rigurosa del mercado. Revisamos motor, transmisión, electrónica, estructura y legalidad del vehículo para otorgar el Sello Clinkar.",
    "seguridad": "🔐 En Clinkar, la seguridad es total. Validamos la identidad de compradores y vendedores, y verificamos que todos los documentos legales estén en regla antes de cualquier transacción.",
    "pago": "💰 Puedes pagar mediante transferencia bancaria protegida o financiamiento. La Bóveda Digital asegura que tu dinero esté resguardado hasta que el auto sea tuyo.",
    "entrega": "🚚 La entrega se realiza en un punto seguro certificado por Clinkar o a domicilio si contrataste logística. El vendedor debe entregarte el auto y tú liberar el pago mediante nuestra app.",
    "devolucion": "🔙 Si el auto no coincide con el reporte técnico al momento de la entrega, puedes cancelar la operación y la Bóveda Digital te reembolsa tu dinero íntegramente.",
    "financiamiento": "📈 Contamos con aliados financieros para ofrecerte crédito. Puedes simular tu crédito en la pestaña de 'Crédito' de cualquier vehículo certificado.",
    "papeles": "📜 Nosotros validamos facturas, tenencias y reportes de robo (REPUVE/RAPI). Si un auto no tiene los papeles en orden, no puede entrar a la plataforma.",
    "cita": "📅 Para agendar una cita o test drive, primero debes seleccionar el vehículo de tu interés y solicitar la pre-aprobación del crédito o demostrar fondos para asegurar el compromiso.",
    "yate": "🚤 Para activos náuticos, el Sello Clinkar verifica la integridad estructural del casco, el estado de los motores marinos y la documentación de propiedad marítima en la Bóveda Digital.",
    "avion": "🛩️ En aviación, validamos bitácoras de mantenimiento, ciclos de motor y fuselaje, y certificaciones de aviónica para asegurar una transacción transparente a través de Escrow.",
    "maquinaria": "🚜 Para activos industriales, inspeccionamos sistemas hidráulicos, estructurales y horas de uso, garantizando que el activo esté listo para operar antes de liberar el pago."
};

export const generateOpsBrainResponse = (text: string, messageCount: number): OpsResponse => {
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Check if user is asking for cars
    const carKeywords = ['comprar', 'vendo', 'auto', 'carro', 'camioneta', 'tesla', 'bmw', 'kia', 'mazda', 'honda', 'nissan', 'toyota', 'yate', 'avion', 'barco', 'excavadora'];
    if (carKeywords.some(k => lower.includes(k)) && !lower.includes('boveda') && !lower.includes('pago')) {
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: "👋 Como tu Asistente de Operaciones, me especializo en ayudarte con dudas sobre la **Bóveda Digital, Inspecciones o el proceso de seguridad**. Para buscar o comprar automóviles, te sugiero usar nuestro explorador de 'Comprar Auto' donde nuestro **Asesor de Ventas** te guiará.",
            offerHuman: false
        };
    }

    let response = "No estoy seguro de haber entendido tu duda operativa 🤔 ¿Te refieres a la Bóveda Digital, la Inspección de 150 puntos o el proceso de pago? Escríbeme una palabra clave para ayudarte mejor.";

    for (const [key, value] of Object.entries(PROCESS_KNOWLEDGE)) {
        if (lower.includes(key)) {
            response = value;
            break;
        }
    }

    // Frustration detection
    const frustrationKeywords = ['ayuda', 'maquina', 'humano', 'persona', 'no entiendo', 'mal', 'soporte', 'contacto'];
    const userIsFrustrated = frustrationKeywords.some(k => lower.includes(k));

    // Offer human if: count > 3 OR user is frustrated
    const offerHuman = messageCount >= 3 || userIsFrustrated;

    return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        offerHuman
    };
};
