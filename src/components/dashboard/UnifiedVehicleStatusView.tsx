"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wrench, FileText, AlertTriangle, CheckCircle2, ArrowRight, Loader2, ShieldAlert, Shield, CheckCircle, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedVehicleStatusProps {
    carId: string;
    role?: string;
    location?: string;
}

const VERIFICATION_STATES = [
    "Ciudad de México", "CDMX", "Estado de México", "Edomex", "Hidalgo", "Morelos", "Puebla",
    "Tlaxcala", "Jalisco", "Guanajuato", "Querétaro", "Baja California", "Coahuila",
    "Chihuahua", "Michoacán", "Oaxaca", "Veracruz", "Yucatán"
];

export function UnifiedVehicleStatusView({ carId, role = "buyer", location = "CDMX" }: UnifiedVehicleStatusProps) {
    // Note: Tabs removed in favor of "All-at-a-glance" Cards

    // --- MECHANICAL STATE ---
    const [quotation, setQuotation] = useState<any>(null);
    const [mechLoading, setMechLoading] = useState(true);
    const [mechActionLoading, setMechActionLoading] = useState(false);

    // --- LEGAL STATE ---
    const isVerificationRequired = VERIFICATION_STATES.some(state => location.includes(state));

    const [debts] = useState([
        { id: 1, concept: "Impuestos Vehiculares", amount: 1500, status: "PENDING" },
        // Conditionally include Verification
        ...(isVerificationRequired
            ? [{ id: 2, concept: "Verificación", amount: 650, status: "PENDING" }]
            : [{ id: 2, concept: "Verificación (No Aplica en zona)", amount: 0, status: "EXEMPT" }]
        ),
        { id: 3, concept: "Multas de Tránsito", amount: 0, status: "PAID" },
    ]);

    // --- SHARED STATE ---
    const [showWarning, setShowWarning] = useState(false);
    const [warningType, setWarningType] = useState<"mechanical" | "legal" | null>(null);

    const isSeller = role === "seller";
    const totalDebt = debts.reduce((acc, curr) => curr.status === "PENDING" ? acc + curr.amount : acc, 0);

    useEffect(() => {
        fetchQuotation();
    }, [carId]);

    const fetchQuotation = async () => {
        try {
            await new Promise(r => setTimeout(r, 800));
            setQuotation({
                id: 'mock-1',
                car_id: carId,
                total_amount: 5500,
                items: [
                    { id: 'fugas-aceite', cost: 5500, note: 'Requiere cambio de junta.' }
                ],
                status: 'PENDING_BUYER'
            });
        } catch (e) { console.error(e); }
        setMechLoading(false);
    };

    const handleMechAction = async (newStatus: string) => {
        if (!quotation) return;
        setMechActionLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setQuotation({ ...quotation, status: newStatus });
        setMechActionLoading(false);
        setShowWarning(false);
    };

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

            {/* Header for the Details Section - Simplified */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <Search className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Detalles del Auto</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* CARD 1: MECHANICAL -> Estado del Auto */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col transition-all hover:shadow-md">
                    <header className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Estado del Auto</h3>
                            <p className="text-xs text-slate-500">Fallas mecánicas encontradas</p>
                        </div>
                    </header>

                    <div className="flex-1 space-y-4">
                        {mechLoading ? (
                            <div className="h-20 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {quotation?.items.length > 0 ? quotation.items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 font-medium">{item.id}</span>
                                            <span className="font-bold text-slate-900">${item.cost.toLocaleString()}</span>
                                        </div>
                                    )) : (
                                        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                                            <Wrench className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-slate-500">Sin fallas mecánicas reportadas</p>
                                        </div>
                                    )}

                                    {/* IMMOBILIZED / HOME INSPECTION LOGIC */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        {/* Logic Check: If Immobilized or Major Fault detected */}
                                        {(quotation?.items.length > 0 && quotation?.items[0].id === 'fugas-aceite') || (carId === 'tx-004') ? (
                                            isSeller ? (
                                                /* SELLER VIEW: ACTIONABLE UPSELL */
                                                <>
                                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-3">
                                                        <div className="flex items-start gap-3">
                                                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                                            <div>
                                                                <h4 className="text-xs font-bold text-amber-800">Vehículo Inmovilizado / Falla Mayor</h4>
                                                                <p className="text-[10px] text-amber-700 leading-relaxed mt-1">
                                                                    Detectamos que el auto no es apto para circular. Para continuar la venta/certificación, necesitas repararlo.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {mechActionLoading ? (
                                                        <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" /> Agendando Técnico...
                                                        </button>
                                                    ) : quotation?.status === 'IN_REPAIR' ? (
                                                        <div className="flex items-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold justify-center border border-blue-100">
                                                            <Wrench className="h-4 w-4 animate-pulse" />
                                                            Reparación en Proceso (Est. 48h)
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleMechAction("IN_REPAIR")}
                                                            className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                        >
                                                            <MapPin className="h-3 w-3 text-slate-400" />
                                                            Solicitar Mecánico a Domicilio ($900)
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                /* BUYER VIEW: STATUS WARNING ONLY (NO BUTTON) */
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-700">No apto para circular</h4>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                                                                Vehículo retenido por condiciones mecánicas o documentales pendientes de resolución.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : null}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 space-y-2">
                                    {quotation?.status === "PENDING_BUYER" && quotation?.items.length > 0 && (
                                        <>
                                            <div className="flex gap-2">
                                                {/* ... Existing Action Buttons ... */}
                                                <button
                                                    onClick={() => handleMechAction("ACCEPTED_BY_BUYER")}
                                                    className="flex-1 h-12 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                                    disabled={mechActionLoading}
                                                >
                                                    {mechActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                                    {isSeller ? "Autorizar Reparación" : "Pedir que se Repare"}
                                                </button>
                                                <button
                                                    onClick={() => { setWarningType("mechanical"); setShowWarning(true); }}
                                                    className="flex-1 h-12 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                                >
                                                    {isSeller ? "Vender Así" : "Comprar con Fallas"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* CARD 2: LEGAL -> Papeles y Trámites */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col transition-all hover:shadow-md">
                    <header className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">Papeles y Trámites</h3>
                            <p className="text-xs text-slate-500">Adeudos y Multas pendientes</p>
                        </div>
                        {totalDebt === 0 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">AL DÍA</span>}
                    </header>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            {debts.map((debt) => (
                                <div key={debt.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full",
                                            debt.status === "PAID" ? "bg-green-400" :
                                                debt.status === "EXEMPT" ? "bg-slate-300" : "bg-red-400"
                                        )} />
                                        <span className={cn(
                                            "text-slate-600",
                                            (debt.status === "PAID" || debt.status === "EXEMPT") && "line-through opacity-50"
                                        )}>{debt.concept}</span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-700">
                                        {debt.status === "EXEMPT" ? "N/A" : `$${debt.amount.toLocaleString()}`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase text-slate-400">Total a Pagar</span>
                                <span className="text-lg font-black text-slate-900">${totalDebt.toLocaleString()}</span>
                            </div>

                            <button className="w-full h-12 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                Pagar Adeudos <ArrowRight className="h-3 w-3" />
                            </button>
                            {/* LEGEND */}
                            <p className="text-[10px] text-center text-slate-400 leading-tight">
                                <strong>Pagar Adeudos:</strong> Clinkar paga por ti y descontamos el monto al vendedor.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* SHARED WARNING MODAL */}
            {showWarning && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center space-y-6">
                        <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <ShieldAlert className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">Confirmar Acción</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {warningType === "mechanical"
                                    ? "Al aceptar las fallas, se asume que el precio de venta ya considera estos desperfectos."
                                    : "Los adeudos se descontarán automáticamente del pago final al vendedor."}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    if (warningType === "mechanical") handleMechAction("DENIED_BY_BUYER");
                                    else setShowWarning(false);
                                }}
                                className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform"
                            >
                                Confirmar y Continuar
                            </button>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full h-12 font-bold text-slate-500 hover:text-slate-900"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
