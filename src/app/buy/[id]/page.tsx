"use client";

import { use, useEffect, useState } from "react";
import { ALL_CARS, Vehicle } from "@/data/cars";
import { Navbar } from "@/components/ui/navbar";
import { CheckoutAction } from "@/components/checkout/CheckoutAction";
import { StarterKarAIBot } from "@/components/market/StarterKarAIBot";
import { supabase } from "@/lib/supabase";
import { 
    ChevronLeft, 
    Share2, 
    Heart, 
    MapPin, 
    Gauge, 
    Fuel, 
    Zap, 
    Calendar, 
    ShieldCheck, 
    CarFront,
    Activity,
    Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [car, setCar] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        async function fetchCar() {
            setLoading(true);
            try {
                // 1. Try Supabase
                const { data, error } = await supabase
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
                <p className="text-zinc-500 font-bold animate-pulse">Sincronizando con la Bóveda...</p>
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
            <Navbar />

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <Link href="/buy" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a Inventario
                    </Link>
                    <div className="flex gap-2">
                        <button className="p-2.5 rounded-full border border-border bg-background hover:bg-secondary transition-colors">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={cn(
                                "p-2.5 rounded-full border border-border bg-background transition-all",
                                isFavorite ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "hover:bg-secondary"
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
                            
                            {/* Embedded AI Bot for this specific car */}
                            <div className="pt-8">
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                    {/* Glass Sheen */}
                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
                                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                        <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                                            <CarFront className="h-10 w-10" />
                                        </div>
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <h3 className="text-2xl font-black tracking-tight">Negociador Inteligente</h3>
                                            <p className="text-indigo-100/80 font-medium">Pregúntale a nuestra IA sobre el historial de este {car.make}, rendimiento real o solicita una oferta personalizada.</p>
                                        </div>
                                    </div>

                                    {/* Embed simple chat input here as "Gateway" or the whole Bot as embedded */}
                                    <div className="mt-8 relative z-10">
                                        <StarterKarAIBot 
                                            isOpen={true} 
                                            onClose={() => {}} 
                                            mode="embedded" 
                                            inventory={[car]}
                                        />
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
