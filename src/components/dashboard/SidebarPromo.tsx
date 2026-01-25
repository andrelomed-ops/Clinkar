"use client";

import { Building2, Home, ArrowRight } from "lucide-react";

interface SidebarPromoProps {
    role: string;
}

export function SidebarPromo({ role }: SidebarPromoProps) {
    if (role === 'seller') {
        // SCENARIO A: INVENTORY LIQUIDATION (Private or Business)
        return (
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/20 border border-emerald-800">
                <div className="flex items-start gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-emerald-500/30">
                        <Home className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight text-emerald-50">Venta de Inventario</h3>
                        <p className="text-[10px] text-slate-300 mt-1 leading-relaxed opacity-90">
                            Canal exclusivo para liquidar múltiples unidades o lotes de seminuevos ágilmente.
                        </p>
                    </div>
                </div>
                <button className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-sm border border-emerald-500">
                    Vender Flotilla <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        );
    }

    // SCENARIO B: CORPORATE PROCUREMENT (Business Expense)
    return (
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20 border border-blue-800">
            <div className="flex items-start gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-blue-500/30">
                    <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-tight text-blue-50">Compras Corporativas</h3>
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                        ¿Necesitas autos para tu negocio? Accede a precios de mayoreo directamente con marcas.
                    </p>
                </div>
            </div>
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 border border-blue-500">
                Comprar Flotilla <ArrowRight className="h-3 w-3" />
            </button>
        </div>
    );
}
