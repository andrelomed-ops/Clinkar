"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Wrench, ShieldAlert, CheckCircle, XCircle, AlertTriangle, ArrowRight, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepairQuotationViewProps {
    carId: string;
    role?: string;
}

export function RepairQuotationView({ carId, role = "buyer" }: RepairQuotationViewProps) {
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
    const supabase = createBrowserClient();

    const fetchQuotation = async () => {
        try {
            const { data, error } = await supabase
                .from("repair_quotations")
                .select("*")
                .eq("car_id", carId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setQuotation(data);
            } else {
                // Mock for visual review if no real data found
                setQuotation({
                    id: 'mock-1',
                    car_id: carId,
                    inspector_id: 'mock-inspector',
                    total_amount: 5500,
                    items: [
                        { id: 'fugas-aceite', cost: 5500, note: 'Requiere cambio de junta de tapa de punterías.' }
                    ],
                    status: 'PENDING_BUYER'
                });
            }
        } catch (e) {
            console.error("Fetch failed, using mock");
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchQuotation();
    }, [carId]);

    const handleAction = async (newStatus: string) => {
        if (!quotation) return;
        setActionLoading(true);

        const { error } = await supabase
            .from("repair_quotations")
            .update({
                status: newStatus,
                buyer_acknowledgment: newStatus === "DENIED_BY_BUYER"
            })
            .eq("id", quotation.id);

        if (!error) {
            setQuotation({ ...quotation, status: newStatus });
            // Notify Mechanic/Inspector
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("notifications").insert({
                    user_id: quotation.inspector_id,
                    title: newStatus === "ACCEPTED_BY_BUYER" ? "🛠️ Reparación Aceptada" : "⚠️ Compra As-Is Confirmada",
                    message: newStatus === "ACCEPTED_BY_BUYER"
                        ? `El comprador ha aceptado tu cotización de ${quotation.total_amount.toLocaleString()} MXN.`
                        : `El comprador ha decidido comprar el auto en su estado actual, declinando reparaciones.`,
                    type: newStatus === "ACCEPTED_BY_BUYER" ? "SUCCESS" : "WARNING",
                    link: "/dashboard/inspector"
                });
            }
        }
        setActionLoading(false);
        setShowDisclaimer(false);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (!quotation) return null;

    const isPending = quotation.status === "PENDING_BUYER";
    const isSeller = role === 'seller';

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Wrench className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Cotización de Reparación</h2>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Informe Técnico del Mecánico</p>
                </div>
            </header>

            <div className="bg-background border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 space-y-6">
                    <div className="grid gap-4">
                        {quotation.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm tracking-tight">{item.id.replace(/-/g, ' ')}</p>
                                    <p className="text-xs text-muted-foreground">{item.note || "Sin observaciones adicionales"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-primary">${item.cost.toLocaleString()} <span className="text-[10px] opacity-60">MXN</span></p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-border/50" />

                    <div className="flex justify-between items-center px-4">
                        <span className="text-lg font-bold">Inversión Total Estimada</span>
                        <span className="text-3xl font-black text-primary underline decoration-primary/20 underline-offset-8">
                            ${quotation.total_amount.toLocaleString()} MXN
                        </span>
                    </div>
                </div>

                {isPending && (
                    <footer className="bg-secondary/20 p-8 border-t border-border/50 flex flex-col md:flex-row gap-4">
                        <button
                            onClick={() => handleAction("ACCEPTED_BY_BUYER")}
                            disabled={actionLoading}
                            className="flex-1 h-14 rounded-2xl bg-primary text-white font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    {isSeller ? "Autorizar Reparación" : "Aceptar y Reparar"}
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowDisclaimer(true)}
                            disabled={actionLoading}
                            className="flex-1 h-14 rounded-2xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                        >
                            {isSeller ? "Vender en Estado Actual" : "Comprar en Estado Actual"}
                        </button>
                    </footer>
                )}

                {quotation.status === "ACCEPTED_BY_BUYER" && (
                    <div className="bg-green-500/10 p-8 text-center space-y-2 border-t border-green-500/20">
                        <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase text-xs tracking-widest">
                            <CheckCircle className="h-4 w-4" />
                            Reparación Autorizada
                        </div>
                        <p className="text-sm text-green-700/80 font-medium">El mecánico ha sido notificado para proceder con las reparaciones.</p>
                    </div>
                )}

                {quotation.status === "DENIED_BY_BUYER" && (
                    <div className="bg-yellow-500/10 p-8 text-center space-y-2 border-t border-yellow-500/20">
                        <div className="flex items-center justify-center gap-2 text-yellow-600 font-black uppercase text-xs tracking-widest">
                            <AlertTriangle className="h-4 w-4" />
                            {isSeller ? "Venta As-Is Confirmada" : "Compra en Estado Actual"}
                        </div>
                        <p className="text-sm text-yellow-700/80 font-medium">Has aceptado las condiciones actuales eliminando la garantía de reparación.</p>
                    </div>
                )}
            </div>

            {/* Disclaimer Modal Overlay */}
            {showDisclaimer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-background border border-border rounded-[3rem] p-10 max-w-lg w-full shadow-2xl space-y-8">
                        <div className="space-y-4 text-center">
                            <div className="h-16 w-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black">
                                {isSeller ? "Advertencia de Precio" : "Deslinde de Responsabilidad"}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed px-4">
                                {isSeller
                                    ? "Al vender en el estado actual, el comprador recibirá el reporte de fallas. Esto afectará significativamente el precio final de venta, ya que el comprador descontará los costos de reparación."
                                    : "Declaro que **acepto las condiciones en las que se encuentra el auto y soy consciente de ello**, liberando de toda responsabilidad al vendedor y a la plataforma de **Clinkar**, ya que es mi deseo adquirir el auto en estas condiciones actuales."}
                            </p>
                        </div>

                        <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 mx-4">
                            <label className="flex gap-4 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={agreedToDisclaimer}
                                    onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                                />
                                <span className="text-xs font-medium leading-relaxed group-hover:text-primary transition-colors">
                                    {isSeller ? "Entiendo que el precio de venta disminuirá." : "He leído y acepto el deslinde de responsabilidad mecánica y legal."}
                                </span>
                            </label>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleAction("DENIED_BY_BUYER")}
                                disabled={!agreedToDisclaimer || actionLoading}
                                className="h-14 rounded-2xl bg-foreground text-background font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                            >
                                {isSeller ? "Confirmar Venta As-Is" : "Confirmar Compra As-Is"}
                            </button>
                            <button
                                onClick={() => setShowDisclaimer(false)}
                                className="h-12 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            >
                                Cancelar y Revisar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
