"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { TransactionService } from "@/services/TransactionService";
import { Navbar } from "@/components/ui/navbar";
import { HandoverSafeCheck } from "@/components/dashboard/HandoverSafeCheck";
import { PostSaleEcosystem } from "@/components/dashboard/PostSaleEcosystem";
import { Loader2, ShieldCheck, MapPin, Car, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HandoverPage() {
    const { id } = useParams();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createBrowserClient(), []);

    useEffect(() => {
        async function fetchTransaction() {
            const { data } = await supabase
                .from('transactions')
                .select('*, cars(*)')
                .eq('id', id)
                .single();
            
            setTransaction(data);
            setLoading(false);
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
                                onComplete={() => alert("Entrega finalizada (Simulación)")}
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
                                carPrice={transaction.car_price}
                                initialGestoria={transaction.gestoria_cost > 0}
                                initialInsurance={transaction.insurance_cost > 0}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
