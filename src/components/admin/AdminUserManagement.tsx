"use client";

import { Search, Users, Zap, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminUserManagementProps {
    users: any[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSearch: () => void;
    onUpdateRole: (userId: string, role: string, tier?: string | null, location?: string | null) => void;
}

export function AdminUserManagement({
    users,
    searchQuery,
    onSearchChange,
    onSearch,
    onUpdateRole
}: AdminUserManagementProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 space-y-6">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Gestión de Usuarios & Permisos</h3>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                        <input 
                            value={searchQuery} 
                            onChange={e => onSearchChange(e.target.value)} 
                            className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-2xl px-12 text-sm font-bold focus:border-indigo-500 transition-all outline-none" 
                            placeholder="Buscar por correo, nombre o ID..." 
                        />
                    </div>
                    <button onClick={onSearch} className="h-16 px-10 bg-white text-black font-black rounded-2xl text-xs uppercase hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5">Buscar</button>
                </div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid gap-4">
                    {users.map(u => (
                        <div key={u.id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between group hover:border-zinc-700 transition-all gap-6">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                                    u.role === 'admin' ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-500" :
                                    u.role === 'investor' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                    u.role === 'inspector' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                    "bg-zinc-950 border-zinc-800 text-zinc-500"
                                )}>
                                    <Users className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black italic tracking-tight uppercase">{u.full_name || 'Sin Nombre'}</h4>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{u.email || u.id}</p>
                                        {u.phone && (
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" /> {u.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded bg-zinc-950 text-[9px] font-black text-zinc-500 border border-zinc-800 uppercase">{u.role}</span>
                                        {u.role === 'investor' && (
                                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px] font-black text-amber-500 border border-amber-500/20 uppercase">TIER: {u.investor_tier || 'STARTER'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 gap-1 overflow-x-auto">
                                    <button 
                                        onClick={() => onUpdateRole(u.id, 'admin')} 
                                        className={cn("h-10 px-4 text-[9px] font-black rounded-xl uppercase transition-all whitespace-nowrap", u.role === 'admin' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-600 hover:text-zinc-300")}
                                    >ADMIN</button>
                                    <button 
                                        onClick={() => onUpdateRole(u.id, 'inspector', null, u.location || 'CDMX')} 
                                        className={cn("h-10 px-4 text-[9px] font-black rounded-xl uppercase transition-all whitespace-nowrap", u.role === 'inspector' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-600 hover:text-zinc-300")}
                                    >MECÁNICO</button>
                                    <button 
                                        onClick={() => onUpdateRole(u.id, 'buyer')} 
                                        className={cn("h-10 px-4 text-[9px] font-black rounded-xl uppercase transition-all whitespace-nowrap", u.role === 'buyer' ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-300")}
                                    >COMPRADOR</button>
                                </div>

                                <button 
                                    onClick={() => {
                                        const tier = window.prompt("Selecciona Tier: starter, pro, elite", u.investor_tier || "starter");
                                        if (tier) onUpdateRole(u.id, 'investor', tier.toLowerCase());
                                    }}
                                    className={cn(
                                        "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                                        u.role === 'investor' ? "bg-amber-500 text-black shadow-xl shadow-amber-500/20" : "bg-zinc-800 text-zinc-400 hover:bg-amber-500 hover:text-black"
                                    )}
                                >
                                    <Zap className="h-4 w-4" />
                                    INVERSIONISTA
                                </button>

                                <button 
                                    onClick={() => {
                                        if (window.confirm("¿ELIMINAR USUARIO PERMANENTEMENTE? Esta acción borrará su perfil y acceso.")) {
                                            toast.promise(
                                                fetch('/api/admin/users/delete', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ userId: u.id })
                                                }).then(res => {
                                                    if (!res.ok) throw new Error("Error al eliminar");
                                                    return res.json();
                                                }),
                                                {
                                                    loading: 'Eliminando usuario...',
                                                    success: 'Usuario eliminado del sistema',
                                                    error: 'Error al eliminar usuario'
                                                }
                                            );
                                        }
                                    }}
                                    className="h-12 w-12 bg-red-950/20 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
