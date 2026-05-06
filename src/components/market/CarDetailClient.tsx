
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ALL_CARS, Vehicle } from "@/data/cars";
import { Navbar } from "@/components/ui/navbar";
import { CheckoutAction } from "@/components/checkout/CheckoutAction";
import { OfferModal } from "@/components/market/OfferModal";
import { CreditSimulator } from "@/components/checkout/CreditSimulator";
import { CreditBrokerModule } from "@/components/market/CreditBrokerModule";
import { 
    ArrowLeft,
    ChevronLeft, 
    ChevronRight,
    Heart, 
    MapPin, 
    Gauge, 
    Fuel, 
    Zap, 
    Calendar, 
    ShieldCheck, 
    Activity,
    Info,
    Share2,
    Maximize2,
    Camera as CameraIcon,
    CheckCircle2,
    X
} from "lucide-react";
import { FavoriteService } from "@/services/FavoriteService";
import { createBrowserClient } from "@/lib/supabase/client";
import { TechnicalSpecsSheet } from "@/components/market/TechnicalSpecsSheet";
import { RecommendedSection } from "@/components/dashboard/RecommendedSection";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { translateFinding, getSeverityColor } from "@/lib/inspection-utils";

export function CarDetailClient({ 
    id, 
    initialCar, 
    initialProfile, 
    initialIsFavorite 
}: { 
    id: string, 
    initialCar: any, 
    initialProfile?: any, 
    initialIsFavorite?: boolean 
}) {
    const [car, setCar] = useState<Vehicle | null>(initialCar || null);
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
    const [userProfile, setUserProfile] = useState<any>(initialProfile || null);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
    
    const supabaseBrowser = useMemo(() => createBrowserClient(), []);

    // Handle authentication state changes to sync profile/favorites if user logs in/out
    useEffect(() => {
        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                const { data: { user } } = await supabaseBrowser.auth.getUser();
                if (user) {
                    const { data: profile } = await supabaseBrowser.from('profiles').select('*').eq('id', user.id).single();
                    setUserProfile(profile);
                    const favs = await FavoriteService.getFavorites(supabaseBrowser);
                    setIsFavorite(favs.includes(id));
                } else {
                    setUserProfile(null);
                    setIsFavorite(false);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [id, supabaseBrowser]);

    // Keyboard navigation for Premium Gallery
    useEffect(() => {
        if (!showGallery || !car?.images) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowGallery(false);
            if (e.key === 'ArrowRight') {
                setGalleryIndex(prev => (prev === car.images!.length - 1 ? 0 : prev + 1));
            }
            if (e.key === 'ArrowLeft') {
                setGalleryIndex(prev => (prev === 0 ? car.images!.length - 1 : prev - 1));
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showGallery, car?.images]);

    if (loading && !car) {
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
        <div className="min-h-screen bg-background relative w-full min-w-0" style={{ overflowX: 'clip' }}>
            <Navbar variant="market" />

            <div className="pt-24 pb-20 px-4 sm:px-6 w-full max-w-7xl mx-auto block relative min-w-0">
                <div className="flex justify-between items-center mb-8">
                    <Link 
                        href="/buy" 
                        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-secondary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Volver al Inventario</span>
                    </Link>

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

                <div className="grid lg:grid-cols-12 gap-4 lg:gap-12 min-w-0">
                    <div className="lg:col-span-7 space-y-8 min-w-0 overflow-hidden">
                        {/* StarterKar Cinematic Showcase */}
                        <div className="relative w-full mb-8 group overflow-hidden">
                            {/* Desktop 3-Photo Grid */}
                            {car.images && car.images.length > 0 && (
                                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[35rem] rounded-[2.5rem] overflow-hidden">
                                    <div 
                                        className="col-span-3 row-span-2 relative cursor-pointer group/main"
                                        onClick={() => { setGalleryIndex(0); setShowGallery(true); }}
                                    >
                                        <Image src={car.images[0]} fill className="object-cover group-hover/main:scale-105 transition-transform duration-700" alt="Vista principal" priority />
                                        {car.status === 'CERTIFIED' && (
                                            <div className="absolute top-6 left-6 px-5 py-2.5 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 border border-emerald-400/50">
                                                <ShieldCheck className="h-5 w-5" />
                                                CERTIFICADO 150 PUNTOS
                                            </div>
                                        )}
                                    </div>
                                    {car.images.length > 1 && (
                                        <div 
                                            className="col-span-1 row-span-1 relative cursor-pointer group/side1"
                                            onClick={() => { setGalleryIndex(1); setShowGallery(true); }}
                                        >
                                            <Image src={car.images[1]} fill className="object-cover group-hover/side1:scale-105 transition-transform duration-700" alt="Vista frontal/lateral" />
                                        </div>
                                    )}
                                    {car.images.length > 2 && (
                                        <div 
                                            className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden group/side2"
                                            onClick={() => { setGalleryIndex(2); setShowGallery(true); }}
                                        >
                                            <Image src={car.images[2]} fill className="object-cover group-hover/side2:scale-105 transition-transform duration-700" alt="Vista trasera/interior" />
                                            {car.images.length > 3 && (
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm hover:bg-black/40 transition-colors">
                                                    <span className="text-white font-black text-2xl tracking-widest">+{car.images.length - 3}</span>
                                                    <span className="text-white/80 font-black text-[10px] uppercase tracking-widest mt-1">Fotos</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mobile Horizontal Scroll */}
                            <div className="md:hidden w-full overflow-hidden min-w-0">
                            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                                {car.images?.map((img, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => { setGalleryIndex(idx); setShowGallery(true); }}
                                        className="w-[85%] flex-shrink-0 snap-center cursor-pointer transition-all h-[35vh] rounded-[2rem] overflow-hidden shadow-xl"
                                    >
                                        <Image src={img} fill className="object-cover" alt={`Vista ${idx + 1}`} priority={idx === 0} />
                                        {idx === 0 && car.status === 'CERTIFIED' && (
                                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 border border-emerald-400/50">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                CERTIFICADO
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            </div>
                            
                            {/* Mobile Image Count Pill */}
                            {car.images && car.images.length > 1 && (
                                <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                                    <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                                        <CameraIcon className="h-4 w-4 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{car.images.length} FOTOS</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowGallery(true)}
                                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                                    >
                                        Ver Todo
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">{car.year} • {car.condition}</span>
                            </div>
                            
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 break-words leading-[1.1]">
                                {car.make} {car.model}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1 min-w-0 break-words">
                                        {car.category === 'Marine' || car.category === 'Air' || car.category === 'Heavy' ? 'Uso Acumulado' : 'Recorrido'}
                                    </span>
                                    <div className="flex items-center gap-2 font-black text-sm sm:text-lg min-w-0 break-words">
                                        <Gauge className="h-4 w-4 text-primary shrink-0" />
                                        <span className="min-w-0 break-words">{(car.distance || 0).toLocaleString()} {car.category === 'Marine' || car.category === 'Air' || car.category === 'Heavy' ? 'h' : 'km'}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1 min-w-0 break-words">Transmisión</span>
                                    <div className="flex items-center gap-2 font-black text-sm sm:text-lg min-w-0 break-words">
                                        <Activity className="h-4 w-4 text-primary shrink-0" />
                                        <span className="min-w-0 break-words">{car.transmission}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1 min-w-0 break-words">Combustible</span>
                                    <div className="flex items-center gap-2 font-black text-sm sm:text-lg min-w-0 break-words">
                                        <Fuel className="h-4 w-4 text-primary shrink-0" />
                                        <span className="min-w-0 break-words">{car.fuel}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1 min-w-0 break-words">Ubicación</span>
                                    <div className="flex items-center gap-2 font-black text-sm sm:text-lg text-emerald-600 dark:text-emerald-400 min-w-0 break-words">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span className="min-w-0 break-words">{car.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10" id="checklist">
                            {/* Cédula de Certeza StarterKar */}
                            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 relative overflow-hidden group shadow-xl">
                                <div className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-600/5 blur-[100px] rounded-full group-hover:bg-indigo-600/10 transition-all duration-700" />
                                
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                    {/* Score Widget */}
                                    <div className="relative h-40 w-40 shrink-0">
                                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                            <circle className="text-zinc-200 dark:text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                                            <circle 
                                                className={cn(
                                                    "transition-all duration-1000 ease-out",
                                                    (car.performance_score ?? 0) >= 90 ? "text-emerald-500" : (car.performance_score ?? 0) >= 70 ? "text-amber-500" : "text-red-500"
                                                )}
                                                strokeWidth="6" 
                                                strokeDasharray={2 * Math.PI * 42}
                                                strokeDashoffset={2 * Math.PI * 42 * (1 - (car.performance_score ?? 85) / 100)}
                                                strokeLinecap="round" 
                                                stroke="currentColor" 
                                                fill="transparent" 
                                                r="42" cx="50" cy="50" 
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white">{(car.performance_score ?? 85)}</span>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Score</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-6 w-6 text-indigo-500 shrink-0" />
                                                <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white break-words">Cédula de Certeza StarterKar</h3>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            Este vehículo ha sido auditado bajo nuestro estándar de **150 puntos críticos**. La calificación actual refleja su estado físico real al momento de la inspección.
                                        </p>
                                        
                                        {/* Findings Summary (Intelligent Filter) */}
                                        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hoja de Ruta para el 100%</p>
                                            
                                            {car.performance_score === 100 ? (
                                                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-500 uppercase italic">Unidad en Estado Impecable Certificado</span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {Object.entries(car.digital_passport_data || {}).filter(([_, status]) => status === 'FAIL').length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {Object.entries(car.digital_passport_data || {})
                                                                    .filter(([_, status]) => status === 'FAIL')
                                                                    .map(([itemId, _]) => {
                                                                        const { label, severity } = translateFinding(itemId);
                                                                        
                                                                        return (
                                                                            <div key={itemId} className={cn(
                                                                                "px-4 py-3 rounded-2xl border flex flex-col gap-1 transition-all hover:scale-[1.02] relative group",
                                                                                getSeverityColor(severity)
                                                                            )}>
                                                                                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{severity}</span>
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
                            </div>

                            <div className="pt-8 border-t border-border/50">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Ficha Técnica</h3>
                                </div>
                                <TechnicalSpecsSheet 
                                    specs={(car as any).market_data?.technical_specs} 
                                    category={(car as any).category}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            <div className="glass-card border-indigo-500/20 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl space-y-8 relative overflow-hidden">
                                <header className="flex justify-between items-baseline mb-2">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Precio Final Garantizado</span>
                                        <div className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                            ${(car.price || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </header>

                                <div className="pt-6 border-t border-border/50">
                                    <OfferModal 
                                        id={car.id}
                                        carPrice={car.price}
                                        carName={`${car.make} ${car.model}`}
                                        floorPrice={car.market_data?.minimum_price || car.price * 0.95}
                                        reconditioningBudget={car.reconditioning_budget || (car.market_data as any)?.reconditioning_budget}
                                        performanceScore={car.performance_score || 85}
                                        hasSeal={['CERTIFIED', 'published'].includes(car.status)}
                                        onSuccess={(amount) => {
                                            setNegotiatedPrice(amount);
                                            toast.success(`Precio pactado en $${amount.toLocaleString()} MXN`);
                                        }}
                                    />
                                </div>

                                <div id="checkout-section" className="space-y-5">
                                    <CheckoutAction 
                                        carId={car.id} 
                                        carPrice={negotiatedPrice || car.price} 
                                        carLocation={car.location} 
                                        category={car.category || 'Car'}
                                    />
                                </div>

                                 {car.year >= 2018 && car.price > 180000 && (
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center mt-6 px-4 leading-relaxed">
                                        ¿Interesado en financiamiento? <br />
                                        <span className="text-zinc-500">Tu Asesor StarterKar te guiará en la gestión bancaria tras validar tu intención de compra.</span>
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/50">
                    <RecommendedSection />
                </div>
            </div>

            {showGallery && car.images && (
                <div className="fixed inset-0 z-[200] bg-zinc-950/98 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
                    {/* Premium Gallery Header */}
                    <div className="flex items-center justify-between p-8">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Galería Premium</h3>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{car.make} {car.model} • {car.images.length} Capturas de Alta Resolución</p>
                        </div>
                        <button 
                            onClick={() => setShowGallery(false)} 
                            className="h-14 w-14 rounded-2xl bg-white/5 text-white flex items-center justify-center transition-all hover:bg-white/10 hover:scale-110 active:scale-95 border border-white/10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
                        {/* Selected Feature View */}
                        <div className="relative w-full h-[50vh] md:h-[60vh] rounded-[3rem] overflow-hidden mb-12 bg-zinc-900 border border-white/5 group shadow-2xl">
                            <Image src={car.images[galleryIndex]} alt="Main Gallery View" fill className="object-contain" priority />
                            
                            <button onClick={(e) => { e.stopPropagation(); setGalleryIndex(prev => (prev === 0 ? car.images!.length - 1 : prev - 1))}} className="absolute left-6 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md">
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setGalleryIndex(prev => (prev === car.images!.length - 1 ? 0 : prev + 1))}} className="absolute right-6 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md">
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </div>

                        {/* Complete Grid Mosaic */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {car.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setGalleryIndex(idx)}
                                    className={cn(
                                        "relative aspect-square rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 border-2",
                                        galleryIndex === idx ? "border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                                    {galleryIndex === idx && (
                                        <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
