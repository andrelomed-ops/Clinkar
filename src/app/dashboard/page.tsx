"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, CreditCard, Clock, CheckCircle2, QrCode, ArrowRight, MapPin, Wrench, Car, CarFront, Smartphone, Heart, LogOut, LayoutDashboard, Search, User, BarChart3 } from "lucide-react";
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
import { FavoriteService } from "@/services/FavoriteService";
import { CarCard } from "@/components/market/CarCard";
import { ALL_CARS, Vehicle } from "@/data/cars";
import { CarService } from "@/services/CarService";
import { ReferralPromoCard } from "@/components/dashboard/ReferralPromoCard";
import { BillingSemaphore } from "@/components/dashboard/BillingSemaphore";

// Removed: imports from deleted files (StatusHeader, NegotiationView, etc.)

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
    
    // Acceso Maestro para StarterKar@hotmail.com
    const isAdmin = useMemo(() => {
        if (!user) return false;
        const email = user.email?.toLowerCase() || '';
        const emailMatch = email === 'starterkar@hotmail.com' || email.includes('starterkar@admin');
        const roleMatch = userProfile?.role?.toLowerCase() === 'admin';
        return emailMatch || roleMatch;
    }, [user, userProfile]);

    const isInspector = useMemo(() => {
        return isAdmin || userProfile?.role?.toLowerCase() === 'inspector';
    }, [isAdmin, userProfile]);
    const [ownedCars, setOwnedCars] = useState<any[]>([]);
    const [favoriteCars, setFavoriteCars] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"buying" | "selling" | "completed">("buying");
    const [investorApp, setInvestorApp] = useState<any>(null);

    const supabase = useMemo(() => createBrowserClient(), []);

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            const end = Date.now() + 3 * 1000;
            const colors = ["#4F46E5", "#10B981", "#F59E0B"];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            toast.success("¡Cuenta Verificada!", {
                description: "Tu correo ha sido confirmado exitosamente. Bienvenido a StarterKar.",
                duration: 5000,
            });

            // Clean URL
            router.replace("/dashboard");

            // Apply referral code if present in URL
            const refCode = searchParams.get("ref");
            if (refCode && user) {
                const currentUserId = user.id;
                (async () => {
                    await applyReferralCode(currentUserId, refCode);
                })();
            }
        }
    }, [searchParams, router, user]);

    const applyReferralCode = async (userId: string, code: string) => {
        try {
            const { data: codeOwner, error: codeError } = await supabase
                .from("referral_links")
                .select("user_id")
                .eq("code", code.toUpperCase())
                .single();

            if (codeError || !codeOwner) return;
            if (codeOwner.user_id === userId) return;

            await supabase.from("referrals").insert({
                referrer_id: codeOwner.user_id,
                referred_user_id: userId,
                status: "PENDING_OPERATION",
            });
            toast.success("¡Código de referido aplicado!");
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, carId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isCurrentlyFavorite = favoriteIds.includes(carId);
        
        // Optimistic Update
        if (isCurrentlyFavorite) {
            setFavoriteIds(prev => prev.filter(id => id !== carId));
            setFavoriteCars(prev => prev.filter(c => c.id !== carId));
            toast.info("Eliminado de favoritos");
        } else {
            setFavoriteIds(prev => [...prev, carId]);
            // If it was in the owned cars or we need to fetch it... 
            // but usually we just need the ID for the icons.
            toast.success("Agregado a favoritos");
        }

        try {
            const { FavoriteService } = await import('@/services/FavoriteService');
            await FavoriteService.toggleFavorite(supabase, carId);
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
                if (profile) setUserProfile(profile);
            } else {
                const demoRole = document.cookie.split('; ').find(row => row.startsWith('starterkar_role='))?.split('=')[1];
                if (demoRole) {
                    setUserProfile({
                        full_name: "Usuario Demo",
                        role: demoRole,
                        email: "demo@starterkar.com"
                    });
                }
            }
        };

        loadProfile();

        const loadDashboard = async () => {
            try {
                setIsLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch transactions first with extreme safety
                const { data: txs, error: txError } = await (supabase
                    .from("transactions") as any)
                    .select("*")
                    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                    .order("created_at", { ascending: false });

                if (!txError && txs && txs.length > 0) {
                    // Fetch associated cars manually to avoid relationship cache errors
                    const carIds = txs.map((tx: any) => tx.car_id);
                    const { data: carsData } = await supabase
                        .from("cars")
                        .select("*")
                        .in("id", carIds);

                    const mappedTxs = txs.map((tx: any) => {
                        const car = carsData?.find(c => c.id === tx.car_id);
                        return {
                            id: tx.id,
                            carName: car ? `${car.make} ${car.model}` : "Vehículo",
                            year: car?.year,
                            price: tx.car_price,
                            status: tx.status,
                            role: tx.seller_id === user.id ? "seller" : "buyer",
                            location: "CDMX",
                            image: car?.images?.[0] || "",
                            commissionPaid: tx.commission_paid,
                            commissionAmount: tx.seller_success_fee
                        };
                    });

                    setTransactions(mappedTxs);
                    if (mappedTxs.length > 0 && !selectedId) setSelectedId(mappedTxs[0].id);
                } else {
                    setTransactions([]);
                }

                // Fetch published cars (Available + Sold to show history)
                const { data: cars } = await supabase
                    .from("cars")
                    .select("*")
                    .eq("seller_id", user.id)
                    .in("status", ["available", "AVAILABLE", "published", "PUBLISHED", "certified", "CERTIFIED", "SOLD", "sold"]);
                if (cars) setOwnedCars(cars);

                // ── FAVORITES: load real car data ──────────────────────
                try {
                    const { FavoriteService } = await import('@/services/FavoriteService');
                    const favIds = await FavoriteService.getFavorites(supabase);
                    setFavoriteIds(favIds);

                    if (favIds.length > 0) {
                        // Fetch cars from DB for UUID favorites
                        const uuidIds = favIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
                        const mockIds = favIds.filter(id => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

                        let dbFavCars: any[] = [];
                        if (uuidIds.length > 0) {
                            const { data: dbCars } = await supabase
                                .from('cars')
                                .select('*')
                                .in('id', uuidIds);
                            if (dbCars) {
                                dbFavCars = dbCars.map((d: any) => ({
                                    ...d,
                                    location: d.market_data?.location || d.location || 'México',
                                    distance: d.mileage || 0,
                                    fuel: d.fuel_type || 'Gasolina',
                                    images: Array.isArray(d.images) ? d.images : [],
                                    condition: d.condition || 'Seminuevo',
                                    category: d.category || 'Car',
                                    marketValue: d.market_data?.marketValue || d.price,
                                }));
                            }
                        }

                        // Fallback to mock data for non-UUID ids
                        const { ALL_CARS } = await import('@/data/cars');
                        const mockFavCars = ALL_CARS.filter(c => mockIds.includes(c.id));

                        setFavoriteCars([...dbFavCars, ...mockFavCars]);
                    } else {
                        setFavoriteCars([]);
                    }
                } catch (favErr) {
                    console.error('Error loading favorites:', favErr);
                    setFavoriteCars([]);
                }
            } catch (err: any) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setIsLoading(false);
                setMounted(true);
            }
        }

        loadDashboard();

        const channel = supabase
            .channel('dashboard-feed')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, () => {
                loadDashboard();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                loadDashboard();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const activeInspections = [
        {
            id: "insp-001",
            car: "Mazda CX-5 2022",
            status: "SCHEDULED",
            date: "Miércoles 29, 11:00 AM",
            inspector: "Carlos Mendoza"
        }
    ];

    if (!mounted) {
        return (
            <div className="flex h-screen flex-col bg-background overflow-hidden p-6 md:p-12">
                <div className="max-w-5xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-12 w-48 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden">
            {/* Navbar */}
            <nav className="border-b border-border bg-background/80 backdrop-blur-md px-6 h-16 shrink-0 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <StarterKarLogo size="xs" showWordmark={false} href="/" />
                        <span className="font-bold text-lg">Mi Garage</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50 text-xs font-bold text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                        <span>CDMX</span>
                    </div>
                    <NotificationCenter />
                    <button 
                        onClick={async () => {
                            try {
                                await supabase.auth.signOut();
                                // Clear demo role cookie
                                document.cookie = "starterkar_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                                window.location.href = '/';
                            } catch (error) {
                                console.error("Logout error:", error);
                                window.location.href = '/';
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                        Cerrar Sesión
                    </button>
                    <Link
                        href="/dashboard/profile"
                        className="h-10 w-10 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 border border-indigo-200 transition-all hover:scale-110 active:scale-95"
                    >
                        {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
                    {/* Service Ribbon (Above the fold) */}
                    <EcosystemHub 
                        userProfile={userProfile}
                        activeInspections={activeInspections}
                        investorApp={investorApp}
                    />

                    <div className="max-w-5xl mx-auto w-full p-6 md:p-12 pt-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 uppercase tracking-tighter">
                            <div className="animate-reveal">
                                <h1 className="text-4xl font-black tracking-tight mb-2 italic uppercase">
                                    {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'}, {userProfile?.full_name?.split(' ')[0] || 'Usuario'} 👋
                                </h1>
                                <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
                                    {transactions.length > 0 || ownedCars.length > 0
                                        ? `${transactions.length + ownedCars.length} operación${transactions.length + ownedCars.length !== 1 ? 'es' : ''} activa${transactions.length + ownedCars.length !== 1 ? 's' : ''}`
                                        : 'Tu garage digital te espera'}
                                </p>
                            </div>
                            
                            {/* Role-gated admin tools — solo admin/inspector */}
                            <div className="w-full md:w-auto flex flex-wrap gap-3">
                                {isAdmin && (
                                    <>
                                        <Link href="/admin/reports/annual" className="h-14 px-6 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                                            <BarChart3 className="h-5 w-5" />
                                            Informe Anual
                                        </Link>
                                        <Link href="/admin" className="h-14 px-6 bg-zinc-900 text-white rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-zinc-800 transition-all border border-zinc-700 shadow-xl shadow-indigo-500/10">
                                            <LayoutDashboard className="h-5 w-5 text-indigo-400" />
                                            Control Maestro
                                        </Link>
                                    </>
                                )}
                                
                                {isInspector && (
                                    <>
                                        <Link href="/admin/inspector" className="h-14 px-6 bg-secondary rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-secondary/80 transition-all">
                                            <Smartphone className="h-5 w-5 text-blue-500" />
                                            Inspector
                                        </Link>
                                        {isAdmin && (
                                            <>
                                                <Link href="/admin/legal" className="h-14 px-6 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                                                    <ShieldCheck className="h-5 w-5" />
                                                    Admin Legal
                                                </Link>
                                                <Link href="/sell?admin=true" className="h-14 px-6 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                                                    <CarFront className="h-5 w-5" />
                                                    Publicar Auto
                                                </Link>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>                        </div>
                        </div>
                    </div>

                    <div className="flex border-b border-border mb-8 gap-1">
                        <button 
                            onClick={() => setActiveTab("buying")}
                            className={cn(
                                "px-5 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 relative",
                                activeTab === "buying" ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            🛒 Comprando
                            {transactions.filter(tx => tx.role === 'buyer' && tx.status !== 'RELEASED').length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] rounded-full font-black">
                                    {transactions.filter(tx => tx.role === 'buyer' && tx.status !== 'RELEASED').length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab("selling")}
                            className={cn(
                                "px-5 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 relative",
                                activeTab === "selling" ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            🏷️ Vendiendo
                            {transactions.filter(tx => tx.role === 'seller' && tx.status !== 'RELEASED').length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] rounded-full font-black">
                                    {transactions.filter(tx => tx.role === 'seller' && tx.status !== 'RELEASED').length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab("completed")}
                            className={cn(
                                "px-5 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 relative",
                                activeTab === "completed" ? "border-zinc-600 text-zinc-900 dark:text-zinc-100" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            ✅ Completadas
                            {transactions.filter(tx => tx.status === 'RELEASED').length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-zinc-500 text-white text-[9px] rounded-full font-black">
                                    {transactions.filter(tx => tx.status === 'RELEASED').length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === "buying" ? (
                        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                            {transactions.filter(tx => tx.role === 'buyer' && tx.status !== 'RELEASED').length > 0 ? (
                                <div className="grid gap-6">
                                    {transactions.filter(tx => tx.role === 'buyer' && tx.status !== 'RELEASED').map((tx, idx) => (
                                        <Link href={`/dashboard/handover/${tx.id}`} key={tx.id} className={cn(
                                            "glass-card rounded-3xl p-6 flex items-center justify-between hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group animate-reveal",
                                            idx === 0 ? "stagger-1" : idx === 1 ? "stagger-2" : "stagger-3"
                                        )}>
                                            <div className="flex items-center gap-6">
                                                <div className="h-24 w-40 bg-secondary rounded-2xl overflow-hidden relative shadow-inner">
                                                    {tx.image ? (
                                                        <Image src={tx.image} alt={tx.carName} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-muted"><Car className="h-10 w-10 text-muted-foreground/20" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl italic tracking-tight">{tx.carName}</h3>
                                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{tx.year} • {tx.location}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border italic",
                                                            tx.status === 'RELEASED' ? "bg-zinc-100 text-zinc-500 border-zinc-200" :
                                                                tx.status === 'FUNDS_HELD' || tx.status === 'IN_VAULT' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                                    "bg-blue-50 text-blue-600 border-blue-100"
                                                        )}>
                                                            {tx.status === 'RELEASED' ? 'Vehículo Entregado' :
                                                                tx.status === 'FUNDS_HELD' ? 'Pago en Bóveda' :
                                                                    tx.status === 'IN_VAULT' ? 'Listo para Entrega' :
                                                                        'Proceso Activo'}
                                                        </div>
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">REF: {tx.id.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-6 w-6 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                /* Pantalla de bienvenida para usuario nuevo */
                                <div className="py-8 space-y-8 animate-in fade-in duration-500">
                                    <div className="text-center space-y-2">
                                        <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">¿Qué quieres hacer hoy?</p>
                                        <h2 className="text-2xl font-black tracking-tight">Elige tu próximo paso</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                        {/* CTA Comprar */}
                                        <Link
                                            href="/buy"
                                            className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.99]"
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                                                <Car className="h-32 w-32" />
                                            </div>
                                            <div className="relative z-10 space-y-4">
                                                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                    <Car className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-1">Inventario Certificado</p>
                                                    <h3 className="text-2xl font-black tracking-tight">Comprar Auto</h3>
                                                    <p className="text-indigo-200 text-sm font-medium mt-2 leading-relaxed">Explora autos con inspección de 150 puntos y pago protegido en bóveda.</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-200 group-hover:text-white transition-colors">
                                                    Ver inventario <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>

                                        {/* CTA Vender */}
                                        <Link
                                            href="/sell"
                                            className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-zinc-950 border border-zinc-800 text-white shadow-2xl hover:border-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.99]"
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                                                <CarFront className="h-32 w-32" />
                                            </div>
                                            <div className="relative z-10 space-y-4">
                                                <div className="h-12 w-12 bg-indigo-600/30 rounded-2xl flex items-center justify-center">
                                                    <CarFront className="h-6 w-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">Proceso Certificado</p>
                                                    <h3 className="text-2xl font-black tracking-tight">Vender mi Auto</h3>
                                                    <p className="text-zinc-400 text-sm font-medium mt-2 leading-relaxed">Publica tu vehículo, agenda inspección y recibe tu pago seguro.</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 group-hover:text-indigo-400 transition-colors">
                                                    Publicar ahora <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* FAVORITES SECTION */}
                            <div className="space-y-6 pt-8 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-indigo-600" />
                                        Mis Favoritos
                                    </h2>
                                    <Link href="/buy" className="text-xs font-bold text-indigo-600 hover:underline">Ver todo el inventario</Link>
                                </div>

                                {favoriteCars.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {favoriteCars.filter(c => c && c.id).map(car => (
                                            <div key={car.id} className="h-[380px]">
                                                <CarCard
                                                    car={car}
                                                    isFavorite={true}
                                                    onToggleFavorite={(e) => handleToggleFavorite(e, car.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 rounded-[2rem] bg-indigo-50/20 border border-dashed border-indigo-200/50">
                                        <p className="text-sm font-medium text-muted-foreground mb-4">Aún no has guardado ningún auto.</p>
                                        <Button asChild variant="outline" className="rounded-xl font-bold">
                                            <Link href="/buy">Explorar Inventario</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <RecommendedSection 
                                favoriteIds={favoriteIds} 
                                onToggleFavorite={handleToggleFavorite}
                            />
                        </div>
                    ) : activeTab === "completed" ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {transactions.filter(tx => tx.status === 'RELEASED').length > 0 ? (
                                <div className="grid gap-4">
                                    {transactions.filter(tx => tx.status === 'RELEASED').map((tx) => (
                                        <div key={tx.id} className="glass-card rounded-3xl p-6 flex items-center justify-between opacity-80 hover:opacity-100 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="h-20 w-32 bg-secondary rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                                                    {tx.image ? (
                                                        <Image src={tx.image} alt={tx.carName} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-muted"><Car className="h-8 w-8 text-muted-foreground/20" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl italic tracking-tight">{tx.carName}</h3>
                                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{tx.year} • {tx.role === 'buyer' ? 'Comprado' : 'Vendido'}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-zinc-100 text-zinc-600 border-zinc-200 italic flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            {tx.role === 'buyer' ? 'Vehículo Recibido' : 'Venta Completada'}
                                                        </div>
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">REF: {tx.id.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-xl text-zinc-900 dark:text-white">${tx.price?.toLocaleString()} MXN</p>
                                                <Link href={`/dashboard/handover/${tx.id}`} className="text-[10px] font-bold text-indigo-600 hover:underline mt-1 block">Ver documentos →</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center rounded-[2rem] bg-zinc-50 border border-dashed border-zinc-200">
                                    <p className="text-sm font-medium text-muted-foreground">Aún no tienes operaciones completadas.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
                            {/* Active Sales Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Ventas en Progreso</h2>
                                    <Link href="/sell" className="text-xs font-bold text-indigo-600 hover:underline">Publicar otro auto</Link>
                                </div>

                                {transactions.filter(tx => tx.role === 'seller' && tx.status !== 'RELEASED').length > 0 ? (
                                    <div className="grid gap-8">
                                        {transactions.filter(tx => tx.role === 'seller' && tx.status !== 'RELEASED').map((tx) => (
                                            <div key={tx.id} className="space-y-4">
                                                {/* Billing Semaphore Integration */}
                                                {(tx.status === 'RELEASED' || tx.status === 'HANDOVER_SCHEDULED') && (
                                                    <BillingSemaphore 
                                                        transactionId={tx.id}
                                                        carName={tx.carName}
                                                        price={tx.price}
                                                        commissionAmount={tx.commissionAmount || (tx.price * 0.035)}
                                                        isPaid={tx.commissionPaid}
                                                        status={tx.status}
                                                    />
                                                )}
                                                
                                                <div className="glass-card rounded-[2rem] p-6 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all">
                                                <div className="flex items-center gap-6 w-full md:w-auto">
                                                    <div className="h-20 w-32 bg-secondary rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                                                        {tx.image ? (
                                                            <Image src={tx.image} alt={tx.carName} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-muted"><Car className="h-8 w-8 text-muted-foreground/20" /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-black text-lg italic tracking-tight truncate">{tx.carName}</h3>
                                                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">SALE</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{tx.year} • Ref: {tx.id.slice(0, 8)}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <div className={cn(
                                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                                                                tx.status === 'FUNDS_HELD' || tx.status === 'IN_VAULT' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                            )}>
                                                                {tx.status === 'FUNDS_HELD' || tx.status === 'IN_VAULT' ? 'Bóveda: Pago Asegurado' : 'Esperando Pago'}
                                                            </div>
                                                            <span className="text-xs font-bold">${tx.price.toLocaleString()} MXN</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                    {(tx.status === 'FUNDS_HELD' || tx.status === 'IN_VAULT') ? (
                                                        <Button asChild className="w-full md:w-auto rounded-xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group">
                                                            <Link href={`/dashboard/handover/${tx.id}`}>
                                                                <Smartphone className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                                                Entregar Vehículo
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button asChild variant="secondary" className="w-full md:w-auto rounded-xl h-12 px-6 font-black active:scale-95">
                                                            <Link href={`/dashboard/handover/${tx.id}`}>
                                                                Ver Detalles
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center rounded-[2.5rem] bg-secondary/20 border border-dashed border-border">
                                        <p className="text-sm font-medium text-muted-foreground">No tienes ventas activas en este momento.</p>
                                    </div>
                                )}
                            </div>

                            {/* My Garage Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Mi Garage</h2>
                                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">
                                        {ownedCars.length} Vehículos Publicados
                                    </span>
                                </div>

                                {ownedCars.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {ownedCars.map((car) => (
                                            <Link
                                                key={car.id}
                                                href={`/dashboard/sell/${car.id}`}
                                                className="glass-card rounded-[2.5rem] p-6 border border-border/50 group hover:border-primary/30 transition-all block"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 rounded-2xl bg-secondary overflow-hidden shrink-0">
                                                        {car.images?.[0] ? (
                                                            <Image src={car.images[0]} alt={car.make} width={64} height={64} className="object-cover h-full w-full" />
                                                        ) : <Car className="h-8 w-8 m-4 text-muted-foreground/20" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-black text-lg italic truncate">{car.make} {car.model}</h3>
                                                            {car.status?.toUpperCase() === 'SOLD' && (
                                                                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                                                                    Vendido
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{car.year} • {car.transmission}</p>
                                                            
                                                            {/* Price Strategy Helper */}
                                                            {car.priceEquation && (
                                                                <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                                                                    <div className="flex justify-between items-center text-[9px] font-bold">
                                                                        <span className="text-muted-foreground uppercase">Libro Negro</span>
                                                                        <span>${car.priceEquation.marketValue.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[9px] font-bold text-amber-600">
                                                                        <span className="uppercase">Reparaciones Detectadas</span>
                                                                        <span>- ${car.priceEquation.deductions.filter((d: any) => d.type === 'mechanical').reduce((acc: number, d: any) => acc + d.amount, 0).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="pt-1 border-t border-indigo-500/10 flex justify-between items-center text-[10px] font-black text-indigo-600">
                                                                        <span className="uppercase italic tracking-tighter">Sugerencia StarterKar</span>
                                                                        <span>${(car.priceEquation.marketValue - car.priceEquation.deductions.filter((d: any) => d.type === 'mechanical').reduce((acc: number, d: any) => acc + d.amount, 0)).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400">
                                                                        <span className="uppercase tracking-widest">Comisión StarterKar</span>
                                                                        <span>3.5% + Inspección</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                                                        Gestionar
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-dashed border-border flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="h-3 w-3 text-indigo-500" />
                                                        IA Negociando Activa
                                                    </div>
                                                    <span className="text-zinc-400 italic">Protegiendo tu inversión</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center rounded-[2.5rem] bg-indigo-50/30 border border-dashed border-indigo-100 dark:bg-zinc-900/30 dark:border-zinc-800">
                                        <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                            <CarFront className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tu garage está vacío</p>
                                        <Button asChild variant="link" className="text-indigo-600 text-xs font-black p-0 mt-2">
                                            <Link href="/sell">Publicar mi primer auto</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function UserSearch(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="10" cy="7" r="4" />
            <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
            <circle cx="17" cy="17" r="3" />
            <path d="m21 21-1.9-1.9" />
        </svg>
    )
}
