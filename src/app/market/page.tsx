"use client";

import { useState, useMemo, useEffect } from "react";
import { Shield, Search, Filter, MapPin, Tag, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
// NotificationBell removed to prevent SSR recursion issues for now, can be re-added if wrapped properly
// import { NotificationBell } from "@/components/dashboard/notification-bell";
import { MarketFilters } from "@/components/market/MarketFilters";
import { ClinkarAIAdvisor } from "@/components/market/ClinkarAIAdvisor";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { cn } from "@/lib/utils";
import { ALL_CARS } from "@/data/cars";

export default function MarketPage() {
    const [filters, setFilters] = useState<any>({
        location: [],
        minPrice: '',
        maxPrice: '',
        makes: [],
        category: [], // Default to show all, or empty implies all
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showAdvisor, setShowAdvisor] = useState(false);
    const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'price_asc' | 'price_desc'>('relevance');

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredCars = useMemo(() => {
        return ALL_CARS.filter(car => {
            // Filter by Status (Only CERTIFIED cars are public)
            if (car.status !== 'CERTIFIED') return false;

            if (filters.category && filters.category.length > 0) {
                // Handle "Exotic" mapping to Marine/Air
                const effectiveCategories = filters.category.flatMap((c: string) =>
                    c === 'Exotic' ? ['Marine', 'Air'] : [c]
                );

                if (!effectiveCategories.includes(car.category)) {
                    return false;
                }
            }

            // Filter by Search Query (Universal Search)
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const match =
                    car.make.toLowerCase().includes(query) ||
                    car.model.toLowerCase().includes(query) ||
                    car.location.toLowerCase().includes(query) ||
                    `${car.make} ${car.model}`.toLowerCase().includes(query);

                if (!match) return false;
            }

            // Filter by Location
            // Filter by Location
            if (filters.location && filters.location.length > 0) {
                // Check if ANY of the selected locations is contained within the car's location string
                // e.g. Selected "CDMX" matches car location "CDMX Satélite"
                const match = filters.location.some((loc: string) => car.location.toLowerCase().includes(loc.toLowerCase()));
                if (!match) return false;
            }
            // Filter by Make
            if (filters.makes && filters.makes.length > 0 && !filters.makes.includes(car.make)) {
                return false;
            }
            // Filter by Model (New)
            if (filters.models && filters.models.length > 0 && !filters.models.includes(car.model)) {
                return false;
            }
            // Filter by Price
            if (filters.minPrice && car.price < Number(filters.minPrice)) return false;
            if (filters.maxPrice && car.price > Number(filters.maxPrice)) return false;

            // Filter by Year (New)
            if (filters.minYear && car.year < Number(filters.minYear)) return false;
            if (filters.maxYear && car.year > Number(filters.maxYear)) return false;

            // Filter by Mileage (New)
            // Assuming car.mileage exists in ALL_CARS. If not, we should default or skip.
            // For safety, casting to number if needed or checking existence.
            // Filter by Mileage (New)
            if (filters.minMileage && (car as any).mileage < Number(filters.minMileage)) return false;
            if (filters.maxMileage && (car as any).mileage > Number(filters.maxMileage)) return false;

            // Filter by Flash Sale (New)
            if (filters.flashSale && !car.flashSale) return false;

            return true;
        }).sort((a, b) => {
            if (sortBy === 'distance') return a.distance - b.distance;
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            return 0;
        });
    }, [filters, sortBy]);

    // Prevent hydration errors by not rendering until mounted
    if (!isMounted) return <div className="min-h-screen bg-secondary/30" />;

    return (
        <div className="min-h-screen bg-secondary/30">
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight">Clinkar</span>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Busca por marca, modelo o palabra clave..."
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={filters.searchQuery || ''}
                                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50 text-xs font-bold text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>Ubicación: CDMX</span>
                        </div>
                        <Link href="/dashboard" className="hidden sm:block text-sm font-semibold text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors">Mi Panel</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6 max-w-[1600px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                        <div className="bg-background rounded-3xl border border-border/60 p-6 shadow-sm">
                            <MarketFilters filters={filters} setFilters={setFilters} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-1">
                                    {filteredCars.length} Vehículos
                                </h1>
                                <p className="text-muted-foreground text-sm">Mostrando resultados en todo México.</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAdvisor(true)}
                                    className="hidden sm:flex h-10 items-center gap-2 px-4 rounded-xl border border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
                                >
                                    <Sparkles className="h-4 w-4 text-yellow-200" />
                                    Asistente IA
                                </button>
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="lg:hidden flex h-10 items-center gap-2 px-4 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-secondary"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filtros
                                </button>
                                <button
                                    onClick={() => setSortBy('distance')}
                                    className={cn(
                                        "flex h-10 items-center gap-2 px-4 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-secondary transition-all",
                                        sortBy === 'distance' && "bg-primary text-white border-primary hover:bg-primary/90"
                                    )}
                                >
                                    <MapPin className="h-4 w-4" />
                                    Más Cercanos
                                </button>
                                <select
                                    className="h-10 px-4 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-secondary outline-none cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                >
                                    <option value="relevance">Relevancia</option>
                                    <option value="price_asc">Menor Precio</option>
                                    <option value="price_desc">Mayor Precio</option>
                                </select>
                            </div>
                        </header>

                        {/* Active Filters Badges (Simulated) */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.flashSale && (
                                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm animate-in fade-in zoom-in">
                                    🔥 Ofertas Flash
                                    <button onClick={() => setFilters({ ...filters, flashSale: false })} className="hover:text-amber-100">×</button>
                                </span>
                            )}
                            {filters.location?.map((loc: string) => (
                                <span key={loc} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center gap-1">
                                    {loc}
                                    <button onClick={() => setFilters({ ...filters, location: filters.location.filter((l: string) => l !== loc) })} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                            {filters.makes?.map((make: string) => (
                                <span key={make} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center gap-1">
                                    {make}
                                    <button onClick={() => setFilters({ ...filters, makes: filters.makes.filter((m: string) => m !== make) })} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                            {filters.models?.map((model: string) => (
                                <span key={model} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                    {model}
                                    <button onClick={() => setFilters({ ...filters, models: filters.models.filter((m: string) => m !== model) })} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                            {(filters.minYear || filters.maxYear) && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                    {filters.minYear || '...'} - {filters.maxYear || '...'}
                                    <button onClick={() => setFilters({ ...filters, minYear: '', maxYear: '' })} className="hover:text-red-500">×</button>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {filteredCars.length > 0 ? (
                                filteredCars.map((car) => (
                                    <Link
                                        key={car.id}
                                        href={`/market/${car.id}`}
                                        className="group flex flex-col bg-background rounded-[2rem] border border-border/50 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1"
                                    >
                                        <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                                            {car.images?.[0] ? (
                                                <img
                                                    src={car.images[0]}
                                                    alt={car.model}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    No hay fotos
                                                </div>
                                            )}

                                            {/* Flash Sale Badge */}
                                            {car.flashSale && (
                                                <div className="absolute top-0 right-0 p-4 z-10">
                                                    <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
                                                        🔥 Flash Sale
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                                    <Tag className="h-2 w-2" />
                                                    {car.year}
                                                </span>
                                            </div>
                                            {/* Distance Badge */}
                                            <div className="absolute bottom-4 right-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm",
                                                    car.distance < 20 ? "bg-green-500/90 text-white" : "bg-black/60 text-white"
                                                )}>
                                                    <MapPin className="h-2 w-2" />
                                                    {car.distance < 20 ? 'En tu zona' : `${car.distance} km`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="block mb-1">
                                                    <h3 className="text-lg font-bold truncate leading-tight">{car.make} {car.model}</h3>
                                                    <p className="text-sm text-muted-foreground">{car.location}</p>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-2xl font-black text-foreground tracking-tight">
                                                            ${car.price.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">MXN</span>
                                                        </p>
                                                        {car.marketValue && car.price < car.marketValue && (
                                                            <span className="text-xs text-muted-foreground line-through decoration-red-500 decoration-2">
                                                                ${car.marketValue.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Savings Badge */}
                                                    {car.marketValue && car.price < car.marketValue && (
                                                        <p className="text-xs font-bold text-green-600 mt-1">
                                                            Ahorras ${(car.marketValue - car.price).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                                                <div className="flex items-center -space-x-2">
                                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] ring-2 ring-background">🛡️</div>
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] ring-2 ring-background">⚖️</div>
                                                </div>
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wide">
                                                    Verificado
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center space-y-4 bg-secondary/20 rounded-[3rem] border border-dashed border-border/60">
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
                                        <Search className="h-10 w-10 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-foreground">No encontramos resultados</p>
                                        <p className="text-muted-foreground">Intenta ajustar tus filtros de búsqueda.</p>
                                    </div>
                                    <button
                                        onClick={() => setFilters({ location: [], minPrice: '', maxPrice: '', makes: [] })}
                                        className="inline-flex px-6 py-2 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div className="absolute inset-y-0 right-0 w-80 bg-background border-l border-border shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Filtros</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="text-muted-foreground hover:text-foreground">
                                Cerrar
                            </button>
                        </div>
                        <MarketFilters filters={filters} setFilters={setFilters} />
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full mt-6 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            Ver {filteredCars.length} Resultados
                        </button>
                    </div>
                </div>
            )}

            {/* AI Advisor Modal */}
            <ClinkarAIAdvisor
                isOpen={showAdvisor}
                onClose={() => setShowAdvisor(false)}
            />

            {/* Persistent Support */}
            <WhatsAppButton />
        </div>
    );
}
