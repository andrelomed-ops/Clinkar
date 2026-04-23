"use client";

import React, { use, useEffect, useState, useMemo } from "react";
import { ALL_CARS, Vehicle } from "@/data/cars";
import { Navbar } from "@/components/ui/navbar";
import { CheckoutAction } from "@/components/checkout/CheckoutAction";
import { OfferModal } from "@/components/market/OfferModal";
import { CreditSimulator } from "@/components/checkout/CreditSimulator";
import { supabase } from "@/lib/supabase";
import { 
    ChevronLeft, 
    Heart, 
    MapPin, 
    Gauge, 
    Fuel, 
    Zap, 
    Calendar, 
    ShieldCheck, 
    CarFront,
    Activity,
    Info,
    LayoutDashboard,
    Share2
} from "lucide-react";
import { FavoriteService } from "@/services/FavoriteService";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [car, setCar] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    
    // Explicitly use React.useMemo to avoid any scope issues
    const supabaseBrowser = React.useMemo(() => createBrowserClient(), []);

    useEffect(() => {
        async function fetchCar() {
            setLoading(true);
            try {
                // Fetch User Profile for role-gated content
                const { data: { user } } = await supabaseBrowser.auth.getUser();
                if (user) {
                    const { data: profile } = await supabaseBrowser
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (profile) setUserProfile(profile);

                    // Fetch Favorite status
                    const favs = await FavoriteService.getFavorites(supabaseBrowser);
                    setIsFavorite(favs.includes(id));
                }

                // 1. Try Supabase
                const { data, error } = await supabaseBrowser
                    .from('cars')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data && !error) {
                    const carData: any = data;
                    setCar({
                        ...carData,
                        distance: (carData.mileage || 0) / 1000,
                        fuel: carData.fuel || 'Gasolina',
                        transmission: carData.transmission || 'Automática',
                    } as any);
                } else {

                    // 2. Fallback to Mock
                    const mockCar = ALL_CARS.find(c => c.id === id);
                    if (mockCar) setCar(mockCar);
                }
            } catch (e) {
                const mockCar = ALL_CARS.find(c => c.id === id);
                if (mockCar) setCar(mockCar);
            } finally {
                setLoading(false);
            }
        }
        fetchCar();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 font-bold animate-pulse">Sincronizando activo...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <Info className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-black mb-4 tracking-tight">Vehículo no Encontrado</h1>
                <p className="text-muted-foreground mb-8 max-w-sm">Este activo podría haber sido vendido o retirado de la plataforma.</p>
                <Link href="/buy" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-all shadow-lg">
                    Volver al Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="market" />

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-end items-center mb-8">
                    <div className="flex gap-2">
                        <button 
                            onClick={async () => {
                                const shareData = {
                                    title: `${car.make} ${car.model} ${car.year}`,
                                    text: `Mira este ${car.make} en StarterKar | Bóveda Digital Segura`,
                                    url: window.location.href
                                };
                                if (navigator.share) {
                                    try { await navigator.share(shareData); } catch (e) {}
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Enlace copiado al portapapeles");
                                }
                            }}
                            className="p-2.5 rounded-full border border-border bg-background hover:bg-secondary transition-colors"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={async () => {
                                const newStatus = !isFavorite;
                                setIsFavorite(newStatus);
                                try {
                                    await FavoriteService.toggleFavorite(supabaseBrowser, id);
                                    toast.success(newStatus ? "Agregado a favoritos" : "Eliminado de favoritos");
                                } catch (err) {
                                    setIsFavorite(!newStatus);
                                    toast.error("Error al actualizar favoritos");
                                }
                            }}
                            className={cn(
                                "p-2.5 rounded-full border border-border bg-background transition-all",
                                isFavorite ? "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200" : "hover:bg-secondary"
                            )}
                        >
                            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Visuals & Tech Info (8/12) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Hero Image */}
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-border/50 shadow-2xl">
                            {car.images?.[0] ? (
                                <Image
                                    src={car.images[0]}
                                    alt={`${car.make} ${car.model}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                                    Sin Imagen Disponible
                                </div>
                            )}
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                                {car.status === 'CERTIFIED' && (
                                    <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        CERTIFICADO 150 PUNTOS
                                    </div>
                                )}
                                {car.flashSale && (
                                    <div className="px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-full shadow-lg shadow-amber-500/30 animate-pulse">
                                        ⚡ FLASH SALE
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title & Key Stats */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">{car.year} • {car.condition}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">
                                {car.make} {car.model}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Recorrido</span>
                                    <div className="flex items-center gap-2 font-black text-lg">
                                        <Gauge className="h-4 w-4 text-primary" />
                                        {car.distance.toLocaleString()} km
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Transmisión</span>
                                    <div className="flex items-center gap-2 font-black text-lg">
                                        <Activity className="h-4 w-4 text-primary" />
                                        {car.transmission}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Combustible</span>
                                    <div className="flex items-center gap-2 font-black text-lg">
                                        <Fuel className="h-4 w-4 text-primary" />
                                        {car.fuel}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Ubicación</span>
                                    <div className="flex items-center gap-2 font-black text-lg text-emerald-600 dark:text-emerald-400">
                                        <MapPin className="h-4 w-4" />
                                        {car.location}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description & AI Advisor Integration */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Resumen de Inspección</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Este vehículo ha sido auditado por la Mesa de Control de StarterKar. Se verificó la autenticidad de la factura nacional, el historial de tenencias sin adeudos y se realizó un escaneo computarizado de 150 puntos críticos.
                            </p>

                            {/* Transparency Window */}
                            {car.priceEquation && (
                                <div className="bg-secondary/30 border border-border rounded-3xl p-6 space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500">Transparencia de Precio</h4>
                                    <div className="grid gap-4">
                                        <div className="flex justify-between items-center bg-background/50 p-4 rounded-2xl border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                                    <Info className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-bold">Valor Libro Negro</span>
                                            </div>
                                            <span className="font-black">${car.priceEquation.marketValue.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between items-center bg-background/50 p-4 rounded-2xl border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                                    <Activity className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <span className="text-sm font-bold">Inversión Mecánica Sugerida</span>
                                            </div>
                                            <span className="font-black text-amber-600">
                                                - ${car.priceEquation.deductions.filter((d: any) => d.type === 'mechanical').reduce((acc: number, d: any) => acc + d.amount, 0).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                            <span className="text-sm font-black text-primary uppercase italic">Precio StarterKar</span>
                                            <span className="text-xl font-black text-primary">${car.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-medium text-muted-foreground italic leading-tight px-2">
                                        * El precio ya ha sido ajustado considerando las mejoras preventivas y estéticas necesarias para garantizar tu seguridad y el valor de reventa futuro.
                                    </p>
                                </div>
                            )}
                            
                                     {/* Embedded Services & Options */}
                                    <div className="pt-8 space-y-12">
                                        {/* 1. Negociación y Oferta */}
                                        <div className="w-full">
                                            <OfferModal 
                                                id={car.id}
                                                carPrice={car.price}
                                                carName={`${car.make} ${car.model}`}
                                                repairCost={car.priceEquation?.deductions?.filter((d: any) => d.type === 'mechanical').reduce((a: number, c: any) => a + c.amount, 0) || 0}
                                                hasSeal={car.status === 'CERTIFIED'}
                                            />
                                        </div>

                                        {/* 2. Financiamiento StarterKar */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Financiamiento</h3>
                                            <CreditSimulator 
                                                carPrice={car.price} 
                                                carName={`${car.make} ${car.model}`}
                                                carId={car.id}
                                            />
                                        </div>

                                        {/* 3. Garantía y Reparación */}
                                        <div className="bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/30 rounded-[2.5rem] p-10 shadow-xl shadow-indigo-500/5">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                                                    <ShieldCheck className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black">Garantía Certificada StarterKar</h3>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Protección Mecánica P2P</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                                                <p>
                                                    La **Garantía Mecánica de 90 días** de StarterKar es un beneficio exclusivo para las unidades que pasan por una reparación integral preventiva.
                                                </p>
                                                <p className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-900/20 text-amber-800 dark:text-amber-400 font-medium italic">
                                                    Nota: Para que la garantía tenga validez absoluta, el vehículo debe ser reparado en un Taller Aliado antes de la entrega física. Esto asegura que tu nuevo auto salga en condiciones óptimas y certificadas.
                                                </p>
                                            </div>
                                            <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
                                                <Link 
                                                    href={`/dashboard/repair-request?carId=${car.id}`}
                                                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm hover:underline"
                                                >
                                                    Explorar Reporte Técnico y Solicitar Presupuesto →
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout & Transactional (5/12) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="glass-card border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
                                <header className="flex justify-between items-baseline mb-2">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Precio Final Garantizado</span>
                                        <div className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                            ${car.price.toLocaleString()}
                                        </div>
                                    </div>
                                    {car.marketValue && (
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs font-black">
                                            AHORRAS ${(car.marketValue - car.price).toLocaleString()}
                                        </div>
                                    )}
                                </header>

                                {/* The hard-coded transaction logic component */}
                                <CheckoutAction 
                                    carId={car.id} 
                                    carPrice={car.price} 
                                    carLocation={car.location} 
                                />

                                <footer className="pt-6 border-t border-border flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                                    Tu dinero está protegido bajo los términos de la Bóveda P2P de StarterKar. No se libera hasta la entrega física.
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
