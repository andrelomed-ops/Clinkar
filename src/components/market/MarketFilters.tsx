"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, MapPin, Calendar, Gauge, Globe, TrendingDown, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
}

// Full list of 32 Mexican States
const MX_STATES = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
    "Ciudad de México", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
    "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
    "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

// Major Brands with Models organized by Category
const CATEGORIZED_DATA: Record<string, Record<string, string[]>> = {
    'Car': {
        "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
        "BMW": ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5", "M2", "M3", "M4"],
        "Audi": ["A1", "A3", "A4", "Q3", "Q5", "Q7", "TT", "R8"],
        "Mercedes-Benz": ["Clase A", "Clase C", "Clase E", "GLA", "GLC", "GLE", "Clase G"],
        "Toyota": ["Yaris", "Corolla", "Camry", "Prius", "RAV4", "Highlander", "Tacoma", "Tundra"],
    },
    'Motorcycle': {
        "Yamaha": ["R1", "R6", "MT-07", "MT-09"],
        "Ducati": ["Panigale", "Monster", "Diavel", "Multistrada"],
        "Harley-Davidson": ["Sportster", "Softail", "Touring"],
        "BMW Motorrad": ["S1000RR", "R1250GS", "G310R"],
    },
    'Marine': {
        "Sea Ray": ["SPX", "SDX", "Sundancer"],
        "Yamaha Marine": ["AR190", "242X", "Waverunner"],
        "Boston Whaler": ["Super Sport", "Montauk", "Outrage"],
    },
    'Air': {
        "Cessna": ["172 Skyhawk", "182 Skylane", "Citation"],
        "Cirrus": ["SR20", "SR22", "Vision Jet"],
        "Robinson": ["R22", "R44", "R66"],
    },
    'Heavy': {
        "Kenworth": ["T680", "T880", "W900"],
        "Freightliner": ["Cascadia", "M2 106"],
        "Caterpillar": ["Excavadora", "Retroexcavadora"],
        "John Deere": ["Tractor 5E", "Cosechadora S700"],
    }
};

