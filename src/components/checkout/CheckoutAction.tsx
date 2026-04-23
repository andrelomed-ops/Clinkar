"use client";

import { useState } from "react";
import { LogisticsWidget } from "./LogisticsWidget";
import { WarrantySelector, WarrantyType } from "./WarrantySelector";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2, ShieldCheck, MapPin, Home, Warehouse, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckoutAction({ carId, carPrice, carLocation }: { carId: string, carPrice: number, carLocation: string }) {

    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        setIsPending(true);
        // Start transaction with base values. Services will be added in post-sale.
        await startTransaction(carId, {
            deliveryType: 'workshop' // Default to workshop, can be changed in post-sale
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                    <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
                        Bloqueo Seguro (Bóveda Digital)
                    </h4>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70 mt-1.5 leading-relaxed">
                        Al bloquear el auto, garantizas que nadie más pueda ofertar por él mientras defines los detalles de entrega y servicios adicionales en tu Dashboard.
                    </p>
                </div>
            </div>

            {/* Total Summary */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400 text-sm">Precio del Auto</span>
                    <span className="font-medium">${carPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-baseline mb-6 pt-4 border-t border-zinc-800">
                    <span className="font-bold text-lg">Monto de Bloqueo</span>
                    <span className="font-black text-3xl">${carPrice.toLocaleString()}</span>
                </div>

                <div className="text-xs text-zinc-400 mb-6 text-center leading-relaxed bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">
                    <b>Siguiente Paso:</b> Tras el bloqueo, podrás personalizar tu envío, elegir garantía y gestionar trámites legales.
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
