"use client";

import { useState } from "react";
import { LogisticsWidget } from "./LogisticsWidget";
import { WarrantySelector, WarrantyType } from "./WarrantySelector";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2 } from "lucide-react";

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

                <div className="text-xs text-zinc-500 mb-4 text-center">
                    Al proceder, aceptas que se retenga este monto en Bóveda y nuestros <a href="/terms" target="_blank" className="underline hover:text-zinc-300">Términos del Servicio</a>.
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : "Comprar Ahora"}
                </button>
            </div>
        </div>
    );
}
