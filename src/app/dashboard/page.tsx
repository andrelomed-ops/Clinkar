"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, CreditCard, Clock, CheckCircle2, QrCode, ArrowRight, MapPin, Wrench, Car, CarFront, Smartphone, Heart, LogOut, LayoutDashboard, Search, User, BarChart3, TrendingUp, Zap } from "lucide-react";
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
            if (cars) setOwnedCars(cars);

            const favIds = await FavoriteService.getFavorites(supabase);
            setFavoriteIds(favIds);
            if (favIds.length > 0) {
                const { data: dbCars } = await supabase.from("cars").select("*").in("id", favIds.filter(id => id.length > 20));
                setFavoriteCars(dbCars || []);
            }

            // 4. Set Inspections to empty for now to avoid 400/404 errors
            setActiveInspections([]);

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

    if (!mounted) return <div className="p-12"><Skeleton className="h-20 w-full" /></div>;

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden">
            <nav className="border-b border-border bg-background/80 backdrop-blur-md px-6 h-16 shrink-0 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <StarterKarLogo size="xs" showWordmark={false} href="/" />
                    <span className="font-bold text-lg">Mi Garage</span>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationCenter />
                    {userProfile?.role?.toLowerCase() !== 'investor' && (
                        <Link 
                            href="/investor/apply"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all whitespace-nowrap"
                        >
                            Inversionistas
                        </Link>
                    )}
                    <button onClick={() => { supabase.auth.signOut(); window.location.href="/"; }} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-all">Cerrar Sesion</button>
                    <EvolvedShield 
                        role={userProfile?.role} 
                        name={userProfile?.full_name} 
                        size="md" 
                    />
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <EcosystemHub userProfile={userProfile} activeInspections={activeInspections} investorApp={investorApp} />
                
                <div className="max-w-5xl mx-auto w-full p-6 md:p-12">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-6">
                            <EvolvedShield 
                                role={userProfile?.role} 
                                name={userProfile?.full_name} 
                                size="xl" 
                            />
                            <div>
                                <h1 className="text-4xl font-black italic uppercase leading-none">Hola, {userProfile?.full_name?.split(" ")[0]}</h1>
                                {userProfile?.role?.toLowerCase() === 'investor' && (
                                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                        🎖️ Estatus Inversionista Pro
                                    </div>
                                )}
                            </div>
                        </div>
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
                                    <h2 className="text-xl font-black italic uppercase mb-6">Mi Garage Digital</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {ownedCars.map(car => (
                                            <Link key={car.id} href={"/dashboard/sell/" + car.id} className="block group">
                                                <div className="glass-card rounded-[2.5rem] p-8 border border-zinc-100/50 hover:border-indigo-500/30 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-24 w-24 rounded-3xl bg-secondary overflow-hidden shrink-0">
                                                            {car.images?.[0] ? <Image src={car.images[0]} alt={car.make} width={96} height={96} className="object-cover" /> : <Car className="h-10 w-10 m-7 text-muted-foreground/20" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-2xl italic uppercase truncate">{car.make} {car.model}</h3>
                                                            <p className="text-[10px] font-black text-zinc-400 uppercase mt-2">{car.year} • {car.transmission}</p>
                                                        </div>
                                                    </div>
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
            <footer className="h-8 border-t border-border/40 bg-zinc-50 flex items-center justify-between px-6 shrink-0">
                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                    StarterKar Garage • v4.9.0 Deployment
                </div>
                <div className="text-[9px] font-bold text-zinc-300 italic">
                    P2P Mediation Engine • Real-time Sync Active
                </div>
            </footer>
        </div>

    );
}