export function MarketFilters({ filters, setFilters }: MarketFiltersProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        category: true, // Open by default specifically for this strategy
        location: true,
        price: true,
        make: true,
        year: true,
        mileage: true,
    });

    const [locSearch, setLocSearch] = useState("");
    const [makeSearch, setMakeSearch] = useState("");
    const [expandedMakes, setExpandedMakes] = useState<string[]>([]);

    // Helper to get relevant brands based on selected category
    const getRelevantBrands = () => {
        // If specific categories are selected, merge their brands
        if (filters.category && filters.category.length > 0) {
            let brands: Record<string, string[]> = {};
            filters.category.forEach((catId: string) => {
                if (catId === 'Exotic') {
                    // "Exotic" combines Marine and Air
                    brands = {
                        ...brands,
                        ...CATEGORIZED_DATA['Marine'],
                        ...CATEGORIZED_DATA['Air']
                    };
                } else if (CATEGORIZED_DATA[catId]) {
                    brands = { ...brands, ...CATEGORIZED_DATA[catId] };
                }
            });
            return brands;
        }
        // Default to showing CARS if nothing selected (80% use case) to avoid empty state
        return CATEGORIZED_DATA['Car'];
    };

    const activeBrandsData = getRelevantBrands();

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleMakeExpansion = (make: string) => {
        setExpandedMakes(prev =>
            prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
        );
    };

    const handleModelSelect = (make: string, model: string) => {
        const currentModels = filters.models || [];
        const newModels = currentModels.includes(model)
            ? currentModels.filter((m: string) => m !== model)
            : [...currentModels, model];

        const currentMakes = filters.makes || [];
        const newMakes = !currentMakes.includes(make) && newModels.length > 0
            ? [...currentMakes, make]
            : currentMakes;

        setFilters({ ...filters, models: newModels, makes: newMakes });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-black text-lg">Filtros</h3>
                <button
                    onClick={() => setFilters({
                        location: [], minPrice: '', maxPrice: '', makes: [], models: [], category: [],
                        minYear: '', maxYear: '', minMileage: '', maxMileage: '', flashSale: false, isBorder: false // Reset
                    })}
                    className="text-xs font-bold text-primary hover:underline"
                >
                    Limpiar todo
                </button>
            </div>

            {/* CERTIFIED TOGGLE (Primary Security Filter) */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 mb-6 relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldCheck className="h-24 w-24 text-indigo-900 dark:text-indigo-400" />
                </div>

                <label className="flex items-center justify-between cursor-pointer relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg ring-2 ring-white dark:ring-indigo-900 group-hover/card:scale-110 transition-transform duration-300">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-black text-indigo-950 dark:text-indigo-50 block text-sm tracking-tight">Clinkar</span>
                            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wide">Certificación Multivehículo</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-300 shadow-inner",
                        filters.certifiedOnly ? "bg-indigo-600" : "bg-slate-200 dark:bg-zinc-800"
                    )}>
                        <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300",
                            filters.certifiedOnly && "translate-x-5"
                        )} />
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.certifiedOnly || false}
                        onChange={(e) => setFilters({ ...filters, certifiedOnly: e.target.checked })}
                    />
                </label>
            </div>

            {/* FLASH SALE TOGGLE */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20 mb-6 relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all duration-300">
                {/* Background Pattern for "Pioneer" feel */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-12">
                        <path d="M50 0 L100 100 L0 100 Z" fill="currentColor" className="text-amber-900 dark:text-amber-400" />
                    </svg>
                </div>

                <label className="flex items-center justify-between cursor-pointer relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-500 dark:to-orange-500 flex items-center justify-center text-xl shadow-inner group-hover/card:scale-110 transition-transform duration-300 ring-2 ring-white dark:ring-zinc-900">🔥</div>
                        <div>
                            <span className="font-black text-amber-950 dark:text-amber-50 block text-sm tracking-tight">Clinkar Venta Flash</span>
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wide">Oportunidades Exclusivas</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-300 shadow-inner",
                        filters.flashSale ? "bg-amber-600" : "bg-slate-200 dark:bg-zinc-800"
                    )}>
                        <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300",
                            filters.flashSale && "translate-x-5"
                        )} />
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.flashSale || false}
                        onChange={(e) => setFilters({ ...filters, flashSale: e.target.checked })}
                    />
                </label>
            </div>

            {/* BORDER VEHICLES TOGGLE */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 mb-6 relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Globe className="h-20 w-20 text-indigo-900 dark:text-indigo-400" />
                </div>

                <label className="flex items-center justify-between cursor-pointer relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center text-xl shadow-inner group-hover/card:scale-110 transition-transform duration-300 ring-2 ring-white dark:ring-zinc-900">🌎</div>
                        <div>
                            <span className="font-black text-indigo-950 dark:text-indigo-50 block text-sm tracking-tight">Clinkar Autos Fronterizos</span>
                            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wide">Importados / Legalizados</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-300 shadow-inner",
                        filters.isBorder ? "bg-indigo-600" : "bg-slate-200 dark:bg-zinc-800"
                    )}>
                        <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300",
                            filters.isBorder && "translate-x-5"
                        )} />
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.isBorder || false}
                        onChange={(e) => setFilters({ ...filters, isBorder: e.target.checked })}
                    />
                </label>
            </div>

            {/* INVESTOR TOGGLE */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 mb-6 relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <TrendingDown className="h-20 w-20 text-emerald-900 dark:text-emerald-400" />
                </div>

                <label className="flex items-center justify-between cursor-pointer relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-500 dark:to-teal-500 flex items-center justify-center text-xl shadow-inner group-hover/card:scale-110 transition-transform duration-300 ring-2 ring-white dark:ring-zinc-900">💎</div>
                        <div>
                            <span className="font-black text-emerald-950 dark:text-emerald-50 block text-sm tracking-tight">Clinkar Solo Inversionistas</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wide">Ahorro &gt; 15% vs Mercado</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-300 shadow-inner",
                        filters.investorOnly ? "bg-emerald-600" : "bg-slate-200 dark:bg-zinc-800"
                    )}>
                        <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300",
                            filters.investorOnly && "translate-x-5"
                        )} />
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.investorOnly || false}
                        onChange={(e) => setFilters({ ...filters, investorOnly: e.target.checked })}
                    />
                </label>
            </div>

            {/* CATEGORY FILTER (The 4 Pillars of Clinkar) */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Tipo de Vehículo</span>
                    {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.category && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        {[
                            { id: 'Car', label: 'Autos y Camionetas', icon: '🚗', desc: 'Certificación 150 Puntos' },
                            { id: 'Motorcycle', label: 'Motos y Razers', icon: '🏍️', desc: 'Protocolo Especial Clinkar' },
                            { id: 'Heavy', label: 'Maquinaria y Pesados', icon: '🚜', desc: 'Tractos, Volcos, Agrícola' },
                            { id: 'Exotic', label: 'Marítimo y Aéreo', icon: '✈️', desc: 'Lanchas, Yates, Jets, Avionetas' },
                        ].map(type => (
                            <label key={type.id} className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                                <div className="mt-0.5">
                                    <div className={cn(
                                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                        filters.category?.includes(type.id) ? "bg-primary border-primary text-white" : "border-muted-foreground/30 group-hover:border-primary"
                                    )}>
                                        {filters.category?.includes(type.id) && <div className="h-2 w-2 bg-white rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.category?.includes(type.id)}
                                        onChange={(e) => {
                                            // Auto-clear makes/models when switching categories to prevent confusion
                                            const newCats = e.target.checked
                                                ? [...(filters.category || []), type.id]
                                                : filters.category?.filter((c: string) => c !== type.id);
                                            setFilters({ ...filters, category: newCats, makes: [], models: [] });
                                        }}
                                    />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <span>{type.icon}</span> {type.label}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{type.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* LOCATION FILTER */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('location')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Ubicación</span>
                    {openSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {openSections.location && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <input
                                placeholder="Buscar estado..."
                                className="w-full bg-secondary/50 rounded-lg py-2 pl-8 pr-3 text-xs border border-transparent focus:border-primary/20 outline-none"
                                value={locSearch}
                                onChange={(e) => setLocSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {MX_STATES
                                .filter(state => state.toLowerCase().includes(locSearch.toLowerCase()))
                                .map(state => (
                                    <label key={state} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={cn(
                                            "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                            filters.location?.includes(state) ? "bg-primary border-primary text-white" : "border-muted-foreground/30 group-hover:border-primary"
                                        )}>
                                            {filters.location?.includes(state) && <div className="h-2 w-2 bg-white rounded-sm" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={filters.location?.includes(state)}
                                            onChange={(e) => {
                                                const newLocs = e.target.checked
                                                    ? [...(filters.location || []), state]
                                                    : filters.location?.filter((l: string) => l !== state);
                                                setFilters({ ...filters, location: newLocs });
                                            }}
                                        />
                                        <span className="text-sm text-foreground/80 group-hover:text-foreground">{state}</span>
                                    </label>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* PRICE FILTER */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-4 group/btn">
                    <span className="font-bold text-sm group-hover/btn:text-primary transition-colors">Precio (MXN)</span>
                    {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.price && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    placeholder="Mín"
                                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl pl-6 pr-3 py-2.5 text-sm border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                    value={filters.minPrice || ''}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                            </div>
                            <span className="text-muted-foreground/50">—</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    placeholder="Máx"
                                    className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl pl-6 pr-3 py-2.5 text-sm border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                    value={filters.maxPrice || ''}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>
                        {/* Quick Price Suggestions */}
                        <div className="flex flex-wrap gap-2">
                            {['200k', '400k', '600k', '800k+'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        const val = p.includes('k') ? parseInt(p) * 1000 : 1000000;
                                        setFilters({ ...filters, maxPrice: val.toString() });
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-bold bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-lg border border-transparent hover:border-primary/20 transition-all"
                                >
                                    &lt; {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MAKE & MODEL FILTER (Dynamic based on Category) */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('make')} className="flex items-center justify-between w-full mb-4 group/btn">
                    <span className="font-bold text-sm group-hover/btn:text-primary transition-colors">Marca y Modelo</span>
                    {openSections.make ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.make && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        {/* Determine label based on selection */}
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-bold">
                            {filters.category?.length > 0 ? 'Marcas de tu selección' : 'Marcas Populares (Autos)'}
                        </p>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Buscar marca..."
                                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl py-2.5 pl-9 pr-3 text-xs border border-border/50 focus:border-primary/50 outline-none transition-all"
                                value={makeSearch}
                                onChange={(e) => setMakeSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {Object.keys(activeBrandsData)
                                .filter(make => make.toLowerCase().includes(makeSearch.toLowerCase()))
                                .map(make => (
                                    <div key={make} className="space-y-1">
                                        <div className={cn(
                                            "flex items-center justify-between group p-1.5 rounded-xl transition-colors",
                                            filters.makes?.includes(make) ? "bg-primary/5" : "hover:bg-secondary/40"
                                        )}>
                                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                <div className={cn(
                                                    "h-5 w-5 rounded-lg border flex items-center justify-center transition-all duration-300 shrink-0",
                                                    filters.makes?.includes(make)
                                                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20"
                                                        : "border-muted-foreground/30 group-hover:border-primary/50"
                                                )}>
                                                    {filters.makes?.includes(make) && (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={filters.makes?.includes(make)}
                                                    onChange={(e) => {
                                                        const newMakes = e.target.checked
                                                            ? [...(filters.makes || []), make]
                                                            : filters.makes?.filter((m: string) => m !== make);
                                                        setFilters({ ...filters, makes: newMakes });
                                                    }}
                                                />
                                                <span className={cn(
                                                    "text-sm font-medium transition-colors",
                                                    filters.makes?.includes(make) ? "text-primary font-bold" : "text-foreground/80 group-hover:text-foreground"
                                                )}>{make}</span>
                                            </label>
                                            <button
                                                onClick={() => toggleMakeExpansion(make)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-all",
                                                    expandedMakes.includes(make) ? "bg-primary/10 text-primary rotate-180" : "text-muted-foreground hover:bg-secondary"
                                                )}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* MODELS SUB-MENU */}
                                        {expandedMakes.includes(make) && (
                                            <div className="pl-4 pb-2 space-y-1 border-l-2 border-primary/20 ml-4 mt-1 animate-in slide-in-from-left-2 duration-200">
                                                {activeBrandsData[make].map(model => (
                                                    <label key={model} className={cn(
                                                        "flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-lg transition-all",
                                                        filters.models?.includes(model) ? "bg-primary/5 text-primary" : "hover:bg-secondary/40"
                                                    )}>
                                                        <div className={cn(
                                                            "h-3.5 w-3.5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                                            filters.models?.includes(model)
                                                                ? "bg-primary border-primary text-white"
                                                                : "border-muted-foreground/30 group-hover:border-primary/50"
                                                        )}>
                                                            {filters.models?.includes(model) && (
                                                                <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={filters.models?.includes(model)}
                                                            onChange={() => handleModelSelect(make, model)}
                                                        />
                                                        <span className={cn(
                                                            "text-xs transition-colors",
                                                            filters.models?.includes(model) ? "font-bold" : "text-muted-foreground group-hover:text-foreground"
                                                        )}>{model}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* YEAR FILTER */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('year')} className="flex items-center justify-between w-full mb-4 group/btn">
                    <span className="font-bold text-sm group-hover/btn:text-primary transition-colors">Año</span>
                    {openSections.year ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.year && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="relative w-full">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Desde"
                                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl pl-9 pr-3 py-2.5 text-sm border border-border/50 focus:border-primary/50 outline-none transition-all"
                                value={filters.minYear || ''}
                                onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                            />
                        </div>
                        <span className="text-muted-foreground/50">—</span>
                        <div className="relative w-full">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Hasta"
                                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl pl-9 pr-3 py-2.5 text-sm border border-border/50 focus:border-primary/50 outline-none transition-all"
                                value={filters.maxYear || ''}
                                onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* MILEAGE FILTER */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('mileage')} className="flex items-center justify-between w-full mb-4 group/btn">
                    <span className="font-bold text-sm group-hover/btn:text-primary transition-colors">Kilometraje (km)</span>
                    {openSections.mileage ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.mileage && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="relative w-full">
                            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Mín"
                                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl pl-9 pr-3 py-2.5 text-sm border border-border/50 focus:border-primary/50 outline-none transition-all"
                                value={filters.minMileage || ''}
                                onChange={(e) => setFilters({ ...filters, minMileage: e.target.value })}
                            />
                        </div>
                        <span className="text-muted-foreground/50">—</span>
                        <div className="relative w-full">
                            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Máx"
                                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background rounded-xl pl-9 pr-3 py-2.5 text-sm border border-border/50 focus:border-primary/50 outline-none transition-all"
                                value={filters.maxMileage || ''}
                                onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="pb-6">
                <button
                    onClick={() => {
                        // Scroll to top to see results
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3.5 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Aplicar Filtros
                </button>
            </div>
        </div>
    );
}
