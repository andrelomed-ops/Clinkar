"use client";

import { useState } from "react";
import { LogisticsWidget } from "./LogisticsWidget";
import { WarrantySelector, WarrantyType } from "./WarrantySelector";
import { startTransaction } from "@/app/actions/transaction";
import { Loader2, ShieldCheck, MapPin, Home, Warehouse, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckoutAction({ carId, carPrice, carLocation }: { carId: string, carPrice: number, carLocation: string }) {

    const [logistics, setLogistics] = useState<any>(null);
    const [warranty, setWarranty] = useState<{ type: WarrantyType, cost: number } | null>(null);
    const [deliveryType, setDeliveryType] = useState<'workshop' | 'home'>('workshop');
    const [remoteMode, setRemoteMode] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const total = carPrice + (logistics?.cost || 0) + (warranty?.cost || 0);

    const handleSubmit = async () => {
        setIsPending(true);
        // Call Server Action with aggregated data
        await startTransaction(carId, {
            logistics: logistics ? { ...logistics } : undefined,
            warranty: warranty ? { type: warranty.type, cost: warranty.cost } : undefined,
            deliveryType
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

            {/* Delivery Method Selection */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Método de Entrega</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setDeliveryType('workshop')}
                        className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all",
                            deliveryType === 'workshop' 
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                        )}
                    >
                        <Warehouse className={cn("h-5 w-5 mb-2", deliveryType === 'workshop' ? "text-indigo-600" : "text-zinc-400")} />
                        <span className="font-bold text-xs block">Taller Aliado</span>
                        <span className="text-[9px] text-zinc-500 leading-none">Módulo de Entrega Segura</span>
                    </button>

                    <button
                        onClick={() => setDeliveryType('home')}
                        className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all",
                            deliveryType === 'home' 
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                        )}
                    >
                        <Home className={cn("h-5 w-5 mb-2", deliveryType === 'home' ? "text-indigo-600" : "text-zinc-400")} />
                        <span className="font-bold text-xs block">Envío a Domicilio</span>
                        <span className="text-[9px] text-zinc-500 leading-none">Entrega en Grúa Especializada</span>
                    </button>
                </div>
            </div>

            {deliveryType === 'home' ? (
                <LogisticsWidget
                    carLocation={carLocation}
                    onQuote={(q) => setLogistics(q)}
                />
            ) : (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                    <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
                            Entrega en Taller Aliado (Zona Segura)
                        </h4>
                        <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70 mt-1.5 leading-relaxed">
                            La entrega se realiza en un punto certificado StarterKar en {carLocation}. Ideal si vives en la misma ciudad para evitar costos de traslado.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Modalidad de Operación</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setRemoteMode(false)}
                        className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all",
                            !remoteMode 
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                        )}
                    >
                        <MapPin className={cn("h-5 w-5 mb-2", !remoteMode ? "text-indigo-600" : "text-zinc-400")} />
                        <span className="font-bold text-xs block">Presencial</span>
                        <span className="text-[9px] text-zinc-500 leading-none">Cita en punto físico</span>
                    </button>

                    <button
                        onClick={() => setRemoteMode(true)}
                        className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all",
                            remoteMode 
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                        )}
                    >
                        <Zap className={cn("h-5 w-5 mb-2", remoteMode ? "text-indigo-600" : "text-zinc-400")} />
                        <span className="font-bold text-xs block">Remota</span>
                        <span className="text-[9px] text-zinc-500 leading-none">Videollamada & QR</span>
                    </button>
                </div>
            </div>

            {remoteMode && (
                <div className="p-5 rounded-2xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30 space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 text-violet-700 dark:text-violet-400 font-bold text-sm">
                        <Smartphone className="h-4 w-4" />
                        Protocolo de Compra Virtual
                    </div>
                    <ul className="text-[11px] text-violet-600/80 dark:text-violet-400/70 space-y-2 list-disc pl-4 leading-tight">
                        <li><b>Inspección Digital:</b> Agendaremos una videollamada HD para que revises el auto a detalle con nuestro inspector.</li>
                        <li><b>Aprobación QR:</b> Recibirás un código de liberación que solo se activa tras tu validación virtual.</li>
                        <li><b>Traslado Blindado:</b> Una vez aprobado, el auto se envía en grúa hasta tu destino.</li>
                    </ul>
                </div>
            )}

            {/* Total Summary */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400 text-sm">Precio del Auto</span>
                    <span className="font-medium">${carPrice.toLocaleString()}</span>
                </div>
                {logistics && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-blue-400">Traslado ({logistics.distanceKm}km)</span>
                        <span className="font-medium">+${logistics.cost.toLocaleString()}</span>
                    </div>
                )}
                {warranty && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-emerald-400">Garantía ({warranty.type === 'STANDARD' ? '90 Días' : '1 Anual'})</span>
                        <span className="font-medium">+${warranty.cost.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline mb-2">
                    <span className="font-bold text-lg">Total Plataforma</span>
                    <span className="font-black text-3xl">${(carPrice + (logistics?.cost || 0) + (warranty?.cost || 0)).toLocaleString()}</span>
                </div>

                <div className="text-xs text-zinc-400 mb-6 text-center leading-relaxed bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">
                    <div className="flex justify-center mb-2"><ShieldCheck className="h-5 w-5 text-emerald-400" /></div>
                    <b>Pago Directo y Protegido:</b> No retenemos el valor del auto. Realizarás el pago directo al vendedor (SPEI o depósito bancario) <b>únicamente hasta que recibas y apruebes el coche {remoteMode ? "virtualmente" : "físicamente"}</b>. Nuestro equipo certificará la operación para tu total seguridad.
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : remoteMode ? "Iniciar Compra Remota" : "Bloquear Auto y Agendar Entrega"}
                </button>
            </div>
        </div>
    );
}
