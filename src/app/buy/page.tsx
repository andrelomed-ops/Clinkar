"use client";

import { useState, useMemo, useEffect } from "react";
import { Shield, Search, Filter, MapPin, Tag, Menu, SlidersHorizontal, ArrowDownWideNarrow, Heart, ChevronLeft, ChevronRight, CarFront } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MarketFilters } from "@/components/market/MarketFilters";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { ALL_CARS } from "@/data/cars";
import { createBrowserClient } from "@/lib/supabase/client";
import { FavoriteService } from "@/services/FavoriteService";
import { CarCard } from "@/components/market/CarCard";

import { Navbar } from "@/components/ui/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Cache Buster: v1.0.4 - Design Restoration & Navigation Fix
const StarterKarAIBot = dynamic(
    () => import("@/components/market/StarterKarAIBot").then((mod) => mod.StarterKarAIBot),
    { 
        loading: () => <div className="h-96 animate-pulse bg-muted/20 backdrop-blur-sm rounded-xl" />,
        ssr: false 
    }
);

const ITEMS_PER_PAGE = 24;

export default function BuyPage() {
    const supabase = createBrowserClient();
    const [filters, setFilters] = useState<any>({
        location: [],
        minPrice: '',
        maxPrice: '',
        makes: [],
        category: [],
        investorOnly: false,
        certifiedOnly: false,
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'distance'>('newest');
    const [isMounted, setIsMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [cars, setCars] = useState<any[]>(ALL_CARS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const loadFavorites = async () => {
            const favs = await FavoriteService.getFavorites(supabase);
            setFavorites(favs);
        };
        loadFavorites();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                const favs = await FavoriteService.getFavorites(supabase);
                setFavorites(favs);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        async function fetchCars() {
            try {
                const { data, error } = await supabase
                    .from('cars')
                    .select('*')
                    .eq('status', 'AVAILABLE');

                if (error) throw error;

                if (data && data.length > 0) {
                    const mappedCars = (data as any[]).map(dbCar => ({
                        ...dbCar,
                        features: [],
                        distance: (dbCar.mileage || 0) / 1000,
                        tags: dbCar.description ? dbCar.description.split(", ") : [],
                        category: 'Car',
                        type: 'Sedan',
                        transmission: 'Automática',
                        fuel: 'Gasolina',
                        condition: 'Seminuevo',
                    }));
                    setCars(mappedCars);
                }
            } catch (e) {
                console.error("Error fetching cars:", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCars();
    }, [supabase]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, showFavoritesOnly, sortBy, searchTerm]);

    useEffect(() => {
        setFilters((prev: any) => ({ ...prev, searchQuery: searchTerm }));
    }, [searchTerm]);

    const toggleFavorite = async (id: string) => {
        const isFav = favorites.includes(id);
        const newFavs = isFav ? favorites.filter(f => f !== id) : [...favorites, id];
        setFavorites(newFavs);

        try {
            await FavoriteService.toggleFavorite(supabase, id);
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            setFavorites(favorites);
        }
    };

    const filteredCars = useMemo(() => {
        return cars.filter(car => {
            if (showFavoritesOnly && !favorites.includes(car.id)) return false;

            if (filters.category && filters.category.length > 0) {
                const effectiveCategories = filters.category.flatMap((c: string) =>
                    c === 'Exotic' ? ['Marine', 'Air'] : [c]
                );
                if (!effectiveCategories.includes(car.category)) return false;
            }

            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const match =
                    car.make.toLowerCase().includes(query) ||
                    car.model.toLowerCase().includes(query) ||
                    car.location.toLowerCase().includes(query) ||
                    `${car.make} ${car.model}`.toLowerCase().includes(query);
                if (!match) return false;
            }

            if (filters.location && filters.location.length > 0) {
                const match = filters.location.some((loc: string) => car.location.toLowerCase().includes(loc.toLowerCase()));
                if (!match) return false;
            }
            if (filters.makes && filters.makes.length > 0 && !filters.makes.includes(car.make)) return false;
            if (filters.minPrice && car.price < Number(filters.minPrice)) return false;
            if (filters.maxPrice && car.price > Number(filters.maxPrice)) return false;
            if (filters.certifiedOnly && !car.has_starterkar_seal) return false;

            return true;
        }).sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'newest') return b.year - a.year;
            return 0;
        });
    }, [cars, filters, sortBy, favorites, showFavoritesOnly]);

    const totalItems = filteredCars.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedCars = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCars.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCars, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <Navbar
                variant="market"
                showFavorites={true}
                favoritesCount={favorites.length}
                showFavoritesOnly={showFavoritesOnly}
                onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            />

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="hidden md:block w-72 shrink-0 space-y-8">
                        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                            <MarketFilters filters={filters} setFilters={setFilters} />
                        </div>
                    </aside>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 flex-wrap">
                            <div className="flex-shrink-0">
                                <h1 className="text-4xl font-black tracking-tight mb-2">Inventario Certificado</h1>
                                <p className="text-muted-foreground max-w-lg">
                                    Autos verificados física, mecánica y legalmente.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAI(true)}
                                className="relative flex-1 min-w-[260px] mx-0 md:mx-4 h-14 glass-card border-indigo-200/50 dark:border-indigo-500/30 rounded-2xl flex items-center justify-between px-4 group transition-all duration-500 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:border-indigo-400/50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                                        <CarFront className="h-5 w-5 text-white animate-pulse" />
                                    </div>
                                    <div className="text-left flex flex-col justify-center h-full">
                                        <span className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-widest leading-none mb-0.5">
                                            Nueva Generación
                                        </span>
                                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                            Pregúntale a StarterKar AI
                                        </span>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 relative z-10">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </button>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative group w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full h-12 pl-10 pr-4 bg-secondary/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowMobileFilters(true)}
                                        className="md:hidden h-12 w-12 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </button>
                                    <select
                                        className="h-12 pl-4 pr-10 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none appearance-none cursor-pointer hover:bg-secondary/50 transition-colors"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                    >
                                        <option value="newest">Más Recientes</option>
                                        <option value="price_asc">Precio: Menor a Mayor</option>
                                        <option value="price_desc">Precio: Mayor a Menor</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
                                        <div className="space-y-3 px-2">
                                            <Skeleton className="h-5 w-2/3 rounded-lg" />
                                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                paginatedCars.map((car) => (
                                    <CarCard
                                        key={car.id}
                                        car={car}
                                        isFavorite={favorites.includes(car.id)}
                                        onToggleFavorite={() => toggleFavorite(car.id)}
                                    />
                                ))
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>
                                <span className="text-sm font-bold mx-4">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showMobileFilters && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div className="absolute inset-y-0 right-0 w-80 bg-background border-l border-border shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Filtros</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="text-zinc-500">Cerrar</button>
                        </div>
                        <MarketFilters filters={filters} setFilters={setFilters} />
                    </div>
                </div>
            )}

            <StarterKarAIBot
                isOpen={showAI}
                onClose={() => setShowAI(false)}
                inventory={cars}
                onSelectCar={(carId) => {
                    setShowAI(false);
                    window.location.href = `/buy/${carId}`;
                }}
            />
        </div>
    );
}
