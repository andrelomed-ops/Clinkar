"use client";

import { useState } from "react";
import { Search, ShoppingCart, Package, ShieldCheck, Truck, ArrowRight, Zap, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Part {
    id: string;
    name: string;
    brand: string;
    price: number;
    retailPrice: number;
    stock: number;
    tier: 'OEM' | 'Certified' | 'Aftermarket';
    delivery: string;
}

const SAMPLE_PARTS: Part[] = [
    { id: "1", name: "Bomba de Agua - Kit Completo", brand: "BOSCH", price: 2450, retailPrice: 3800, stock: 12, tier: 'OEM', delivery: "2h" },
    { id: "2", name: "Balatas Delanteras (Cerámica)", brand: "BREMBO", price: 1800, retailPrice: 2600, stock: 5, tier: 'Certified', delivery: "4h" },
    { id: "3", name: "Filtro de Aceite Sintético", brand: "MANN", price: 450, retailPrice: 750, stock: 45, tier: 'OEM', delivery: "1h" },
];

export function ClinkarPartsMarketplace() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-white/5 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <ShoppingCart className="text-blue-400" /> Clinkar Parts <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest font-black">B2B Pro</span>
                    </h2>
                    <p className="text-slate-400 font-medium">Suministro certificado con precios preferenciales.</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar por VIN o Parte..."
                            className="bg-slate-800 border-white/10 rounded-2xl h-12 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-white/10 bg-slate-800 hover:bg-slate-700">
                        <Filter className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_PARTS.map((part) => (
                    <div key={part.id} className="bg-slate-800/50 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start">
                            <Badge className={cn(
                                "rounded-lg text-[10px] font-black uppercase tracking-widest",
                                part.tier === 'OEM' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            )}>
                                {part.tier}
                            </Badge>
                            <span className="text-xs text-slate-500 font-mono">CODE: {part.id}00X</span>
                        </div>

                        <div>
                            <h4 className="text-white font-bold leading-tight group-hover:text-blue-400 transition-colors">{part.name}</h4>
                            <p className="text-slate-500 text-xs font-black uppercase">{part.brand}</p>
                        </div>

                        <div className="bg-black/20 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-black block">Tu Precio PRO</span>
                                <span className="text-xl font-black text-white">${part.price.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-500 uppercase font-black block">Ahorro vs Retail</span>
                                <span className="text-sm font-black text-emerald-400 pr-1">-{Math.round((1 - part.price / part.retailPrice) * 100)}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Truck className="h-3 w-3 text-blue-400" /> Entrega: {part.delivery}
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-400">
                                <ShieldCheck className="h-3 w-3" /> Clinkar Verified
                            </div>
                        </div>

                        <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-900/20">
                            Comprar Ahora
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-500/5 rounded-3xl p-6 border border-blue-500/10 flex items-center gap-6">
                <div className="h-16 w-16 bg-blue-500/20 rounded-[1.5rem] flex items-center justify-center">
                    <Zap className="h-8 w-8 text-blue-400 fill-blue-400" />
                </div>
                <div className="flex-1">
                    <h5 className="text-white font-bold">Línea de Crédito Partner</h5>
                    <p className="text-slate-400 text-sm">Tienes un saldo disponible de <span className="text-white font-bold">$25,000 MXN</span> para compra de refacciones.</p>
                </div>
                <Button variant="link" className="text-blue-400 font-black flex items-center gap-2">
                    Gestionar Crédito <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}


