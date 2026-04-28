"use client";

import { useState, useEffect } from "react";
import { CarCard } from "@/components/market/CarCard";
import { CarFront, ArrowRight, Sparkles, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";
import { ALL_CARS } from "@/data/cars";
import { Skeleton } from "@/components/ui/skeleton";

// Component-level Fallback for stale build artifacts
if (typeof window !== 'undefined') {
    (window as any).AlertCircle = (window as any).AlertCircle || (() => null);
}


interface RecommendedSectionProps {
    favoriteIds?: string[];
    onToggleFavorite?: (e: React.MouseEvent, carId: string) => void;
}

export function RecommendedSection({ favoriteIds = [], onToggleFavorite }: RecommendedSectionProps) {
    const [recommendedCars, setRecommendedCars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reasonLabel, setReasonLabel] = useState("Basado en tendencias de mercado");
    const supabase = createBrowserClient();

    useEffect(() => {
        async function loadRecommendations() {
            setIsLoading(true);
            try {
                // 1. Fetch all available cars from DB
                const { data: dbCars, error } = await supabase
                    .from('cars')
                    .select('*')
                    .in('status', ['available', 'PUBLISHED', 'CERTIFIED', 'AVAILABLE', 'certified', 'published', 'ACTIVE', 'active'])
                    .limit(50);

                let pool: any[] = [];

                if (!error && dbCars && dbCars.length > 0) {
                    pool = dbCars.map((d: any) => ({
                        ...d,
                        location: d.market_data?.location || d.location || 'México',
                        distance: d.mileage || 0,
                        fuel: d.fuel_type || 'Gasolina',
                        transmission: d.transmission || 'Automática',
                        images: Array.isArray(d.images) ? d.images : [],
                        condition: d.condition || 'Seminuevo',
                        category: d.category || 'Car',
                        marketValue: d.market_data?.marketValue || d.price,
                    }));
                } else {
                    // Fallback: use mock data (real inventory cars only, filtered)
                    pool = ALL_CARS.filter(c => c.status === 'CERTIFIED');
                }

                if (pool.length === 0) {
                    setRecommendedCars([]);
                    return;
                }

                // 2. Personalization logic based on favorites & demand registry
                let preferredCategories: string[] = [];
                let preferredBrands: string[] = [];
                let priceRange: [number, number] | null = null;

                const { data: { user } } = await supabase.auth.getUser();

                if (favoriteIds.length > 0) {
                    const favCarsInPool = pool.filter(c => favoriteIds.includes(c.id));
                    if (favCarsInPool.length > 0) {
                        preferredCategories = [...new Set(favCarsInPool.map((c: any) => c.category))];
                        preferredBrands = [...new Set(favCarsInPool.map((c: any) => c.make))];
                        const avgPrice = favCarsInPool.reduce((sum: number, c: any) => sum + (c.price || 0), 0) / favCarsInPool.length;
                        priceRange = [avgPrice * 0.5, avgPrice * 1.8];
                    }
                }

                // Add preferences from Demand Registry (Chat/Manual searches for missing cars)
                if (user) {
                    const { data: demands } = await supabase
                        .from('demand_registry')
                        .select('brand, budget_min, budget_max')
                        .eq('user_id', user.id)
                        .limit(5);
                    
                    if (demands && demands.length > 0) {
                        demands.forEach(d => {
                            if (d.brand) preferredBrands.push(d.brand);
                            if (d.budget_max && (!priceRange || d.budget_max > priceRange[1])) {
                                priceRange = [d.budget_min || 0, d.budget_max];
                            }
                        });
                    }
                }

                if (preferredCategories.length > 0 || preferredBrands.length > 0 || priceRange) {
                    // Score each car
                    const scored = pool
                        .filter(c => !favoriteIds.includes(c.id)) // exclude already favorited
                        .map(c => {
                            let score = Math.random(); // base randomness
                            if (preferredCategories.includes(c.category)) score += 3;
                            if (preferredBrands.includes(c.make)) score += 2;
                            if (priceRange && c.price >= priceRange[0] && c.price <= priceRange[1]) score += 2;
                            if (c.marketValue && c.price && (c.marketValue - c.price) / c.marketValue > 0.05) score += 1; // good deal
                            return { ...c, _score: score };
                        })
                        .sort((a, b) => b._score - a._score)
                        .slice(0, 3);

                    if (scored.length > 0) {
                        setRecommendedCars(scored);
                        setReasonLabel(preferredBrands.length > 0 ? "Personalizado según tu búsqueda" : "Optimizado para tu perfil");
                        return;
                    }
                }

                // 3. Default: shuffle and pick 3 different cars (not in favorites)
                const notFavorited = pool.filter(c => !favoriteIds.includes(c.id));
                const shuffled = [...(notFavorited.length >= 3 ? notFavorited : pool)]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);

                setRecommendedCars(shuffled);
                setReasonLabel("Del inventario verificado StarterKar");
            } catch (err) {
                console.error('Error loading recommendations:', err);
                // Last resort fallback
                const fallback = [...ALL_CARS]
                    .filter(c => c.status === 'CERTIFIED')
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                setRecommendedCars(fallback);
            } finally {
                setIsLoading(false);
            }
        }

        loadRecommendations();
    }, [favoriteIds.join(',')]); // re-run when favorites change

    if (!isLoading && recommendedCars.length === 0) return null;

    return (
        <section className="mt-16 animate-reveal stagger-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        {favoriteIds.length > 0 
                            ? <Brain className="h-5 w-5 text-indigo-600/70" />
                            : <CarFront className="h-5 w-5 text-zinc-500" />
                        }
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2 italic uppercase">
                            Recomendaciones IA
                            <Sparkles className="h-3 w-3 text-indigo-500/40" />
                        </h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{reasonLabel}</p>
                    </div>
                </div>
                <Button variant="ghost" asChild className="text-indigo-600 hover:text-indigo-700 font-bold">
                    <Link href="/buy" className="flex items-center gap-2">
                        Ver todo el inventario <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                            <Skeleton className="h-5 w-2/3 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recommendedCars.map((car) => (
                        <CarCard 
                            key={car.id} 
                            car={car} 
                            isFavorite={favoriteIds.includes(car.id)}
                            onToggleFavorite={(e) => onToggleFavorite?.(e, car.id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
