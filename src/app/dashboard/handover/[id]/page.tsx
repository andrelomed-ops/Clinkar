"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/ui/navbar";
import { HandoverSafeCheck } from "@/components/dashboard/HandoverSafeCheck";
import { PostSaleEcosystem } from "@/components/dashboard/PostSaleEcosystem";
import { Loader2, ShieldCheck, MapPin, Car, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { releaseVaultFundsAction } from "@/app/actions/transaction";
import { toast } from "sonner";
import { StarterKarSeal } from "@/components/market/StarterKarSeal";
import { PartyPopper, CheckCircle } from "lucide-react";

export default function HandoverPage() {
    const { id } = useParams();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const supabase = useMemo(() => createBrowserClient(), []);

    useEffect(() => {
        async function fetchTransaction() {
            try {
                // Try to join first
                let { data, error } = await supabase
                    .from('transactions')
                    .select('*, cars(*)')
                    .eq('id', id)
                    .single();
                
                if (error || !data?.cars) {
                    // Fallback for simulation/demo
                    if (id?.toString().startsWith('mock-tx') || id?.toString().startsWith('demo-tx')) {
                        data = {
                            id: id.toString(),
                            car_id: 'demo-car',
                            cars: {
                                make: 'BYD',
                                model: 'Dolphin Mini',
                                year: 2024,
                                price: 358000,
                                location: 'CDMX',
                                images: ['https://upload.wikimedia.org/wikipedia/commons/e/ea/BYD_Dolphin_IAA_2023_1X7A0634.jpg']
                            },
                            gestoria_cost: 0,
                            insurance_cost: 0,
                            status: 'IN_VAULT'
                        };
                    } else {
                        // Fallback: Fetch separately if join fails
                        const { data: txData } = await supabase
                            .from('transactions')
                            .select('*')
                            .eq('id', id)
                            .single();
                        
                        if (txData) {
                            const { data: carData } = await supabase
                                .from('cars')
                                .select('*')
                                .eq('id', txData.car_id)
                                .single();
                            
                            data = { ...txData, cars: carData };
                        }
                    }
                }
                
                setTransaction(data);
            } catch (e) {
                console.error("Error fetching transaction:", e);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchTransaction();
    }, [id, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
                <Car className="h-16 w-16 text-zinc-300 mb-4" />
                <h1 className="text-2xl font-black italic">Transacción no encontrada</h1>
                <p className="text-zinc-500 mt-2 mb-8">El folio de operación #{id?.toString().slice(0,8)} no existe o no tienes acceso.</p>
                <Button asChild rounded-xl>
                    <Link href="/dashboard">Volver al Garage</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar variant="market" />
            
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Volver al Garage</span>
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter italic">Proceso de Entrega Segura</h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Folio: #{transaction.id.slice(0, 8)} • {transaction.cars?.make} {transaction.cars?.model}</p>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Estatus de Bóveda</p>
                            <p className="text-sm font-black text-emerald-600 uppercase">Fondos Resguardados</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Checklist & Handover */}
                    <div className="lg:col-span-7 space-y-8">
                        <section>
                            <HandoverSafeCheck 
                                isProcessing={processing}
                                onComplete={async () => {
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
                                }}
                                onNegotiate={() => alert("Mediación solicitada")}
                            />
                        </section>

                        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <MapPin className="h-32 w-32" />
                            </div>
                            <div className="relative z-10 max-w-md">
                                <h3 className="text-2xl font-black italic mb-4">¿Necesitas ayuda presencial?</h3>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">
                                    Nuestros agentes de entrega están listos para asistirte en el Taller Aliado. Si algo no coincide, el pago no se libera.
                                </p>
                                <button className="h-12 px-6 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                                    Llamar a Soporte VIP
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Post-Sale Ecosystem */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <PostSaleEcosystem 
                                transactionId={transaction.id} 
                                carPrice={transaction.cars?.price}
                                carLocation={transaction.cars?.location}
                                initialGestoria={transaction.gestoria_cost > 0}
                                initialInsurance={transaction.insurance_cost > 0}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Modal / Overlay */}
            {completed && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="max-w-md w-full p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            <div className="relative h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-500/40">
                                <PartyPopper className="h-12 w-12" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter">¡Felicidades!</h2>
                            <p className="text-zinc-500 font-medium">Has completado tu compra de forma segura.</p>
                        </div>

                        <StarterKarSeal variant="holographic" score={98} className="mx-auto" />

                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase">Fondos Liberados</span>
                            </div>
                            <p className="text-[10px] text-emerald-800 dark:text-emerald-500/80 font-medium leading-relaxed">
                                El vendedor ha recibido la notificación de pago. Tu garantía de 90 días comienza a partir de este momento.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Button asChild size="lg" rounded-2xl className="h-14 font-black text-sm uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20">
                                <Link href="/dashboard">Ir a mi Garage</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" rounded-2xl className="h-14 font-black text-sm uppercase tracking-widest border-2">
                                <Link href={`/dashboard/referrals`}>Invitar Amigos & Ganar $500</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
