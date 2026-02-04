"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, CreditCard, Clock, CheckCircle2, QrCode, ArrowRight, MapPin, Wrench, Car, Sparkles, Smartphone, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VaultStatus } from "@/components/dashboard/VaultStatus";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { UnifiedVehicleStatusView } from "@/components/dashboard/UnifiedVehicleStatusView";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ActiveOperationView } from "@/components/dashboard/ActiveOperationView";
import { ClinkarEvolutionHub } from "@/components/dashboard/ClinkarEvolutionHub";
import { SidebarPromo } from "@/components/dashboard/SidebarPromo";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedSection } from "@/components/dashboard/RecommendedSection";
import Image from "next/image";
import { FavoriteService } from "@/services/FavoriteService";
import { CarCard } from "@/components/market/CarCard";
import { ALL_CARS } from "@/data/cars";
import { CarService } from "@/services/CarService";

import { createBrowserClient } from "@/lib/supabase/client";

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [ownedCars, setOwnedCars] = useState<any[]>([]);
    const [favoriteCars, setFavoriteCars] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"buying" | "selling">("buying");

    const supabase = createBrowserClient();

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
                description: "Tu correo ha sido confirmado exitosamente. Bienvenido a Clinkar.",
                duration: 5000,
            });

            // Clean URL
            router.replace("/dashboard");
        }
    }, [searchParams, router]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const demoRole = document.cookie.split('; ').find(row => row.startsWith('clinkar_role='))?.split('=')[1];

                if (!user && !demoRole) {
                    window.location.href = "/login";
                    return;
                }

                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    if (profile) setUserProfile(profile);
                }

                if (!user) {
                    setIsLoading(false);
                    setMounted(true);
                    return;
                }

                const { data: txs, error } = await supabase
                    .from("transactions")
                    .select("*, cars(make, model, year, images)")
                    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                if (txs) {
                    const mappedTxs = txs.map(tx => ({
                        id: tx.id,
                        carName: `${tx.cars.make} ${tx.cars.model}`,
                        year: tx.cars.year,
                        price: tx.car_price,
                        status: tx.status,
                        role: tx.seller_id === user.id ? "seller" : "buyer",
                        location: "CDMX",
                        image: tx.cars.images?.[0] || ""
                    }));

                    if (mappedTxs.length > 0 && !selectedId) {
                        setSelectedId(mappedTxs[0].id);
                    }
                    setTransactions(mappedTxs);
                }

                // Fetch published cars that are NOT sold and not in an active transaction
                if (user) {
                    const { data: cars, error: carsError } = await supabase
                        .from("cars")
                        .select("*")
                        .eq("seller_id", user.id)
                        .eq("status", "available");

                    if (carsError) throw carsError;
                    if (cars) setOwnedCars(cars);

                    // Fetch Favorites
                    const favIds = await FavoriteService.getFavorites(supabase);
                    if (favIds.length > 0) {
                        // Ideally we have a bulk fetch in CarService, for now we map parallel
                        // Or better: filter local ALL_CARS for mock and simple fetch for DB.
                        // Let's support hybrid:
                        const dbCars = await Promise.all(favIds.map(id => CarService.getCarById(supabase, id)));
                        const validDbCars = dbCars.filter(c => c !== null);

                        // If any ID was not found in DB, check ALL_CARS (Mock)
                        const mockFavs = favIds
                            .filter(id => !validDbCars.find(c => c.id === id))
                            .map(id => ALL_CARS.find(c => c.id === id))
                            .filter(c => c !== undefined);

                        setFavoriteCars([...validDbCars, ...mockFavs]);
                    }
                }
            } catch (err) {
                console.error("Error loading dashboard:", err);
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
                    <Link href="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowRight className="h-5 w-5 rotate-180" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-lg">Mi Clinkar</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50 text-xs font-bold text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                        <span>CDMX</span>
                    </div>
                    <NotificationCenter />
                    <Link
                        href="/dashboard/profile"
                        className="h-10 w-10 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 border border-indigo-200 transition-all hover:scale-110 active:scale-95"
                    >
                        {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                    </Link>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-12">
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 uppercase tracking-tighter">
                            <div className="animate-reveal">
                                <h1 className="text-4xl font-black tracking-tight mb-2">
                                    {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'}, {userProfile?.full_name?.split(' ')[0] || 'Usuario'} 👋
                                </h1>
                                <p className="text-muted-foreground font-medium">Gestiona tu garage digital y explora nuevas oportunidades.</p>
                            </div>

                            <div className="w-full md:w-auto flex flex-wrap gap-3">
                                <ClinkarEvolutionHub />
                                <Link href="/admin/inspector" className="h-14 px-6 bg-secondary rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-secondary/80 transition-all">
                                    <Smartphone className="h-5 w-5 text-blue-500" />
                                    Inspector
                                </Link>
                                <Link href="/admin/legal" className="h-14 px-6 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                                    <Shield className="h-5 w-5" />
                                    Admin Legal
                                </Link>
                            </div>

                            {/* Role Switcher */}
                            <button
                                onClick={() => setActiveTab("selling")}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 active:scale-95",
                                    activeTab === "selling" ? "bg-white dark:bg-zinc-800 shadow-xl text-indigo-600" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <CreditCard className="h-4 w-4" /> Vender
                            </button>
                        </div>
                    </div>

                    {activeTab === "buying" ? (
                        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                            {transactions.filter(tx => tx.role === 'buyer').length > 0 ? (
                                <div className="grid gap-6">
                                    {transactions.filter(tx => tx.role === 'buyer').map((tx, idx) => (
                                        <Link href={`/transaction/${tx.id}`} key={tx.id} className={cn(
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
                                <div className="relative group overflow-hidden text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 transition-all hover:border-indigo-500/30">
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10 px-6">
                                        <div className="h-20 w-20 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl shadow-indigo-500/10 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                            <Car className="h-10 w-10 text-indigo-600" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 tracking-tight italic uppercase">Tu Garage Está Listo</h3>
                                        <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                                            Aún no tienes transacciones activas. Explora el inventario certificado y comienza tu compra segura.
                                        </p>
                                        <Button asChild size="lg" className="rounded-2xl h-14 px-10 bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                                            <Link href="/buy">
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Explorar Inventario
                                            </Link>
                                        </Button>
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
                                        {favoriteCars.map(car => (
                                            <div key={car.id} className="h-[380px]">
                                                <CarCard
                                                    car={car}
                                                    isFavorite={true}
                                                    onToggleFavorite={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // Optimistic remove
                                                        setFavoriteCars(prev => prev.filter(c => c.id !== car.id));
                                                        await FavoriteService.toggleFavorite(supabase, car.id);
                                                    }}
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

                            <RecommendedSection />
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
                            {/* Active Sales Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Ventas en Progreso</h2>
                                    <Link href="/sell" className="text-xs font-bold text-indigo-600 hover:underline">Publicar otro auto</Link>
                                </div>

                                {transactions.filter(tx => tx.role === 'seller').length > 0 ? (
                                    <div className="grid gap-4">
                                        {transactions.filter(tx => tx.role === 'seller').map((tx) => (
                                            <div key={tx.id} className="glass-card rounded-[2rem] p-6 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all">
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
                                                            <Link href={`/transaction/${tx.id}`}>
                                                                Ver Detalles
                                                            </Link>
                                                        </Button>
                                                    )}
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
                                                        <h3 className="font-black text-lg italic truncate">{car.make} {car.model}</h3>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{car.year} • {car.transmission}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                                                        Gestionar
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center rounded-[2.5rem] bg-indigo-50/30 border border-dashed border-indigo-100 dark:bg-zinc-900/30 dark:border-zinc-800">
                                        <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tu garage está vacío</p>
                                        <Button asChild variant="link" className="text-indigo-600 text-xs font-black p-0 mt-2">
                                            <Link href="/sell">Publicar mi primer auto</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Action Card */}
                                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/30 animate-reveal stagger-1 flex flex-col justify-between min-h-[320px]">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
                                        <QrCode className="h-48 w-48" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-black mb-3 tracking-tighter italic uppercase">Gestión de Ventas</h3>
                                        <p className="text-indigo-100/80 mb-8 font-bold text-sm leading-snug">
                                            Revisa el estado de tus publicaciones, carga de documentos y depósitos en Bóveda.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 relative z-10 w-full">
                                        <Button asChild variant="secondary" className="w-full rounded-2xl h-14 font-black text-indigo-700 bg-white hover:bg-neutral-50 shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                                            <Link href="/dashboard/sell">
                                                Mi Bóveda de Venta <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                        <Link href="/sell" className="text-center text-[10px] font-bold text-indigo-300 hover:text-white uppercase tracking-widest transition-colors py-2">
                                            Vender otro vehículo
                                        </Link>
                                    </div>
                                </div>

                                {/* Active Inspection Card */}
                                {activeInspections.length > 0 ? activeInspections.map(insp => (
                                    <div key={insp.id} className="bg-card border border-border rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-sm">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl shadow-inner">
                                                <Wrench className="h-6 w-6" />
                                            </div>
                                            <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/40">
                                                Agendada
                                            </div>
                                        </div>
                                        <h3 className="font-black text-2xl mb-1 tracking-tight italic">{insp.car}</h3>
                                        <p className="text-xs text-muted-foreground mb-6 font-bold uppercase tracking-tight">Reporte Técnico Clinkar</p>

                                        <div className="space-y-5 pt-6 border-t border-dashed border-border group-hover:border-indigo-500/20 transition-colors">
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-indigo-600/50" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Cita Programada</p>
                                                    <p className="font-black text-base text-zinc-800 dark:text-zinc-200">{insp.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                                                    <UserSearch className="h-5 w-5 text-indigo-600/50" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Mecánico Asignado</p>
                                                    <p className="font-black text-base text-zinc-800 dark:text-zinc-200">{insp.inspector}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : null}

                                {/* Trade-in Promo Card */}
                                <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl animate-reveal stagger-3 flex flex-col justify-between min-h-[320px]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -translate-y-12 translate-x-12" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 text-indigo-400 mb-6">
                                            <Sparkles className="h-5 w-5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upgrade Clinkar</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 tracking-tighter italic uppercase">¿Buscas algo nuevo?</h3>
                                        <p className="text-zinc-500 text-sm mb-8 font-medium leading-relaxed">
                                            Vende tu usado al precio real de mercado y úsalo para estrenar un <span className="text-white font-bold">BMW, Tesla o Toyota</span> con beneficios de nuestras agencias aliadas.
                                        </p>
                                    </div>
                                    <Button asChild className="relative z-10 w-full rounded-2xl h-14 bg-white text-zinc-950 font-black hover:bg-zinc-200 transition-all shadow-xl">
                                        <Link href="/new-cars">
                                            Explorar Autos Nuevos <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
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
