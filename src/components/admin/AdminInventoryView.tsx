"use client";

import { 
    Search, Filter, Plus, Printer, Trash2, FileText, Loader2, ShieldCheck, MapPin, Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_MAP } from "@/lib/status-map";

interface AdminInventoryViewProps {
    inventory: any[];
    actionLoading: string | null;
    onEdit: (car: any) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
    onPrintCedula: (id: string) => void;
}

export function AdminInventoryView({ 
    inventory, 
    actionLoading, 
    onEdit, 
    onDelete, 
    onCreate,
    onPrintCedula
}: AdminInventoryViewProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Inventario Activo</h3>
                    <p className="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest">Gestión de unidades publicadas y reservadas.</p>
                </div>
                <button 
                    onClick={onCreate}
                    className="h-14 px-8 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 shadow-xl shadow-white/5 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Publicación
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {inventory.map((car) => (
                    <div key={car.id} className="group relative bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-2xl">
                        <div className="aspect-video relative overflow-hidden">
                            <img src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={car.make} />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                            <div className={cn(
                                "absolute top-6 right-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
                                STATUS_MAP[car.status]?.color || 'bg-zinc-500/10 border-zinc-500/20'
                            )}>
                                {STATUS_MAP[car.status]?.label || car.status}
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xl font-black italic tracking-tighter uppercase">{car.make} {car.model}</h4>
                                <span className="text-[10px] font-black text-indigo-400">ID: {car.id.slice(0, 8)}</span>
                            </div>
                            <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> {car.year} • <MapPin className="h-3 w-3" /> {car.location}
                            </p>
                            
                            {car.provenance && car.provenance !== 'original' && (
                                <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 w-fit uppercase">
                                    <Clock className="h-3 w-3" /> {car.provenance}
                                </div>
                            )}

                            <p className="text-2xl font-black mt-6 tracking-tighter italic">${car.price?.toLocaleString()}</p>
                            
                            <div className="flex gap-2 mt-8">
                                <button 
                                    onClick={() => onEdit(car)}
                                    className="flex-1 h-12 bg-zinc-800 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-600 transition-all border border-zinc-700 hover:border-indigo-500 flex items-center justify-center gap-2 shadow-xl shadow-black/20"
                                >
                                    <FileText className="h-4 w-4" />
                                    EDITAR
                                </button>
                                <button 
                                    onClick={() => onPrintCedula(car.id)}
                                    className="h-12 w-12 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                                    title="Imprimir Cédula"
                                >
                                    <Printer className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => onDelete(car.id)}
                                    disabled={actionLoading === car.id}
                                    className="h-12 w-12 bg-red-900/10 border border-red-900/30 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                                >
                                    {actionLoading === car.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
