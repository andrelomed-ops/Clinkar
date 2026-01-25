"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, MapPin, Calendar, Gauge } from "lucide-react";
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
                        minYear: '', maxYear: '', minMileage: '', maxMileage: '', flashSale: false // Reset
                    })}
                    className="text-xs font-bold text-primary hover:underline"
                >
                    Limpiar todo
                </button>
            </div>

            {/* FLASH SALE TOGGLE */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 mb-6 relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all duration-300">
                {/* Background Pattern for "Pioneer" feel */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-12">
                        <path d="M50 0 L100 100 L0 100 Z" fill="currentColor" className="text-amber-900" />
                    </svg>
                </div>

                <label className="flex items-center justify-between cursor-pointer relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-xl shadow-inner group-hover/card:scale-110 transition-transform duration-300 ring-2 ring-white">🔥</div>
                        <div>
                            <span className="font-black text-amber-950 block text-sm tracking-tight">Clinkar Flash Sale</span>
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">Oportunidades Exclusivas</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-300 shadow-inner",
                        filters.flashSale ? "bg-amber-600" : "bg-slate-200"
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

            {/* CATEGORY FILTER (The 4 Pillars of Clinkar) */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Tipo de Vehículo</span>
                    {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.category && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        {[
                            { id: 'Car', label: 'Autos y Camionetas', icon: '🚗', desc: 'Sedan, SUV, Pickup, Van' },
                            { id: 'Motorcycle', label: 'Motos y Razers', icon: '🏍️', desc: 'Deportivas, Chopper, ATV, UTV' },
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
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Precio (MXN)</span>
                    {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.price && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                        <input
                            type="number"
                            placeholder="Mínimo"
                            className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-sm border border-transparent focus:border-primary/20 outline-none"
                            value={filters.minPrice || ''}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                            type="number"
                            placeholder="Máximo"
                            className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-sm border border-transparent focus:border-primary/20 outline-none"
                            value={filters.maxPrice || ''}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        />
                    </div>
                )}
            </div>

            {/* MAKE & MODEL FILTER (Dynamic based on Category) */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('make')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Marca y Modelo</span>
                    {openSections.make ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.make && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        {/* Determine label based on selection */}
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-bold">
                            {filters.category?.length > 0 ? 'Marcas de tu selección' : 'Marcas Populares (Autos)'}
                        </p>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <input
                                placeholder="Buscar marca..."
                                className="w-full bg-secondary/50 rounded-lg py-2 pl-8 pr-3 text-xs border border-transparent focus:border-primary/20 outline-none"
                                value={makeSearch}
                                onChange={(e) => setMakeSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {Object.keys(activeBrandsData)
                                .filter(make => make.toLowerCase().includes(makeSearch.toLowerCase()))
                                .map(make => (
                                    <div key={make} className="space-y-1">
                                        <div className="flex items-center justify-between group">
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <div className={cn(
                                                    "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                                    filters.makes?.includes(make) ? "bg-primary border-primary text-white" : "border-muted-foreground/30 group-hover:border-primary"
                                                )}>
                                                    {filters.makes?.includes(make) && <div className="h-2 w-2 bg-white rounded-sm" />}
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
                                                <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground">{make}</span>
                                            </label>
                                            <button
                                                onClick={() => toggleMakeExpansion(make)}
                                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
                                            >
                                                <ChevronDown className={cn("h-3 w-3 transition-transform", expandedMakes.includes(make) && "rotate-180")} />
                                            </button>
                                        </div>

                                        {/* MODELS SUB-MENU */}
                                        {expandedMakes.includes(make) && (
                                            <div className="pl-6 space-y-1 border-l-2 border-border/50 ml-2">
                                                {activeBrandsData[make].map(model => (
                                                    <label key={model} className="flex items-center gap-2 cursor-pointer group py-0.5">
                                                        <div className={cn(
                                                            "h-3 w-3 rounded-sm border flex items-center justify-center transition-colors shrink-0",
                                                            filters.models?.includes(model) ? "bg-primary border-primary text-white" : "border-muted-foreground/30 group-hover:border-primary"
                                                        )}>
                                                            {filters.models?.includes(model) && <div className="h-1.5 w-1.5 bg-white rounded-[1px]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={filters.models?.includes(model)}
                                                            onChange={() => handleModelSelect(make, model)}
                                                        />
                                                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{model}</span>
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
                <button onClick={() => toggleSection('year')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Año</span>
                    {openSections.year ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.year && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                        <div className="relative w-full">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Desde"
                                className="w-full bg-secondary/50 rounded-xl pl-8 pr-3 py-2 text-sm border border-transparent focus:border-primary/20 outline-none"
                                value={filters.minYear || ''}
                                onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                            />
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="relative w-full">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Hasta"
                                className="w-full bg-secondary/50 rounded-xl pl-8 pr-3 py-2 text-sm border border-transparent focus:border-primary/20 outline-none"
                                value={filters.maxYear || ''}
                                onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* MILEAGE FILTER */}
            <div className="border-b border-border/50 pb-6">
                <button onClick={() => toggleSection('mileage')} className="flex items-center justify-between w-full mb-4">
                    <span className="font-bold text-sm">Kilometraje (km)</span>
                    {openSections.mileage ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openSections.mileage && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                        <div className="relative w-full">
                            <Gauge className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Mín"
                                className="w-full bg-secondary/50 rounded-xl pl-8 pr-3 py-2 text-sm border border-transparent focus:border-primary/20 outline-none"
                                value={filters.minMileage || ''}
                                onChange={(e) => setFilters({ ...filters, minMileage: e.target.value })}
                            />
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="relative w-full">
                            <Gauge className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="number"
                                placeholder="Máx"
                                className="w-full bg-secondary/50 rounded-xl pl-8 pr-3 py-2 text-sm border border-transparent focus:border-primary/20 outline-none"
                                value={filters.maxMileage || ''}
                                onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="pb-6">
                <button className="w-full py-3 bg-secondary rounded-xl font-bold text-sm hover:bg-secondary/80 transition-colors">
                    Actualizar
                </button>
            </div>
        </div>
    );
}
