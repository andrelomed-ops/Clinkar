"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, CreditCard, Clock, CheckCircle2, QrCode, ArrowRight, MapPin, Wrench, Car, CarFront, Smartphone, Heart, LogOut, LayoutDashboard, Search, User, BarChart3, TrendingUp, Zap, Diamond, Crown, Trash2 } from "lucide-react";
import { StarterKarLogo } from "@/components/ui/StarterKarLogo";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VaultStatus } from "@/components/dashboard/VaultStatus";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { UnifiedVehicleStatusView } from "@/components/dashboard/UnifiedVehicleStatusView";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ActiveOperationView } from "@/components/dashboard/ActiveOperationView";
import { StarterKarEvolutionHub } from "@/components/dashboard/StarterKarEvolutionHub";
import { SidebarPromo } from "@/components/dashboard/SidebarPromo";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedSection } from "@/components/dashboard/RecommendedSection";
import { EcosystemHub } from "@/components/dashboard/EcosystemHub";
import Image from "next/image";
import { EvolvedShield } from "@/components/ui/EvolvedShield";
import { FavoriteService } from "@/services/FavoriteService";
import { CarCard } from "@/components/market/CarCard";
import { ALL_CARS, Vehicle } from "@/data/cars";
import { CarService } from "@/services/CarService";
import { deleteCarAction } from "@/app/actions/cars";
import { ReferralPromoCard } from "@/components/dashboard/ReferralPromoCard";
import { BillingSemaphore } from "@/components/dashboard/BillingSemaphore";
import { createBrowserClient } from "@/lib/supabase/client";

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [ownedCars, setOwnedCars] = useState<any[]>([]);
    const [favoriteCars, setFavoriteCars] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"buying" | "selling" | "completed">("buying");
    const [investorApp, setInvestorApp] = useState<any>(null);
    const [activeInspections, setActiveInspections] = useState<any[]>([]);

    const supabase = useMemo(() => createBrowserClient(), []);

    const isAdmin = useMemo(() => {
        if (!user) return false;
        const email = user.email?.toLowerCase() || "";
        const emailMatch = email === "starterkar@hotmail.com" || email.includes("starterkar@admin");
        const roleMatch = userProfile?.role?.toLowerCase() === "admin";
        return emailMatch || roleMatch;
    }, [user, userProfile]);

    const isInspector = useMemo(() => {
        return isAdmin || userProfile?.role?.toLowerCase() === "inspector";
    }, [isAdmin, userProfile]);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: txs } = await supabase
                .from("transactions")
                .select("*")
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .order("created_at", { ascending: false });

            if (txs) {
                const carIds = txs.map((tx: any) => tx.car_id);
                const { data: carsData } = await supabase.from("cars").select("*").in("id", carIds);
                
                const mappedTxs = txs.map((tx: any) => {
                    const car = carsData?.find(c => c.id === tx.car_id);
                    return {
                        id: tx.id,
                        carName: car ? (car.make + " " + car.model) : "Vehiculo",
                        year: car?.year,
                        price: tx.car_price,
                        status: tx.status,
                        role: tx.seller_id === user.id ? "seller" : "buyer",
                        location: "CDMX",
                        image: car?.images?.[0] || "",
                    };
                });
                setTransactions(mappedTxs);
            }

            const { data: cars } = await supabase.from("cars").select("*").eq("seller_id", user.id);
            if (cars) {
                setOwnedCars(cars);
                
                // Fetch appointments for these cars (From both legacy and new service tickets)
                const carIds = cars.map(c => c.id);
                
                // 1. Citas Legacy
                const { data: appointments } = await supabase
                    .from("inspection_appointments")
                    .select("*, partners(name, address)")
                    .in("car_id", carIds)
                    .eq("status", "PENDING");
                
                // 2. Citas Modernas (Service Tickets)
                const { data: tickets } = await supabase
                    .from("service_tickets")
                    .select("*, partners(name, address)")
                    .in("car_id", carIds)
                    .eq("type", "150_point_inspection")
                    .eq("status", "SCHEDULED");
                
                const carsWithAppts = cars.map(car => {
                    // Priorizar service tickets si existen
                    const ticket = tickets?.find(t => t.car_id === car.id);
                    const appt = appointments?.find(a => a.car_id === car.id);
                    
                    return {
                        ...car,
                        appointment: ticket ? {
                            id: ticket.id,
                            appointment_date: ticket.scheduled_at,
                            partners: ticket.partners
                        } : appt
                    };
                });
                setOwnedCars(carsWithAppts);
            }

            const favIds = await FavoriteService.getFavorites(supabase);
            setFavoriteIds(favIds);
            if (favIds.length > 0) {
                const { data: dbCars } = await supabase.from("cars").select("*").in("id", favIds.filter(id => id.length > 20));
                setFavoriteCars(dbCars || []);
            }

            // 4. Fetch Active Inspections for Ecosystem Hub (service tickets)
            const { data: inspections } = await supabase
                .from("service_tickets")
                .select("*, cars(make, model, year)")
                .eq("status", "SCHEDULED")
                .eq("type", "150_point_inspection")
                .order("scheduled_at", { ascending: true });
            
            if (inspections) {
                setActiveInspections(inspections.map((ins: any) => ({
                    id: ins.id,
                    car: `${ins.cars?.make} ${ins.cars?.model}`,
                    date: ins.scheduled_at,
                    status: ins.status
                })));
            }

        } catch (err) {
            console.error("[Dashboard] Critical load error:", err);
        } finally {
            setIsLoading(false);
            setMounted(true);
        }

    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                if (profile) setUserProfile(profile);
            }
        };
        checkAuth();
        loadDashboard();

        // [NEW] Sync tab with URL and scroll to it
        const tab = searchParams.get("tab");
        if (tab === "buying" || tab === "selling" || tab === "completed") {
            setActiveTab(tab as any);
            // Smooth scroll to the tabs section
            setTimeout(() => {
                const element = document.getElementById("garage-tabs");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 500);
        }
    }, [supabase, searchParams]);


    const handleToggleFavorite = async (e: any, id: string) => {
        e.preventDefault();
        await FavoriteService.toggleFavorite(supabase, id);
        loadDashboard();
    };

    const handleCancelAppointment = async (apptId: string, carId?: string) => {
        const confirm = window.confirm("¿Estás seguro de que deseas cancelar esta cita de inspección?");
        if (!confirm) return;

        try {
            // 1. Intentar borrar de citas legacy (si es de ahí)
            const { error: legacyError } = await supabase
                .from("inspection_appointments")
                .delete()
                .eq("id", apptId);
            
            if (legacyError) throw legacyError;

            // 2. Intentar marcar como cancelado en service_tickets (si es de ahí)
            const { error: ticketError } = await supabase
                .from("service_tickets")
                .update({ status: 'CANCELLED' })
                .eq("id", apptId);

            if (ticketError) throw ticketError;

            // 3. Si se proporcionó carId y el auto está en pre-registro, lo eliminamos para limpiar el Dashboard
            if (carId) {
                const { data: carData } = await supabase.from("cars").select("status").eq("id", carId).single();
                if (carData?.status === 'pending_inspection') {
                    const result = await deleteCarAction(carId);
                    if (!result.success) {
                        console.error("Error cleaning up car record:", result.message);
                    }
                }
            }
            
            toast.success("Cita cancelada y registro removido");
            
            // Forzar recarga del dashboard
            await loadDashboard();
            
            // Fallback: Si después de 1 segundo sigue apareciendo, forzar recarga de página
            setTimeout(() => {
                loadDashboard();
            }, 1000);

        } catch (err: any) {
            console.error("Error cancelling appointment:", err);
            toast.error("No se pudo cancelar la cita: " + (err.message || "Error desconocido"));
        }
    };

    const handleDeleteCar = async (carId: string) => {
        const confirm = window.confirm("¿Deseas eliminar permanentemente este registro de auto?");
        if (!confirm) return;

        try {
            const result = await deleteCarAction(carId);
            
            if (!result.success) {
                console.error("Error deleting car record:", result.message);
                toast.error(`Error al limpiar el registro: ${result.message}`);
            } else {
                toast.success("Registro eliminado correctamente");
                loadDashboard();
            }
        } catch (err: any) {
            console.error("Error deleting car:", err);
            toast.error("No se pudo eliminar el auto: " + (err.message || "Error desconocido"));
        }
    };

    if (!mounted) return <div className="p-12"><Skeleton className="h-20 w-full" /></div>;

    return (
        <div className="flex h-screen flex-col bg-background overflow-x-hidden">
            <nav className="border-b border-border bg-background/80 backdrop-blur-md px-3 md:px-6 h-16 shrink-0 flex items-center justify-between z-50">
                <div className="flex items-center gap-2 md:gap-4">
                    <StarterKarLogo size="xs" showWordmark={false} href="/" />
                    <span className="font-black text-sm md:text-xl uppercase italic tracking-tighter whitespace-nowrap">Mi Garage</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-4">
                    <NotificationCenter />
                    {userProfile?.role?.toLowerCase() !== 'investor' && (
                        <Link 
                            href="/investor/apply"
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Inversionistas</span>
                            <span className="sm:hidden">Invertir</span>
                        </Link>
                    )}
                    <button 
                        onClick={() => { supabase.auth.signOut(); window.location.href="/"; }} 
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-2 md:px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-all whitespace-nowrap"
                    >
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                        <span className="sm:hidden">Cerrar</span>
                    </button>
                    <EvolvedShield 
                        role={userProfile?.role} 
                        tier={userProfile?.investor_tier}
                        name={userProfile?.full_name} 
                        size="md" 
                    />
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <EcosystemHub userProfile={userProfile} activeInspections={activeInspections} investorApp={investorApp} />
                
                <div className="max-w-5xl mx-auto w-full p-6 md:p-12">
                    <div className="flex justify-between items-center mb-8">
                            <Link href="/dashboard/profile" className="flex items-center gap-6 hover:opacity-80 transition-opacity">
                                <EvolvedShield 
                                    role={userProfile?.role} 
                                    tier={userProfile?.investor_tier}
                                    name={userProfile?.full_name} 
                                    size="xl" 
                                />
                                <div>
                                    <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter">
                                        {userProfile?.full_name || 'Mi Garage'}
                                    </h1>
                                    {isAdmin ? (
                                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-800 shadow-xl shadow-black/20">
                                            🛡️ Administrador Maestro
                                        </div>
                                    ) : userProfile?.role?.toLowerCase() === 'investor' && (
                                         <div className={cn(
                                             "inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-lg transition-all",
                                             userProfile?.investor_tier === 'elite' ? "bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30" :
                                             userProfile?.investor_tier === 'pro' ? "bg-amber-500 text-white border-amber-400 shadow-amber-500/30" :
                                             "bg-zinc-100 text-zinc-600 border-zinc-200"
                                         )}>
                                             {userProfile?.investor_tier === 'elite' ? <Diamond className="h-3 w-3" /> : 
                                              userProfile?.investor_tier === 'pro' ? <Crown className="h-3 w-3" /> : 
                                              <ShieldCheck className="h-3 w-3" />}
                                             Inversionista {userProfile?.investor_tier?.toUpperCase() || 'STARTER'}
                                         </div>
                                     )}
                                </div>
                            </Link>
                        <div className="flex gap-2">
                            {isAdmin && <Link href="/admin" className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase">Admin</Link>}
                        </div>
                    </div>

                    <div id="garage-tabs" className="flex border-b border-border/40 mb-10 overflow-x-auto no-scrollbar">
                        {(["buying", "selling", "completed"] as const).map((tab) => {
                            const count = tab === "buying" 
                                ? transactions.filter(tx => tx.role === "buyer" && tx.status !== "RELEASED").length
                                : tab === "selling"
                                ? transactions.filter(tx => tx.role === "seller" && tx.status !== "RELEASED").length
                                : transactions.filter(tx => tx.status === "RELEASED").length;

                            return (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)} 
                                    className={cn(
                                        "px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all", 
                                        activeTab === tab ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <span>
                                        {tab === "buying" ? "🛒 Comprando" : tab === "selling" ? "🏷️ Vendiendo" : "✅ Completadas"}
                                    </span>
                                    {count > 0 && (
                                        <span className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black",
                                            activeTab === tab ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>


                    <div className="space-y-12">
                        {activeTab === "buying" && (
                            <>
                                {transactions.filter(tx => tx.role === "buyer" && tx.status !== "RELEASED").map(tx => (
                                    <Link key={tx.id} href={"/dashboard/handover/" + tx.id} className="block group">
                                        <div className="glass-card rounded-[2.5rem] p-8 border border-zinc-100/50 flex items-center justify-between hover:shadow-2xl transition-all">
                                            <div className="flex items-center gap-8">
                                                <div className="h-28 w-44 bg-secondary rounded-3xl overflow-hidden relative">
                                                    {tx.image ? <Image src={tx.image} alt={tx.carName} fill className="object-cover" /> : <Car className="h-10 w-10 m-auto text-muted-foreground/20" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl italic uppercase">{tx.carName}</h3>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase">{tx.year} • CDMX</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </Link>
                                ))}
                                <div className="pt-12 border-t">
                                    <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2"><Heart className="h-5 w-5 text-indigo-600" /> Mis Favoritos</h2>
                                    {favoriteCars.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {favoriteCars.map(car => <CarCard key={car.id} car={car} isFavorite={true} onToggleFavorite={(e) => handleToggleFavorite(e, car.id)} />)}
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No hay favoritos</p>}
                                </div>
                                <RecommendedSection favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
                            </>
                        )}

                        {activeTab === "selling" && (
                            <>
                                {transactions.filter(tx => tx.role === "seller" && tx.status !== "RELEASED").map(tx => (
                                    <Link key={tx.id} href={"/dashboard/handover/" + tx.id} className="block group">
                                        <div className="glass-card rounded-[2rem] p-6 border border-zinc-100/50 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="h-20 w-32 bg-secondary rounded-2xl overflow-hidden relative">
                                                    {tx.image ? <Image src={tx.image} alt={tx.carName} fill className="object-cover" /> : <Car className="h-8 w-8 m-auto text-muted-foreground/20" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl italic uppercase">{tx.carName}</h3>
                                                    <p className="text-xs font-bold text-muted-foreground">${tx.price?.toLocaleString()} MXN</p>
                                                </div>
                                            </div>
                                            <Button asChild variant="secondary" className="rounded-xl"><span>Gestionar</span></Button>
                                        </div>
                                    </Link>
                                ))}
                                <div className="pt-12">
                                    <h2 className="text-xl font-black italic uppercase">Mi Garage Digital</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {ownedCars.map(car => (
                                            <Link key={car.id} href={"/dashboard/sell/" + car.id} className="block group">
                                                <div className="glass-card rounded-[2.5rem] p-8 border border-zinc-100/50 hover:border-indigo-500/30 transition-all space-y-6">
                                                     <div className="flex items-center gap-6">
                                                         <div className="h-24 w-24 rounded-3xl bg-secondary overflow-hidden shrink-0">
                                                             {car.images?.[0] ? <Image src={car.images[0]} alt={car.make} width={96} height={96} className="object-cover" /> : <Car className="h-10 w-10 m-7 text-muted-foreground/20" />}
                                                         </div>
                                                         <div>
                                                             <h3 className="font-black text-2xl italic uppercase truncate">{car.make} {car.model}</h3>
                                                             <p className="text-[10px] font-black text-zinc-400 uppercase mt-2">{car.year} • {car.transmission}</p>
                                                         </div>
                                                     </div>

                                                     {car.appointment && (
                                                         <div className="bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 flex items-center justify-between gap-4 transition-all">
                                                             <div className="flex items-center gap-4">
                                                                 <div className="h-10 w-10 bg-indigo-600/10 text-indigo-600 flex items-center justify-center rounded-2xl shrink-0">
                                                                     <ShieldCheck className="h-5 w-5" />
                                                                 </div>
                                                                 <div className="space-y-0.5">
                                                                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/80">Certificación Elite</p>
                                                                     <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic">
                                                                         {new Date(car.appointment.appointment_date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                                     </p>
                                                                     <p className="text-[10px] font-bold text-zinc-400">
                                                                         {new Date(car.appointment.appointment_date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs • {car.appointment.partners?.name}
                                                                     </p>
                                                                 </div>
                                                             </div>
                                                             <button 
                                                                 onClick={(e) => {
                                                                     e.preventDefault();
                                                                     e.stopPropagation();
                                                                     handleCancelAppointment(car.appointment.id, car.id);
                                                                 }}
                                                                 className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                 title="Cancelar Cita"
                                                             >
                                                                 <Trash2 className="h-4 w-4" />
                                                             </button>
                                                         </div>
                                                     )}

                                                      {!car.appointment && car.status === 'pending_inspection' && (
                                                          <div className="flex justify-end pt-4">
                                                              <button 
                                                                  onClick={(e) => {
                                                                      e.preventDefault();
                                                                      e.stopPropagation();
                                                                      handleDeleteCar(car.id);
                                                                  }}
                                                                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                                                              >
                                                                  <Trash2 className="h-4 w-4" /> Eliminar Borrador
                                                              </button>
                                                          </div>
                                                      )}
                                                 </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "completed" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-black italic uppercase text-zinc-500 mb-8">Historial de Operaciones</h2>
                                {transactions.filter(tx => tx.status === "RELEASED").length > 0 ? (
                                    transactions.filter(tx => tx.status === "RELEASED").map(tx => (
                                        <div key={tx.id} className="glass-card rounded-[2rem] p-8 flex items-center justify-between group hover:border-emerald-500/30 transition-all border border-zinc-100/50">
                                            <div className="flex items-center gap-8">
                                                <div className="h-24 w-40 bg-zinc-100 rounded-3xl overflow-hidden relative opacity-70 grayscale hover:grayscale-0 transition-all">
                                                    {tx.image ? <Image src={tx.image} alt={tx.carName} fill className="object-cover" /> : <Car className="h-10 w-10 m-auto text-muted-foreground/20" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl italic uppercase text-zinc-600">{tx.carName}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Operación Exitosa</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-zinc-400 mb-2">${tx.price?.toLocaleString()} MXN</p>
                                                <Link href={"/dashboard/handover/" + tx.id} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                                                    Ver Expediente <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 border-2 border-dashed border-zinc-100 rounded-[3rem] text-center">
                                        <Clock className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No hay transacciones finalizadas aún</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </main>
            <footer className="h-10 border-t border-border/40 bg-zinc-50/50 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        StarterKar Garage • v5.9.9 Stable
                    </p>
                </div>
                <div className="text-[9px] font-bold text-zinc-300 italic">
                    P2P Mediation Engine • Real-time Sync Active
                </div>
            </footer>
        </div>

    );
}
