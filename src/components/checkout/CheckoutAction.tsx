"use client";

import { useState } from "react";
import { LogisticsWidget } from "./LogisticsWidget";
import { WarrantySelector, WarrantyType } from "./WarrantySelector";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2, ShieldCheck, MapPin } from "lucide-react";

export function CheckoutAction({ carId, carPrice, carLocation }: { carId: string, carPrice: number, carLocation: string }) {

    const [logistics, setLogistics] = useState<any>(null);
    const [warranty, setWarranty] = useState<{ type: WarrantyType, cost: number } | null>(null);
    const [isPending, setIsPending] = useState(false);

    const total = carPrice + (logistics?.cost || 0) + (warranty?.cost || 0);

    const handleSubmit = async () => {
        setIsPending(true);
        // Call Server Action with aggregated data
        await startTransaction(carId, {
            logistics: logistics ? { ...logistics } : undefined,
            warranty: warranty ? { type: warranty.type, cost: warranty.cost } : undefined
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Personaliza tu Compra
            </h3>

            {/* Widgets */}
            <LogisticsWidget
                carLocation={carLocation}
                onQuote={(q) => setLogistics(q)}
            />

            <WarrantySelector
                carPrice={carPrice}
                onSelect={(w) => setWarranty(w)}
            />

            {/* Mandatory Allied Workshop Delivery */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                    <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">Entrega en Taller Aliado StarterKar</h4>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70 mt-1.5 leading-relaxed">
                        Para garantizar la seguridad y bloquear fraudes, la entrega física del auto y revisión final se realiza en el taller certificado más cercano a tu ubicación. <b>Gratis.</b>
                    </p>
                </div>
            </div>

            {/* Total Summary */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400 text-sm">Precio del Auto</span>
                    <span className="font-medium">${carPrice.toLocaleString()}</span>
                </div>
                {logistics && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-blue-400">Envío ({logistics.distanceKm}km)</span>
                        <span className="font-medium">+${logistics.cost.toLocaleString()}</span>
                    </div>
                )}
                {warranty && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-emerald-400">Garantía ({warranty.type === 'STANDARD' ? '90 Días' : '1 Anual'})</span>
                        <span className="font-medium">+${warranty.cost.toLocaleString()}</span>
                    </div>
                )}

                <div className="h-px bg-zinc-700 my-4" />

                <div className="flex justify-between items-baseline mb-6">
                    <span className="font-bold text-lg">Total a Pagar</span>
                    <span className="font-black text-3xl">${total.toLocaleString()}</span>
                </div>

                <div className="text-xs text-zinc-400 mb-6 text-center leading-relaxed bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">
                    <div className="flex justify-center mb-2"><ShieldCheck className="h-5 w-5 text-emerald-400" /></div>
                    <b>Pago Directo y Protegido:</b> No retenemos el valor del auto. Realizarás el pago directo al vendedor (SPEI o depósito bancario) <b>únicamente hasta que recibas y apruebes el coche físicamente</b>. Nuestro equipo presenciará y certificará la operación en Taller Aliado o sucursal bancaria para tu total seguridad.
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : "Bloquear Auto y Agendar Entrega"}
                </button>
            </div>
        </div>
    );
}
