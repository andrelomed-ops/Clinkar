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
    ChevronRight,
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
    Share2,
    Maximize2,
    Camera as CameraIcon
} from "lucide-react";
import { FavoriteService } from "@/services/FavoriteService";
import { createBrowserClient } from "@/lib/supabase/client";
import { TechnicalSpecsSheet } from "@/components/market/TechnicalSpecsSheet";

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
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    
    const supabaseBrowser = useMemo(() => createBrowserClient(), []);

    useEffect(() => {
        async function fetchCar() {
            setLoading(true);
            try {
                const { data: { user } } = await supabaseBrowser.auth.getUser();
                if (user) {
                    const { data: profile } = await supabaseBrowser
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (profile) setUserProfile(profile);

                    const favs = await FavoriteService.getFavorites(supabaseBrowser);
                    setIsFavorite(favs.includes(id));
                }

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
    }, [id, supabaseBrowser]);

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
                    <div className="lg:col-span-7 space-y-8">
                        <div className="grid grid-cols-4 gap-4 aspect-[16/10]">
                            <div className="col-span-3 row-span-2 relative rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-border/50 shadow-2xl group cursor-pointer">
                                {car.images?.[0] ? (
                                    <Image
                                        src={car.images[0]}
                                        alt={`${car.make} ${car.model}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        priority
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                                        Sin Imagen Disponible
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                                    {car.status === 'CERTIFIED' && (
                                        <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            CERTIFICADO 150 PUNTOS
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="relative rounded-[1.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-border/50 group cursor-pointer">
                                {car.images?.[1] ? (
                                    <Image src={car.images[1]} alt="Interior" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-zinc-900"><CameraIcon className="h-6 w-6" /></div>
                                )}
                            </div>
                            
                            <div className="relative rounded-[1.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-border/50 group cursor-pointer">
                                {car.images && car.images.length > 2 ? (
                                    <>
                                        <Image src={car.images[2]} alt="Detalle" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        {car.images.length > 3 && (
                                            <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-md flex flex-col items-center justify-center text-white group-hover:bg-zinc-900/50 transition-all duration-300">
                                                <Maximize2 className="h-8 w-8 mb-2 animate-pulse" />
                                                <span className="text-base font-black tracking-tighter">+{car.images.length - 3}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Fotografías</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-zinc-900 flex-col gap-2">
                                        <div className="p-3 bg-zinc-800 rounded-full">
                                            <Maximize2 className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ver más</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">{car.year} • {car.condition}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">
                                {car.make} {car.model}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                        {car.category === 'Marine' || car.category === 'Air' || car.category === 'Heavy' ? 'Uso Acumulado' : 'Recorrido'}
                                    </span>
                                    <div className="flex items-center gap-2 font-black text-lg">
                                        <Gauge className="h-4 w-4 text-primary" />
                                        {car.distance.toLocaleString()} {car.category === 'Marine' || car.category === 'Air' || car.category === 'Heavy' ? 'h' : 'km'}
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

                        <div className="space-y-4" id="checklist">
                            <h3 className="text-xl font-bold">Resumen de Inspección</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Este activo ha sido auditado por la Mesa de Control de StarterKar. Se verificó la autenticidad de la documentación, historial de propiedad y se realizó un escaneo técnico adaptado a su categoría.
                            </p>

                            <div className="pt-8 border-t border-border/50">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Ficha Técnica</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent ml-8" />
                                </div>
                                <TechnicalSpecsSheet 
                                    specs={(car as any).market_data?.technical_specs} 
                                    category={(car as any).category}
                                />
                            </div>
                        </div>
                    </div>

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
                                </header>

                                <div className="pt-6 border-t border-border/50">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        Negociación Directa
                                    </h4>
                                    <OfferModal 
                                        id={car.id}
                                        carPrice={car.price}
                                        carName={`${car.make} ${car.model}`}
                                        repairCost={0}
                                        hasSeal={['CERTIFIED', 'published'].includes(car.status)}
                                    />
                                </div>

                                <div className="space-y-5">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        Trato Seguro P2P
                                    </h4>
                                    <CheckoutAction 
                                        carId={car.id} 
                                        carPrice={car.price} 
                                        carLocation={car.location} 
                                    />
                                </div>

                                <div className="p-8 bg-zinc-900 dark:bg-zinc-800 rounded-[2rem] border border-zinc-800 shadow-xl group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Garantía StarterKar</h4>
                                            <p className="text-[10px] text-zinc-500 font-bold">Protección Total 90 días</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowWarrantyModal(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                    >
                                        Ver Póliza de Cobertura <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>

                                <footer className="pt-6 flex items-start gap-4 text-[10px] text-zinc-500 font-bold italic leading-tight">
                                    <Info className="h-5 w-5 text-zinc-400 shrink-0" />
                                    <p>Tu dinero está protegido en la Bóveda P2P de StarterKar hasta la entrega física y conformidad del activo.</p>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showWarrantyModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-background border border-zinc-800 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <div className="h-48 bg-gradient-to-br from-indigo-600 to-violet-700 relative flex items-center justify-center overflow-hidden">
                            <ShieldCheck className="h-24 w-24 text-white/20 absolute -right-4 -bottom-4" />
                            <div className="text-center text-white z-10">
                                <ShieldCheck className="h-12 w-12 mx-auto mb-3" />
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Póliza de Cobertura StarterKar</h2>
                                <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Protección Total 90 Días</p>
                            </div>
                        </div>

                        <div className="p-8 border-t border-border bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
                            <button 
                                onClick={() => setShowWarrantyModal(false)}
                                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                ENTENDIDO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
