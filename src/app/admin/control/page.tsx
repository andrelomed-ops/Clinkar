"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { 
    ShieldCheck, 
    Truck, 
    Banknote, 
    Copy, 
    MessageSquare, 
    FileText, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    Search,
    Filter,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MasterAdminControl() {
    const supabase = createBrowserClient();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED'>('ALL');

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                cars (make, model, year, price, seller_id),
                profiles:buyer_id (full_name, phone)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Error al cargar transacciones");
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    }

    const copyToWhatsApp = (tx: any) => {
        const message = `
🚨 *NUEVA MISIÓN ÁRBITRO STARTERKAR* 🚨

*AUTO:* ${tx.cars.make} ${tx.cars.model} (${tx.cars.year})
*VALOR:* $${tx.cars.price.toLocaleString()}
*TIPO:* Apartado de Garantía ($2,500)

*INSTRUCCIONES:*
1. Validar documentos originales.
2. Hacer firmar PAGARÉ por $${tx.cars.price.toLocaleString()} (Vigencia 60 días).
3. Hacer firmar CONVENIO DE EXCLUSIVIDAD.
4. Reportar éxito con fotos de documentos.

*ADMIN:* Coordinar cita con Comprador y Vendedor. No facilitar contacto entre ellos.
        `.trim();

        navigator.clipboard.writeText(message);
        toast.success("Mensaje copiado para WhatsApp");
    };

    const filteredTx = transactions.filter(tx => {
        if (filter === 'PENDING') return tx.status === 'DEPOSIT_PAID';
        if (filter === 'ASSIGNED') return tx.status === 'ARBITRATOR_ASSIGNED';
        return true;
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar variant="admin" />
            
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" /> Panel Administrativo Maestro
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                            Gestión de <span className="text-indigo-600">Operaciones.</span>
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">Control centralizado de apartados, árbitros y legalidad.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        {(['ALL', 'PENDING', 'ASSIGNED'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === f 
                                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" 
                                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                )}
                            >
                                {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Por Asignar' : 'Asignados'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ingresos por Apartados</p>
                        <p className="text-3xl font-black text-emerald-500">${(transactions.filter(t => t.status === 'DEPOSIT_PAID').length * 2500).toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Operaciones en Curso</p>
                        <p className="text-3xl font-black text-indigo-500">{transactions.length}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tasa de Cierre (Est.)</p>
                        <p className="text-3xl font-black text-zinc-900 dark:text-white">82%</p>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Clock className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Sincronizando con Base de Datos...</p>
                        </div>
                    ) : filteredTx.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 p-20 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-zinc-300 mx-auto" />
                            <p className="text-sm font-bold text-zinc-400">No hay operaciones que coincidan con el filtro.</p>
                        </div>
                    ) : (
                        filteredTx.map((tx) => (
                            <div 
                                key={tx.id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    {/* Car Info */}
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Truck className="h-8 w-8 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg uppercase italic tracking-tighter text-zinc-900 dark:text-white">
                                                {tx.cars.make} {tx.cars.model}
                                            </h3>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase">
                                                <span>ID: {tx.id.slice(0,8)}</span>
                                                <span className="h-1 w-1 bg-zinc-200 rounded-full" />
                                                <span>Valor: ${tx.cars.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-col gap-1">
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] w-fit",
                                            tx.status === 'DEPOSIT_PAID' ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                                        )}>
                                            {tx.status === 'DEPOSIT_PAID' ? 'Nuevo Apartado ($2,500)' : tx.status}
                                        </div>
                                        <p className="text-[9px] text-zinc-400 font-medium italic pl-1">
                                            Recibido el {new Date(tx.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => copyToWhatsApp(tx)}
                                            className="h-14 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Enviar a Árbitro
                                        </button>
                                        
                                        <button className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl flex items-center justify-center transition-all">
                                            <FileText className="h-5 w-5" />
                                        </button>
                                        
                                        <button className="h-14 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
                                            Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Disclaimer */}
                <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">
                        StarterKar Operative System v2.0 - Restricted Access
                    </p>
                </div>
            </main>
        </div>
    );
}
