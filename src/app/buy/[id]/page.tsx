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
    Camera as CameraIcon,
    CheckCircle2,
    X
} from "lucide-react";
import { FavoriteService } from "@/services/FavoriteService";
import { createBrowserClient } from "@/lib/supabase/client";
import { TechnicalSpecsSheet } from "@/components/market/TechnicalSpecsSheet";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { translateFinding, getSeverityColor } from "@/lib/inspection-utils";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [car, setCar] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
    
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

                const { data: lockData } = await supabaseBrowser
                    .from('car_locks')
                    .select('expires_at, locked_by')
                    .eq('car_id', id)
                    .gt('expires_at', new Date().toISOString())
                    .maybeSingle();

                // It is locked to us if it exists and we are not the owner
                const { data: { user: currentUser } } = await supabaseBrowser.auth.getUser();
                const isLockedStatus = lockData ? lockData.locked_by !== currentUser?.id : false;

                if (data && !error) {
                    const carData: any = data;
                    setCar({
                        ...carData,
                        distance: (carData.mileage || 0) / 1000,
                        fuel: carData.fuel || 'Gasolina',
                        transmission: carData.transmission || 'Automática',
                        is_investor_only: !!(carData.is_investor_only || carData.market_data?.is_investor_only),
                        flashSale: !!(carData.flash_sale || carData.market_data?.flash_sale),
                        isLocked: isLockedStatus
                    } as any);
                } else {
                    const mockCar = ALL_CARS.find(c => c.id === id);
                    if (mockCar) setCar({...mockCar, isLocked: isLockedStatus} as any);
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
                        {/* StarterKar Cinematic Showcase */}
                        <div className="relative w-full -ml-6 pr-6 md:-ml-0 md:pr-0 mb-8 overflow-hidden group">
                            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-6 md:px-0 snap-x snap-mandatory custom-scrollbar hide-scroll-arrows">
                                {car.images && car.images.length > 0 ? (
                                    car.images.map((img, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => { setGalleryIndex(idx); setShowGallery(true); }}
                                            className={cn(
                                                "relative shrink-0 snap-center cursor-pointer transition-all duration-700 ease-out hover:z-10",
                                                idx === 0 ? "w-[85vw] md:w-[45rem] h-[35vh] sm:h-[45vh] md:h-[35rem] rounded-[2.5rem] shadow-2xl" : "w-[65vw] md:w-[25rem] h-[35vh] sm:h-[45vh] md:h-[35rem] rounded-[2rem] opacity-70 hover:opacity-100 shadow-xl"
                                            )}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${car.make} ${car.model} view ${idx + 1}`}
                                                fill
                                                className="object-cover rounded-[inherit] hover:scale-105 transition-transform duration-1000"
                                                priority={idx < 2}
                                            />
                                            {idx === 0 && car.status === 'CERTIFIED' && (
                                                <div className="absolute top-6 left-6 px-5 py-2.5 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 border border-emerald-400/50">
                                                    <ShieldCheck className="h-5 w-5" />
                                                    CERTIFICADO 150 PUNTOS
                                                </div>
                                            )}
                                            {idx === Math.min(car.images.length - 1, 4) && car.images.length > 5 && (
                                                <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm rounded-[inherit] flex flex-col items-center justify-center text-white transition-colors hover:bg-zinc-950/40">
                                                    <Maximize2 className="h-10 w-10 mb-3 animate-pulse" />
                                                    <span className="text-2xl font-black italic tracking-tighter">+{car.images.length - 5}</span>
                                                    <span className="text-xs font-black uppercase tracking-[0.3em] opacity-90">Ver Galería Premium</span>
                                                </div>
                                            )}
                                        </div>
                                    )).slice(0, 5)
                                ) : (
                                    <div className="w-full h-[30rem] rounded-[3rem] bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
                                        <CameraIcon className="h-12 w-12 opacity-50" />
                                    </div>
                                )}
                            </div>
                            
                            {car.images && car.images.length > 1 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-full bg-gradient-to-l from-background to-transparent pointer-events-none hidden md:block" />
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">{car.year} • {car.condition}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">
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

                        <div className="space-y-10" id="checklist">
                            {/* Cédula de Certeza StarterKar */}
                            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
                                <div className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700" />
                                
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                    {/* Score Widget */}
                                    <div className="relative h-40 w-40 shrink-0">
                                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                            <circle className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                                            <circle 
                                                className={cn(
                                                    "transition-all duration-1000 ease-out",
                                                    (car.performance_score || 0) >= 90 ? "text-emerald-500" : (car.performance_score || 0) >= 70 ? "text-amber-500" : "text-red-500"
                                                )}
                                                strokeWidth="6" 
                                                strokeDasharray={2 * Math.PI * 42}
                                                strokeDashoffset={2 * Math.PI * 42 * (1 - (car.performance_score || 85) / 100)}
                                                strokeLinecap="round" 
                                                stroke="currentColor" 
                                                fill="transparent" 
                                                r="42" cx="50" cy="50" 
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black italic tracking-tighter text-white">{(car.performance_score || 85)}</span>
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Score</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-6 w-6 text-indigo-500" />
                                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Cédula de Certeza StarterKar</h3>
                                            </div>
                                            {(car.performance_score || 0) < 100 && (
                                                <div className="px-4 py-1 bg-indigo-600 rounded-full flex items-center gap-2 animate-pulse">
                                                    <Zap className="h-3 w-3 text-white fill-current" />
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Llévalo al 100%</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                                            Este vehículo ha sido auditado bajo nuestro estándar de **150 puntos críticos**. La calificación actual refleja su estado físico real al momento de la inspección.
                                        </p>

                                        {/* Upsell: Llévalo al 100 */}
                                        {(car.performance_score || 0) < 100 && (
                                            <div className="bg-indigo-600/10 border border-indigo-600/30 rounded-2xl p-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Oportunidad de Restauración</h4>
                                                        <p className="text-[10px] text-zinc-300 font-bold italic">Puedes adquirirlo así o solicitar que lo entreguemos "Al 100".</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Presupuesto Estimado</p>
                                                        <p className="text-lg font-black text-white">${(car.reconditioning_budget || (100 - (car.performance_score || 0)) * 500).toLocaleString()} MXN</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => toast.success("Un asesor te contactará para detallar el plan de restauración.")}
                                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                                                >
                                                    <Zap className="h-4 w-4 fill-current" />
                                                    Cotizar Entrega "Al 100" con StarterKar
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Findings Summary (Intelligent Filter) */}
                                        <div className="pt-6 border-t border-zinc-800 space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hoja de Ruta para el 100%</p>
                                            
                                            {car.performance_score === 100 ? (
                                                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-500 uppercase italic">Unidad en Estado Impecable Certificado</span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {/* Filter items with FAIL status to show as 'Areas to Note' */}
                                                    {Object.entries(car.digital_passport_data || {}).filter(([_, status]) => status === 'FAIL').length > 0 ? (
                                                        <div className="space-y-4">
                                                            <p className="text-xs text-zinc-300 font-bold italic">La calificación se ajustó debido a los siguientes hallazgos:</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {Object.entries(car.digital_passport_data || {})
                                                                    .filter(([_, status]) => status === 'FAIL')
                                                                    .map(([itemId, _]) => {
                                                                        const { label, severity } = translateFinding(itemId);
                                                                        const evidenceImg = car.inspection_evidence?.[itemId];
                                                                        
                                                                        return (
                                                                            <div key={itemId} className={cn(
                                                                                "px-4 py-3 rounded-2xl border flex flex-col gap-1 transition-all hover:scale-[1.02] relative group",
                                                                                getSeverityColor(severity)
                                                                            )}>
                                                                                <div className="flex justify-between items-start">
                                                                                    <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{severity}</span>
                                                                                    {evidenceImg && (
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                setGalleryIndex(0);
                                                                                                // Temporary logic to show evidence in gallery
                                                                                                // In a real app, this would open a specific modal or inject into gallery
                                                                                                toast.info("Abriendo evidencia fotográfica...");
                                                                                            }}
                                                                                            className="h-6 px-2 bg-black/10 hover:bg-black/20 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                                                        >
                                                                                            <CameraIcon className="h-3 w-3" />
                                                                                            Ver Evidencia
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-[11px] font-bold leading-tight">• {label}</span>
                                                                            </div>
                                                                        );
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                                                            <Info className="h-5 w-5 text-indigo-500" />
                                                            <span className="text-xs font-bold text-zinc-400">Desgaste natural acorde al año y kilometraje verificado.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-wrap gap-6 justify-center md:justify-start border-t border-zinc-800 pt-8">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Legalidad Validada</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Historial de Propiedad Limpio</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Escaneo Electrónico OK</span>
                                    </div>
                                </div>
                            </div>

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
                            <div className="glass-card border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                                {(car.isLocked || car.status === 'RESERVED') && (
                                    <div className="absolute inset-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                                        <div className="h-20 w-20 bg-amber-500/10 border-2 border-amber-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white mb-3">Activo Apartado</h3>
                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-8">
                                            Este vehículo se encuentra <strong className="text-zinc-900 dark:text-white">temporalmente bloqueado</strong> y en proceso de pago por otro usuario de la red.
                                        </p>
                                        <button 
                                            onClick={() => toast.success("Has sido agregado a la lista de espera prioritaria.")}
                                            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                        >
                                            Únete a la Fila de Espera
                                        </button>
                                    </div>
                                )}

                                {/* Investor Only CTA for non-investors */}
                                {car.is_investor_only && userProfile?.role !== 'admin' && userProfile?.role !== 'investor' && (
                                    <div className="absolute inset-0 z-[40] bg-zinc-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 border-[3px] border-emerald-500/30 rounded-[2.5rem]">
                                        <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] relative">
                                            <Zap className="h-10 w-10 fill-current animate-pulse" />
                                            <div className="absolute -top-2 -right-2 bg-white text-emerald-600 text-[10px] font-black px-2 py-1 rounded-md shadow-lg">PRO</div>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-3 leading-tight">Oportunidad de Inversión</h3>
                                        <p className="text-sm font-bold text-emerald-400 mb-6 uppercase tracking-widest">
                                            Ahorro &gt; 15% vs Mercado
                                        </p>
                                        <p className="text-xs font-medium text-zinc-300 leading-relaxed mb-8">
                                            Este activo es exclusivo para miembros con suscripción <strong className="text-white">Inversionista Elite/Pro</strong>.
                                        </p>
                                        <Link 
                                            href="/investor/apply"
                                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center"
                                        >
                                            CONTRATAR MEMBRESÍA
                                        </Link>
                                        <p className="text-[9px] font-bold text-zinc-500 mt-6 uppercase tracking-[0.2em]">
                                            Desbloquea este y otros 12 activos hoy
                                        </p>
                                    </div>
                                )}
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
                                        floorPrice={car.market_data?.minimum_price || car.price * 0.95}
                                        hasSeal={['CERTIFIED', 'published'].includes(car.status)}
                                        onSuccess={(amount) => {
                                            setNegotiatedPrice(amount);
                                            toast.success(`Precio pactado en $${amount.toLocaleString()} MXN`);
                                            setTimeout(() => {
                                                document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                            }, 300);
                                        }}
                                    />
                                </div>

                                <div id="checkout-section" className="space-y-5 transition-all duration-500">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        Trato Seguro P2P
                                    </h4>
                                    <CheckoutAction 
                                        carId={car.id} 
                                        carPrice={negotiatedPrice || car.price} 
                                        carLocation={car.location} 
                                        category={car.category || 'Car'}
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

            {/* Premium Gallery Modal */}
            {showGallery && car.images && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex flex-col">
                            <h3 className="text-white font-black italic uppercase tracking-tighter">{car.make} {car.model}</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Imagen {galleryIndex + 1} de {car.images.length}</p>
                        </div>
                        <button 
                            onClick={() => setShowGallery(false)}
                            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all group"
                        >
                            <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center p-4">
                        <button 
                            onClick={() => setGalleryIndex(prev => (prev === 0 ? car.images!.length - 1 : prev - 1))}
                            className="absolute left-6 z-10 h-14 w-14 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-indigo-600 transition-all"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image 
                                src={car.images[galleryIndex]} 
                                alt="Gallery View" 
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <button 
                            onClick={() => setGalleryIndex(prev => (prev === car.images!.length - 1 ? 0 : prev + 1))}
                            className="absolute right-6 z-10 h-14 w-14 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-indigo-600 transition-all"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    </div>

                    <div className="p-8 flex justify-center gap-2 overflow-x-auto bg-black/40">
                        {car.images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setGalleryIndex(idx)}
                                className={cn(
                                    "relative h-16 w-24 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                                    galleryIndex === idx ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30" : "border-transparent opacity-40 hover:opacity-100"
                                )}
                            >
                                <Image src={img} alt="Thumbnail" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
