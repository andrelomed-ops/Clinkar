"use client";

import { useState } from "react";
import { 
    Search, Filter, DollarSign, TrendingUp, TrendingDown, 
    Save, Loader2, AlertTriangle, ArrowRight, Zap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCarAction } from "@/app/actions/cars";
import { toast } from "sonner";

interface AdminCommercialViewProps {
    inventory: any[];
}

export function AdminCommercialView({ inventory }: AdminCommercialViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editPrices, setEditPrices] = useState<Record<string, { price: number, minimum_price: number }>>({});

    const filteredInventory = inventory.filter(car => 
        car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePriceChange = (id: string, field: 'price' | 'minimum_price', value: string) => {
        const numValue = parseFloat(value) || 0;
        setEditPrices(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || { price: inventory.find(c => c.id === id)?.price || 0, minimum_price: inventory.find(c => c.id === id)?.minimum_price || 0 }),
                [field]: numValue
            }
        }));
    };

    const handleSavePricing = async (id: string) => {
        const pricing = editPrices[id];
        if (!pricing) return;

        setUpdatingId(id);
        try {
            const res = await updateCarAction(id, {
                price: pricing.price,
                minimum_price: pricing.minimum_price
            });

            if (res.success) {
                toast.success("Estrategia Comercial Actualizada", {
                    description: "Los precios han sido sincronizados en el marketplace."
                });
                // Remove from edit state to show it's saved
                const newEditPrices = { ...editPrices };
                delete newEditPrices[id];
                setEditPrices(newEditPrices);
            }
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar precios");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="GMV en Inventario" 
                    value={`$${(inventory.reduce((acc, car) => acc + (car.price || 0), 0) / 1000000).toFixed(1)}M`}
                    icon={TrendingUp}
                    color="text-indigo-400"
                />
                <StatCard 
                    title="Unidades Activas" 
                    value={inventory.length.toString()}
                    icon={Zap}
                    color="text-amber-400"
                />
                <StatCard 
                    title="Margen Piso (Promedio)" 
                    value={`${(inventory.reduce((acc, car) => acc + (car.minimum_price ? (1 - car.minimum_price / car.price) : 0), 0) / (inventory.length || 1) * 100).toFixed(1)}%`}
                    icon={Target}
                    color="text-emerald-400"
                />
            </div>

            {/* Control Bar */}
            <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por Marca, Modelo o ID..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="h-14 px-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Segmentos
                    </button>
                    <div className="px-6 py-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Modo Negociación Real-Time</span>
                    </div>
                </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/50 border-b border-zinc-800">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Vehículo / ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Precio Público (Target)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Precio Piso (Floor)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Comisión (3.5%)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredInventory.map((car) => {
                                const currentPrice = editPrices[car.id]?.price ?? car.price;
                                const currentMinPrice = editPrices[car.id]?.minimum_price ?? (car.minimum_price || car.price);
                                const isDirty = !!editPrices[car.id];
                                const commission = currentPrice * 0.035;

                                return (
                                    <tr key={car.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                                                    <img src={car.images?.[0] || '/placeholder-car.jpg'} className="w-full h-full object-cover" alt={car.make} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic tracking-tighter uppercase">{car.make} {car.model}</p>
                                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{car.year} • {car.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative w-44">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                                                <input 
                                                    type="number"
                                                    value={currentPrice}
                                                    onChange={(e) => handlePriceChange(car.id, 'price', e.target.value)}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-sm font-black italic tracking-tight focus:border-indigo-500/50 transition-all outline-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative w-44">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                                                <input 
                                                    type="number"
                                                    value={currentMinPrice}
                                                    onChange={(e) => handlePriceChange(car.id, 'minimum_price', e.target.value)}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-sm font-black italic tracking-tight text-rose-500 focus:border-rose-500/50 transition-all outline-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-emerald-500 italic tracking-tighter">${commission.toLocaleString()}</span>
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.1em]">Ganancia StarterKar</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => handleSavePricing(car.id)}
                                                disabled={!isDirty || updatingId === car.id}
                                                className={cn(
                                                    "h-12 w-full px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                                    isDirty 
                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500" 
                                                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                                )}
                                            >
                                                {updatingId === car.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Sincronizar
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredInventory.length === 0 && (
                    <div className="p-20 text-center border-t border-zinc-800">
                        <AlertTriangle className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">No se encontraron unidades para ajustar precio</p>
                    </div>
                )}
            </div>

            {/* Strategy Manifesto Footer */}
            <div className="p-10 bg-zinc-950 border border-zinc-800 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
                <div className="h-24 w-24 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center border border-indigo-600/20 shrink-0">
                    <Target className="h-10 w-10 text-indigo-500" />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h4 className="text-xl font-black italic tracking-tighter uppercase text-white">Estrategia Comercial de Alta Conversión</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl font-medium">
                        El <b>Precio Target</b> es el valor mostrado al público. El <b>Precio Piso</b> es el valor mínimo automatizado para ofertas directas y negociación de última milla. Mantener un margen sano asegura la liquidez del inventario.
                    </p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <div className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Rotación Target</p>
                        <p className="text-xl font-black text-white italic">21 Días</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
    return (
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</p>
                <div className={cn("p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:scale-110 transition-transform", color)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-4xl font-black italic tracking-tighter text-white">{value}</p>
        </div>
    );
}
