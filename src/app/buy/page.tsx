"use client";

import { useState, useMemo, useEffect } from "react";
import { Shield, Search, Filter, MapPin, Tag, Menu, SlidersHorizontal, ArrowDownWideNarrow, Heart, ChevronLeft, ChevronRight, CarFront, ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MarketFilters } from "@/components/market/MarketFilters";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { ALL_CARS } from "@/data/cars";
import { createBrowserClient } from "@/lib/supabase/client";
import { FavoriteService } from "@/services/FavoriteService";
import { CarService } from "@/services/CarService";
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
    // EMERGENCY FALLBACK: Prevent ReferenceError: AlertCircle from crashing the page
    if (typeof window !== 'undefined') {
        (window as any).AlertCircle = (window as any).AlertCircle || (() => null);
        console.log("StarterKar Ops: BuyPage v4.2.2 Loaded");
    }

    const supabase = useMemo(() => createBrowserClient(), []);
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
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const loadFavorites = async () => {
            const favs = await FavoriteService.getFavorites(supabase);
            setFavorites(favs);
        };
        const loadUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setUserRole(profile?.role || 'buyer');
            }
        };
        loadFavorites();
        loadUserRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                const favs = await FavoriteService.getFavorites(supabase);
                setFavorites(favs);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    // 2. Fetch User Role
    useEffect(() => {
        const loadUserRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    setUserRole(profile?.role || 'buyer');
                }
            } catch (err) {
                console.error("Error loading user role:", err);
                setUserRole('buyer');
            }
        };
        loadUserRole();
    }, [supabase]);

    // 3. Fetch Cars
    useEffect(() => {
        async function fetchCars() {
            setIsLoading(true);
            console.log("StarterKar Ops: Starting fetchCars...");
            try {
                const data = await CarService.getAllCars(supabase);
                console.log(`StarterKar Ops: CarService returned ${data?.length || 0} items`);

                if (data && Array.isArray(data)) {
                    const mappedCars = data.map(dbCar => {
                        try {
                            if (!dbCar) return null;
                            const marketData = dbCar.market_data || {};
                            return {
                                ...dbCar,
                                id: dbCar.id || Math.random().toString(),
                                make: dbCar.make || 'Marca',
                                model: dbCar.model || 'Modelo',
                                year: Number(dbCar.year) || 2024,
                                images: Array.isArray(dbCar.images) ? dbCar.images : [],
                                features: Array.isArray(dbCar.features) ? dbCar.features : [],
                                distance: Number(dbCar.mileage) || 0,
                                fuel: dbCar.fuel_type || 'Gasolina',
                                transmission: dbCar.transmission || 'Automática',
                                condition: dbCar.condition || 'Seminuevo',
                                category: dbCar.category || 'Car',
                                tags: typeof dbCar.description === 'string' ? dbCar.description.split(", ") : [],
                                price: Number(dbCar.price) || 0,
                                marketValue: Number(marketData.marketValue) || Number(dbCar.price) || 0,
                                is_new: !!(marketData.is_new || dbCar.is_new),
                                is_investor_only: !!(marketData.is_investor_only || dbCar.is_investor_only),
                                is_imported: !!(marketData.is_imported || dbCar.is_imported),
                                has_clinkar_seal: !!(dbCar.has_clinkar_seal || marketData.has_clinkar_seal),
                                has_starterkar_seal: !!(dbCar.has_clinkar_seal || marketData.has_clinkar_seal || marketData.certified)
                            };
                        } catch (err) {
                            console.error("Error mapping car:", dbCar?.id, err);
                            return null;
                        }
                    }).filter(Boolean);
                    
                    console.log(`StarterKar Ops: Successfully mapped ${mappedCars.length} cars`);
                    setCars(mappedCars);
                } else {
                    console.warn("StarterKar Ops: DB fetch returned null or invalid data, using mock fallback.");
                    setCars(ALL_CARS);
                }
            } catch (e) {
                console.error("StarterKar Ops: Critical Error in fetchCars:", e);
                setCars(ALL_CARS);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCars();
    }, [supabase]);

    const safeSetFilters = (newFilters: any) => {
        try {
            setFilters(newFilters);
        } catch (err) {
            console.error("Error setting filters:", err);
        }
    };

    useEffect(() => {
        safeSetFilters((prev: any) => ({ ...prev, searchQuery: searchTerm }));
    }, [searchTerm]);

    const toggleFavorite = async (id: string) => {
        if (!id) return;
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

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, showFavoritesOnly, sortBy, searchTerm]);

    const filteredCars = useMemo(() => {
        try {
            return cars.filter(car => {
                // Skip cars with no essential data
                if (!car || !car.id) return false;
                
                if (showFavoritesOnly && !favorites.includes(car.id)) return false;

                if (filters.category && filters.category.length > 0) {
                    const effectiveCategories = filters.category.flatMap((c: string) =>
                        c === 'Exotic' ? ['Marine', 'Air'] : [c]
                    );
                    if (!effectiveCategories.includes(car.category)) return false;
                }

                if (filters.searchQuery) {
                    const query = filters.searchQuery.toLowerCase();
                    const carMake = (car.make || '').toLowerCase();
                    const carModel = (car.model || '').toLowerCase();
                    const carLocation = (car.location || '').toLowerCase();
                    const match =
                        carMake.includes(query) ||
                        carModel.includes(query) ||
                        carLocation.includes(query) ||
                        `${carMake} ${carModel}`.includes(query);
                    if (!match) return false;
                }

                if (filters.location && filters.location.length > 0) {
                    const carLocation = (car.location || '').toLowerCase();
                    const match = filters.location.some((loc: string) => carLocation.includes(loc.toLowerCase()));
                    if (!match) return false;
                }
                if (filters.makes && filters.makes.length > 0 && !filters.makes.includes(car.make)) return false;
                if (filters.minPrice && car.price < Number(filters.minPrice)) return false;
                if (filters.maxPrice && car.price > Number(filters.maxPrice)) return false;
                const isUserInvestor = userRole?.toLowerCase() === 'investor';

                if (filters.certifiedOnly && !car.has_clinkar_seal) return false;
                if (filters.flashSale && !car.flashSale) return false;
                if (filters.isBorder && !car.is_imported) return false;
                if (filters.investorOnly && !car.is_investor_only) return false;
                if (filters.newCars && !car.is_new) return false;

                // RESTRICTION: Investor-only cars are ONLY visible to users with the 'investor' role
                if (car.is_investor_only && !isUserInvestor) return false;

                return true;
            }).sort((a, b) => {
                if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
                if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
                if (sortBy === 'newest') return (b.year || 0) - (a.year || 0);
                return 0;
            });
        } catch (err) {
            console.error("Critical error in BuyPage filtering:", err);
            return [];
        }
    }, [cars, filters, sortBy, favorites, showFavoritesOnly, userRole]);

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

                        <div className={cn(
                            "grid gap-8",
                            paginatedCars.length > 0 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                        )}>
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
                            ) : paginatedCars.length > 0 ? (
                                paginatedCars.map((car) => (
                                    <CarCard
                                        key={car.id}
                                        car={car}
                                        isFavorite={favorites.includes(car.id)}
                                        onToggleFavorite={() => toggleFavorite(car.id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 flex flex-col items-center text-center animate-reveal">
                                    <div className="h-24 w-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-8">
                                        <Search className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 tracking-tight uppercase italic">No encontramos lo que buscas</h3>
                                    <p className="text-muted-foreground max-w-md mb-10 font-medium">
                                        No tenemos ese auto exacto en el inventario actual, pero podemos buscarlo por ti a través de nuestra red de aliados.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                                        <Link 
                                            href="/demand-request" 
                                            className="h-16 px-8 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group"
                                        >
                                            <CarFront className="h-5 w-5" />
                                            SOLICITAR UN AUTO
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                setSearchTerm("");
                                                setFilters({
                                                    location: [],
                                                    minPrice: '',
                                                    maxPrice: '',
                                                    makes: [],
                                                    category: [],
                                                    investorOnly: false,
                                                    certifiedOnly: false,
                                                });
                                            }}
                                            className="h-16 px-8 bg-secondary text-foreground rounded-2xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-secondary/80 transition-all active:scale-95"
                                        >
                                            LIMPIAR FILTROS
                                        </button>
                                    </div>
                                    
                                    <div className="mt-16 p-8 glass-card border-indigo-500/10 rounded-[2.5rem] max-w-2xl w-full flex flex-col md:flex-row items-center gap-6">
                                        <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                                            <Shield className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-lg mb-1 tracking-tight uppercase italic">¿Sabías que?</h4>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                Cualquier auto que solicites pasa por la misma inspección de 150 puntos y garantía de StarterKar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
