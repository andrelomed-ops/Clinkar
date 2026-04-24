"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { 
    ArrowLeft, 
    ShieldCheck, 
    Zap, 
    PartyPopper, 
    CheckCircle,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { PostSaleEcosystem } from "@/components/dashboard/PostSaleEcosystem";
import { HandoverSafeCheck } from "@/components/dashboard/HandoverSafeCheck";
import { VaultStatus } from "@/components/dashboard/VaultStatus";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarterKarSeal } from "@/components/market/StarterKarSeal";
import { 
    releaseVaultFundsAction, 
    reportDiscrepancyAction 
} from "@/app/actions/transaction";

export default function HandoverPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createBrowserClient();
    const [transaction, setTransaction] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Simulation for mock IDs
            if (id?.toString().startsWith('mock-')) {
                setTransaction({
                    id: id.toString(),
                    status: 'IN_VAULT',
                    car_price: 385000,
                    buyer_id: user?.id,
                    cars: {
                        make: "BMW",
                        model: "M3 Sedan",
                        location: "Naucalpan, Estado de México"
                    },
                    metadata: {
                        scheduled_delivery_date: new Date().toISOString(),
                        scheduled_delivery_time: "14:30"
                    }
                });
                setIsLoading(false);
                return;
            }

            const { data: tx } = await supabase
                .from('transactions')
                .select(`
                    *,
                    cars (*)
                `)
                .eq('id', id)
                .single();

            if (tx) setTransaction(tx);
            setIsLoading(false);
        }
        loadData();
    }, [id, supabase]);

    const handleReleaseFunds = async () => {
        setProcessing(true);
        try {
            const result = await releaseVaultFundsAction(transaction.id);
            if (result.success) {
                setCompleted(true);
                toast.success("¡Operación completada con éxito!");
            } else {
                toast.error(result.error || "Error al liberar fondos");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setProcessing(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-white animate-pulse" />;
    if (!transaction) return <div className="min-h-screen flex items-center justify-center">Transacción no encontrada</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar variant="market" />
            
            <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Volver al Garage</span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic leading-[1.1] mb-2 uppercase">Proceso de Entrega Segura</h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Folio: #{transaction.id.slice(0, 8)} • {transaction.cars?.make} {transaction.cars?.model}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
                        {transaction.metadata?.scheduled_delivery_date && (
                            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-6 py-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Cita Programada</p>
                                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-200">
                                        {new Date(transaction.metadata.scheduled_delivery_date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} • {transaction.metadata.scheduled_delivery_time}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-6 py-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Bóveda Digital</p>
                                <p className={cn(
                                    "text-sm font-black uppercase transition-all",
                                    transaction.status === 'DISPUTED' ? "text-amber-500 animate-pulse" : "text-emerald-600"
                                )}>
                                    {transaction.status === 'DISPUTED' ? "En Mediación" : "Resguardado"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-16">
                    {/* 1. Vault Status Hero */}
                    <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
                    <VaultStatus 
                        status={transaction.status === 'IN_VAULT' ? 'FUNDS_HELD' : 
                               transaction.status === 'COMPLETED' ? 'RELEASED' : 'PENDING'} 
                        carPrice={transaction.car_price} 
                        carYear={transaction.cars?.year || 2024}
                    />
                    </div>

                    {/* 2. Extra Services (PRIORITY CROSS-SELL) */}
                    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <PostSaleEcosystem 
                            transactionId={transaction.id} 
                            carPrice={transaction.car_price}
                            carLocation={transaction.cars?.location || "CDMX"}
                            state={transaction.cars?.location?.split(',').pop()?.trim() || "CDMX"}
                            initialGestoria={transaction.gestoria_cost > 0}
                            initialInsurance={transaction.insurance_cost > 0}
                        />
                    </div>

                    {/* 3. Final Handover Protocol */}
                    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
                        <div className="mb-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Protocolo de Entrega</span>
                            </div>
                            <h2 className="text-4xl font-black text-zinc-900 italic uppercase tracking-tighter italic">Checklist de Entrega Física</h2>
                            <p className="text-zinc-500 text-sm font-medium mt-4 leading-relaxed">
                                Una vez revisados los servicios adicionales, valida el estado físico. **No liberes los fondos hasta estar satisfecho.** Si detectas anomalías, activa la Mediación Élite.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-8">
                                <HandoverSafeCheck 
                                    isProcessing={processing}
                                    onComplete={handleReleaseFunds}
                                    onNegotiate={async () => {
                                        setProcessing(true);
                                        try {
                                            const res = await reportDiscrepancyAction(transaction.id, {
                                                reason: "Discrepancia en checklist de entrega física",
                                            });
                                            if (res.success) {
                                                setTransaction({ ...transaction, status: 'DISPUTED' });
                                                toast.warning("Mediación StarterKar Activada.");
                                                window.open(`https://wa.me/525522120249?text=Hola, solicito mediación para la transacción ${transaction.id}. El vehículo no cumple con el checklist.`, '_blank');
                                            }
                                        } catch (e) {
                                            toast.error("Error al reportar discrepancia");
                                        } finally {
                                            setProcessing(false);
                                        }
                                    }}
                                />
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-6">Guía StarterKar</h4>
                                    <ul className="space-y-6">
                                        <li className="flex gap-4">
                                            <div className="h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-indigo-100">1</div>
                                            <p className="text-xs font-bold text-zinc-600 leading-relaxed">Revisa que la factura original y tenencias coincidan con el vendedor.</p>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-indigo-100">2</div>
                                            <p className="text-xs font-bold text-zinc-600 leading-relaxed">Compara el VIN físico contra el reporte del Pasaporte Digital.</p>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-indigo-100">3</div>
                                            <p className="text-xs font-bold text-zinc-600 leading-relaxed">Prueba encendido, luces y sistemas electrónicos básicos.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Overlay */}
            {completed && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="max-w-md w-full p-10 bg-white rounded-[3rem] border border-zinc-200 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-500/40">
                            <PartyPopper className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">¡Compra Exitosa!</h2>
                            <p className="text-zinc-500 font-medium">Has completado tu transacción de forma segura con StarterKar.</p>
                        </div>
                        <StarterKarSeal variant="holographic" score={98} className="mx-auto" />
                        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-black text-emerald-900 uppercase">Fondos Liberados</span>
                            </div>
                            <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">El vendedor ha sido notificado. Disfruta tu nueva unidad con la tranquilidad de StarterKar.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Button asChild size="lg" className="h-14 font-black text-sm uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500">
                                <Link href="/dashboard">Ir a mi Garage</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
