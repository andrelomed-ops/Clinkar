"use client";

import { useState, useMemo, useEffect } from "react";
import { Shield, Search, Filter, MapPin, Tag, Menu, Sparkles, SlidersHorizontal, ArrowDownWideNarrow, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MarketFilters } from "@/components/market/MarketFilters";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { ALL_CARS } from "@/data/cars";
import { supabase } from "@/lib/supabase"; // Import Client
import { FavoriteService } from "@/services/FavoriteService";
import { CarCard } from "@/components/market/CarCard";

import { Navbar } from "@/components/ui/navbar";
import { ClinkarAIAdvisor } from "@/components/market/ClinkarAIAdvisor";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 24;

export default function BuyPage() {
    const [filters, setFilters] = useState<any>({
        location: [],
        minPrice: '',
        maxPrice: '',
        makes: [],
        category: [],
        investorOnly: false,
        certifiedOnly: false, // Default false to show all text
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showAI, setShowAI] = useState(false); // AI State
    const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'price_asc' | 'price_desc'>('newest' as any);
    const [isMounted, setIsMounted] = useState(false);

    // Search term state from the simpler version, mapped to filters.searchQuery
    const [searchTerm, setSearchTerm] = useState("");

    // Favorites System
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Load favorites using Hybrid Service
        const loadFavorites = async () => {
            const favs = await FavoriteService.getFavorites(supabase);
            setFavorites(favs);
        };
        loadFavorites();

        // Listen for auth changes to sync
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                const favs = await FavoriteService.getFavorites(supabase);
                setFavorites(favs);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Save favorites is handled by Service now, no need for effect to sync to localStorage manually here
    // But we might want to keep generic listener? Service handles it.

    const toggleFavorite = async (id: string) => {
        // Optimistic Update
        const isFav = favorites.includes(id);
        const newFavs = isFav ? favorites.filter(f => f !== id) : [...favorites, id];
        setFavorites(newFavs);

        // Real Update
        try {
            await FavoriteService.toggleFavorite(supabase, id);
            // Optional: Re-fetch to be sure?
            // const finalFavs = await FavoriteService.getFavorites(supabase);
            // setFavorites(finalFavs); 
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            // Revert on error
            setFavorites(favorites);
        }
    };

    // State for Cars (Hybrid: DB + Mock)
    const [cars, setCars] = useState<any[]>(ALL_CARS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCars() {
            try {
                // Attempt to fetch from Supabase
                const { data, error } = await supabase
                    .from('cars')
                    .select('*')
                    .eq('status', 'AVAILABLE'); // Only fetch available by default

                if (error) throw error;

                if (data && data.length > 0) {
                    // Start with DB cars
                    // We might want to merge or just replace. For now, let's Replace to prove connection.
                    // But we need to map DB shape to Component shape if they differ.
                    // Our DB shape is very similar.
                    const mappedCars = (data as any[]).map(dbCar => ({
                        ...dbCar,
                        id: dbCar.id,
                        features: [],
                        distance: (dbCar.mileage || 0) / 1000,
                        tags: dbCar.description ? dbCar.description.split(", ") : [],
                        category: 'Car',
                        type: 'Sedan',
                        transmission: 'Automática',
                        fuel: 'Gasolina',
                        condition: 'Seminuevo',
                        has_clinkar_seal: dbCar.has_clinkar_seal, // Map from DB
                    }));
                    setCars(mappedCars);
                } else {
                    // console.log("No cars in DB, using Mock Data.");
                }
            } catch (e) {
                // console.error("Supabase fetch failed, using fallback:", e);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCars();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, showFavoritesOnly, sortBy, searchTerm]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Sync local searchTerm with filters
    useEffect(() => {
        setFilters((prev: any) => ({ ...prev, searchQuery: searchTerm }));
    }, [searchTerm]);

    const filteredCars = useMemo(() => {
        return cars.filter(car => {
            // Favorites Filter
            if (showFavoritesOnly && !favorites.includes(car.id)) return false;

            // Filter by Status (Only CERTIFIED cars are public)
            // if (car.status !== 'CERTIFIED') return false; // Optional depending on data

            if (filters.category && filters.category.length > 0) {
                const effectiveCategories = filters.category.flatMap((c: string) =>
                    c === 'Exotic' ? ['Marine', 'Air'] : [c]
                );
                if (!effectiveCategories.includes(car.category)) return false;
            }

            // Universal Search
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const match =
                    car.make.toLowerCase().includes(query) ||
                    car.model.toLowerCase().includes(query) ||
                    car.location.toLowerCase().includes(query) ||
                    `${car.make} ${car.model}`.toLowerCase().includes(query);
                if (!match) return false;
            }

            // Location
            if (filters.location && filters.location.length > 0) {
                const match = filters.location.some((loc: string) => car.location.toLowerCase().includes(loc.toLowerCase()));
                if (!match) return false;
            }
            // Make
            if (filters.makes && filters.makes.length > 0 && !filters.makes.includes(car.make)) return false;
            // Model
            if (filters.models && filters.models.length > 0 && !filters.models.includes(car.model)) return false;
            // Price
            if (filters.minPrice && car.price < Number(filters.minPrice)) return false;
            if (filters.maxPrice && car.price > Number(filters.maxPrice)) return false;
            // Year
            if (filters.minYear && car.year < Number(filters.minYear)) return false;
            if (filters.maxYear && car.year > Number(filters.maxYear)) return false;
            // Mileage
            if (filters.minMileage && (car as any).mileage < Number(filters.minMileage)) return false;
            if (filters.maxMileage && (car as any).mileage > Number(filters.maxMileage)) return false;
            // Flash Sale
            if (filters.flashSale && !car.flashSale) return false;

            // Investor Filter
            if (filters.investorOnly) {
                const priceDiff = car.marketValue ? car.marketValue - car.price : 0;
                const savingsPercent = car.marketValue ? (priceDiff / car.marketValue) * 100 : 0;
                if (savingsPercent <= 15) return false;
            }

            // Certified Check (The Seal)
            if (filters.certifiedOnly && !car.has_clinkar_seal) return false;

            return true;
        }).sort((a, b) => {
            if (sortBy === 'distance') return a.distance - b.distance;
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if ((sortBy as any) === 'newest') return b.year - a.year; // Handle 'newest' from previous version
            return 0;
        });
    }, [filters, sortBy, favorites, showFavoritesOnly]);

    // Pagination Logic
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

    // if (!isMounted) return <div className="min-h-screen bg-white dark:bg-zinc-950" />;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

            <Navbar
                variant="market"
                showFavorites={true}
                favoritesCount={favorites.length}
                showFavoritesOnly={showFavoritesOnly}
                onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
                backHref="/"
                backLabel="Volver al Inicio"
            />

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters - Desktop (Reused Component) */}
                    <aside className="hidden md:block w-72 shrink-0 space-y-8 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">



                        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                            <MarketFilters filters={filters} setFilters={setFilters} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 flex-wrap">
                            <div className="flex-shrink-0">
                                <h1 className="text-4xl font-black tracking-tight mb-2">Inventario Certificado</h1>
                                <p className="text-muted-foreground max-w-lg">
                                    Autos verificados física, mecánica y legalmente.
                                </p>
                            </div>

                            {/* AI TRIGGER BUTTON (NEURAL CORE - INNOVATIVE DESIGN) */}
                            {/* AI TRIGGER BUTTON (HOLOGRAPHIC MINIMALIST) - Layout Robustness Added */}
                            <button
                                onClick={() => setShowAI(true)}
                                className="relative flex-1 min-w-[260px] mx-0 md:mx-4 h-14 glass-card border-indigo-200/50 dark:border-indigo-500/30 rounded-2xl flex items-center justify-between px-4 group transition-all duration-500 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:border-indigo-400/50 overflow-hidden"
                            >
                                {/* Subtle internal sheen animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                                <div className="flex items-center gap-3 relative z-10">
                                    {/* Icon Container - Jewel like */}
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                                        <Sparkles className="h-5 w-5 text-white animate-pulse" style={{ animationDuration: '3s' }} />
                                    </div>

                                    {/* Text Content - Sober & Clean */}
                                    <div className="text-left flex flex-col justify-center h-full">
                                        <span className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-widest leading-none mb-0.5">
                                            Nueva Generación
                                        </span>
                                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                            Pregúntale a Clinkar AI
                                        </span>
                                    </div>
                                </div>

                                {/* Right Element: Call to Action Arrow */}
                                <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 relative z-10">
                                    <Sparkles className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
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

                        {/* Active Filters Summary */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {showFavoritesOnly && (
                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg flex items-center gap-1">
                                    <Heart className="h-3 w-3 fill-current" /> Solo Favoritos
                                    <button onClick={() => setShowFavoritesOnly(false)} className="hover:text-red-800 ml-1">×</button>
                                </span>
                            )}
                            {filters.location?.map((loc: string) => (
                                <span key={loc} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded-lg flex items-center gap-1">
                                    {loc} <button onClick={() => setFilters({ ...filters, location: filters.location.filter((l: string) => l !== loc) })} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
                                        <div className="space-y-3 px-2">
                                            <Skeleton className="h-5 w-2/3 rounded-lg" />
                                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                                            <div className="flex justify-between pt-2">
                                                <Skeleton className="h-6 w-1/4 rounded-lg" />
                                                <Skeleton className="h-6 w-1/4 rounded-lg outline-none" />
                                            </div>
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <span className="text-sm font-bold mx-4">
                                    Página {currentPage} de {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredCars.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                                    {showFavoritesOnly ? <Heart className="h-6 w-6 text-red-400" /> : <Search className="h-6 w-6 text-zinc-400" />}
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {showFavoritesOnly ? 'Aún no tienes favoritos' : 'Sin resultados'}
                                </h3>
                                <p className="text-zinc-500">
                                    {showFavoritesOnly ? 'Marca los autos que te gusten con el corazón ❤️ para verlos aquí.' : 'Intenta ajustar tu búsqueda.'}
                                </p>
                                <button
                                    onClick={() => {
                                        if (showFavoritesOnly) setShowFavoritesOnly(false);
                                        else { setSearchTerm(""); setFilters({ location: [], minPrice: '', maxPrice: '', makes: [] }); }
                                    }}
                                    className="mt-6 text-sm font-bold text-blue-600 hover:underline"
                                >
                                    {showFavoritesOnly ? 'Ver todos los autos' : 'Limpiar filtros'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div className="absolute inset-y-0 right-0 w-80 bg-background border-l border-border shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Filtros</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="text-zinc-500">Cerrar</button>
                        </div>
                        <MarketFilters filters={filters} setFilters={setFilters} />
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full mt-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl"
                        >
                            Ver Resultados
                        </button>
                    </div>
                </div>
            )}
            {/* AI COMPONENT (Modal Mode) */}
            <ClinkarAIAdvisor
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
