/**
 * Configuración centralizada de precios y comisiones de StarterKar.
 * 
 * Basado en la Estrategia "Nivel Pro":
 * - Vendedor: 3.5% de Comisión de Éxito.
 * - Comprador: $0 en su 1ª compra, $2,499 después.
 * - Referidos: Beneficios de alto valor (Inspecciones, Descuentos).
 */

export const PRICING_CONFIG = {
    // COMISIONES
    SELLER_SUCCESS_FEE_PERCENT: 3.5, // % sobre el valor del auto
    
    BUYER_FIRST_PURCHASE_FEE: 0,
    BUYER_STANDARD_SERVICE_FEE: 2499, // MXN
    
    // SERVICIOS ADICIONALES (MOCK VALUES)
    INSPECTION_150_POINTS_COST: 1499, // MXN
    LOGISTICS_BASE_COST: 1200, // MXN
    WARRANTY_STANDARD_COST: 4500, // MXN
    
    // RECOMPENSAS POR REFERIDOS
    REFERRAL_REWARD_CASH: 1000, // MXN
    REFERRAL_REWARD_INSPECTION_FREE: true, // Vale por una inspección
    REFERRAL_REWARD_FEE_DISCOUNT_PERCENT: 50, // % de descuento en la comisión del vendedor
};

export type PricingConfig = typeof PRICING_CONFIG;
