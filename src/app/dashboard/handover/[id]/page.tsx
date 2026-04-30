"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { 
    ArrowLeft, 
    ShieldCheck, 
    Zap, 
    PartyPopper, 
    CheckCircle,
    MapPin,
    FileText,
    MessageSquare
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
    confirmP2PHandoverAction, 
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
    const [activeTab, setActiveTab] = useState<'monitor' | 'handover' | 'services'>('monitor');

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
                    seller_id: 'mock-seller-id', // Added for testing roles
                    cars: {
                        make: "BMW",
                        model: "M3 Sedan",
                        location: "Naucalpan, Estado de México",
                        year: 2021
                    },
                    metadata: {
                        scheduled_delivery_date: new Date().toISOString(),
                        scheduled_delivery_time: "14:30"
                    }
                });
                setIsLoading(false);
                return;
            }

            // Fetch transaction first
            const { data: tx, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single();

            if (tx) {
                // Manually fetch the related car to bypass missing Foreign Key constraints in Supabase
                const { data: carData } = await supabase
                    .from('cars')
                    .select('*')
                    .eq('id', tx.car_id)
                    .single();
                
                tx.cars = carData || null;
                setTransaction(tx);
            }

            setIsLoading(false);
        }
        loadData();
    }, [id, supabase]);

    const handleReleaseFunds = async () => {
        setProcessing(true);
        try {
            const result = await confirmP2PHandoverAction(transaction.id);
            if (result.success) {
                setCompleted(true);
                toast.success("¡Operación completada con éxito!");
            } else {
                toast.error(result.error || "Error al confirmar entrega");
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
                                {user?.id === transaction?.buyer_id && (
                                    <a 
                                        href={`https://wa.me/525522120249?text=Hola, confirmo mi asistencia para la cita del ${transaction.cars?.make} ${transaction.cars?.model} el día ${new Date(transaction.metadata.scheduled_delivery_date).toLocaleDateString()} a las ${transaction.metadata.scheduled_delivery_time}.`}
                                        target="_blank"
                                        className="ml-4 h-10 px-4 bg-emerald-500 text-white text-[9px] font-black rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Confirmar WhatsApp
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-6 py-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Trato Seguro P2P</p>
                                <p className={cn(
                                    "text-sm font-black uppercase transition-all",
                                    transaction.status === 'DISPUTED' ? "text-amber-500 animate-pulse" : "text-emerald-600"
                                )}>
                                    {transaction.status === 'DISPUTED' ? "En Mediación" : "Pago Validado"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* TABS NAVIGATION */}
                    <div className="flex bg-white dark:bg-zinc-900 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-fit mx-auto">
                        <button
                            onClick={() => setActiveTab('monitor')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                                activeTab === 'monitor' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            Monitor de Compra
                        </button>
                        <button
                            onClick={() => setActiveTab('handover')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                                activeTab === 'handover' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            Checklist de Entrega
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'services' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Servicios y Documentos
                        </button>
                    </div>

                    {/* TAB CONTENTS */}
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'monitor' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <VaultStatus 
                                    status={transaction.status === 'RELEASED' ? 'RELEASED' : 'FUNDS_HELD'} 
                                    carPrice={transaction.car_price} 
                                    carYear={transaction.cars?.year || 2024}
                                    role={user?.id === transaction?.seller_id ? 'seller' : 'buyer'}
                                />
                            </div>
                        )}

                        {activeTab === 'handover' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <div className="mb-10 max-w-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Protocolo de Entrega</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-zinc-900 italic uppercase tracking-tighter">Checklist de Entrega Física</h2>
                                    <p className="text-zinc-500 text-sm font-medium mt-4 leading-relaxed">
                                        {user?.id === transaction?.seller_id 
                                            ? "Asegúrate de cumplir con estos requisitos para una entrega exitosa. **Una vez que el comprador confirme, recibirás el pago.**"
                                            : "Valida el estado físico de tu nuevo vehículo. **Al confirmar la entrega, notificas a StarterKar que la transacción P2P ha sido satisfactoria y puedes proceder al pago.**"
                                        }
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-8">
                                        <HandoverSafeCheck 
                                            isProcessing={processing}
                                            role={user?.id === transaction?.seller_id ? 'seller' : 'buyer'}
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
                                                    <p className="text-xs font-bold text-zinc-600 leading-relaxed">
                                                        {user?.id === transaction?.seller_id 
                                                            ? "Acude puntual a la cita con el tanque a 1/4 y el vehículo limpio."
                                                            : "Revisa que la factura original y tenencias coincidan con el vendedor."}
                                                    </p>
                                                </li>
                                                <li className="flex gap-4">
                                                    <div className="h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-indigo-100">2</div>
                                                    <p className="text-xs font-bold text-zinc-600 leading-relaxed">
                                                        {user?.id === transaction?.seller_id 
                                                            ? "Muestra disposición para que el mecánico y el comprador revisen el auto."
                                                            : "Compara el VIN físico contra el reporte del Pasaporte Digital."}
                                                    </p>
                                                </li>
                                                <li className="flex gap-4">
                                                    <div className="h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-indigo-100">3</div>
                                                    <p className="text-xs font-bold text-zinc-600 leading-relaxed">
                                                        {user?.id === transaction?.seller_id 
                                                            ? "Solo endosa la factura y entrega las llaves hasta ver el dinero reflejado en tu cuenta bancaria."
                                                            : "Prueba encendido, luces y sistemas electrónicos básicos."}
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <PostSaleEcosystem 
                                    transactionId={transaction.id} 
                                    carPrice={transaction.car_price}
                                    carLocation={transaction.cars?.location || "CDMX"}
                                    state={transaction.cars?.location?.split(',').pop()?.trim() || "CDMX"}
                                    role={user?.id === transaction?.seller_id ? 'seller' : 'buyer'}
                                    initialGestoria={transaction.gestoria_cost > 0}
                                    initialInsurance={transaction.insurance_cost > 0}
                                />
                            </div>
                        )}
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
                                <span className="text-sm font-black text-emerald-900 uppercase">Transacción P2P Exitosa</span>
                            </div>
                            <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                                <strong>Acuse de Recibo:</strong> Se confirma la entrega física y legal del vehículo. StarterKar certifica que la transferencia bancaria fue validada y el trato se ha cerrado bajo el protocolo de Trato Seguro.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button 
                                variant="outline" 
                                className="h-14 font-black text-[10px] uppercase tracking-tighter border-zinc-200" 
                                onClick={async () => {
                                    const { downloadContractClient } = await import('@/lib/documents/clientGenerator');
                                    downloadContractClient({
                                        transactionId: transaction.id,
                                        carPrice: transaction.car_price || 0,
                                        carDetails: {
                                            make: transaction.cars?.make || "Auto",
                                            model: transaction.cars?.model || "",
                                            year: transaction.cars?.year || "",
                                            vin: transaction.cars?.vin || undefined,
                                            motor: transaction.cars?.motor || undefined,
                                            plates: transaction.cars?.plates || undefined,
                                            color: transaction.cars?.color || undefined,
                                            km: transaction.cars?.mileage ? `${transaction.cars.mileage.toLocaleString()} km` : undefined,
                                        },
                                        date: new Date().toLocaleDateString("es-MX"),
                                        time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) + " hrs",
                                    });
                                }}
                            >
                                <FileText className="mr-2 h-4 w-4" /> Contrato PROFECO
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-14 font-black text-[10px] uppercase tracking-tighter border-zinc-200" 
                                onClick={async () => {
                                    const { downloadResponsivaClient } = await import('@/lib/documents/clientGenerator');
                                    downloadResponsivaClient({
                                        transactionId: transaction.id,
                                        carPrice: transaction.car_price || 0,
                                        carDetails: {
                                            make: transaction.cars?.make || "Auto",
                                            model: transaction.cars?.model || "",
                                            year: transaction.cars?.year || "",
                                            vin: transaction.cars?.vin || undefined,
                                            motor: transaction.cars?.motor || undefined,
                                            plates: transaction.cars?.plates || undefined,
                                            color: transaction.cars?.color || undefined,
                                            km: transaction.cars?.mileage ? `${transaction.cars.mileage.toLocaleString()} km` : undefined,
                                        },
                                        date: new Date().toLocaleDateString("es-MX"),
                                        time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) + " hrs",
                                    });
                                }}
                            >
                                <FileText className="mr-2 h-4 w-4" /> Carta Responsiva
                            </Button>
                        </div>
                        <Button asChild size="lg" className="w-full h-14 font-black text-sm uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 rounded-3xl">
                            <Link href="/dashboard">Ir a mi Garage</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
