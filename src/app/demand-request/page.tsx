"use client";

import { useState } from "react";
import { Search, Car, DollarSign, MapPin, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demandService, DemandRequest } from "@/services/DemandService";
import { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const POPULAR_BRANDS = [
    "Toyota", "Honda", "Nissan", "Volkswagen", "Ford", "Chevrolet", 
    "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Mazda", "Jeep", "Tesla"
];

export default function DemandRequestPage() {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        yearMin: '',
        yearMax: '',
        budgetMin: '',
        budgetMax: '',
        location: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const demandData: Database['public']['Tables']['demand_registry']['Insert'] = {
                brand: formData.brand,
                model: formData.model || null,
                year_min: formData.yearMin ? parseInt(formData.yearMin) : null,
                year_max: formData.yearMax ? parseInt(formData.yearMax) : null,
                budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
                budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
                location: formData.location || null,
                notes: formData.notes || null,
                status: 'pending'
            };

            await demandService.createDemandRequest(demandData);
            setStep('success');
        } catch (error) {
            console.error('Error creating demand:', error);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-md w-full p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                        <div className="relative h-24 w-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/40">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">¡Petición Recibida!</h2>
                        <p className="text-zinc-500 font-medium">Estamos rastreando tu auto ideal en nuestra red nacional.</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-left">
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-4 text-center">Próximos Pasos</p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                </div>
                                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Notificación inmediata cuando un auto coincida.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                </div>
                                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Acceso exclusivo a preventas de inventario certificado.</p>
                            </li>
                        </ul>
                    </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild className="w-full sm:w-auto h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                <Link href="/dashboard">Ir al Dashboard</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold gap-2">
                                <a 
                                    href={`https://wa.me/525522120249?text=${encodeURIComponent(
                                        `Hola StarterKar 👋 Acabo de realizar una Búsqueda Maestro para un ${formData.brand} ${formData.model}. ¿Me podrían dar seguimiento?`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Confirmar por WhatsApp
                                </a>
                            </Button>
                        </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 pb-20 relative overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-20 pb-12 px-6 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-50">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] animate-reveal">
                        <Search className="h-3.5 w-3.5" />
                        <span>Búsqueda Inteligente StarterKar</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase animate-reveal stagger-1">
                        Dinos qué <span className="text-indigo-600">Buscas</span><br />
                        nosotros lo <span className="underline decoration-indigo-600 decoration-8 underline-offset-4">Encontramos</span>
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto animate-reveal stagger-2 leading-relaxed">
                        Si el auto de tus sueños no está en nuestro inventario actual, activamos nuestra red de aliados y tecnología IA para localizarlo por ti.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-8 animate-reveal stagger-3">
                    {/* Main Form Card */}
                    <div className="glass-card p-8 md:p-12 rounded-[3.5rem] border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-10">
                        
                        {/* Section: Brand & Model */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                    <Car className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Identidad del Vehículo</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block ml-2">Marcas Populares</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                                        {POPULAR_BRANDS.slice(0, 14).map(brand => (
                                            <button
                                                key={brand}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, brand })}
                                                className={cn(
                                                    "h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    formData.brand === brand 
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 scale-105" 
                                                        : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:text-indigo-600"
                                                )}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-4 relative">
                                        <Input
                                            placeholder="O ingresa otra marca aquí..."
                                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold pl-6 focus:ring-2 focus:ring-indigo-600 transition-all"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Modelo Específico</label>
                                        <Input
                                            placeholder="Ej: Corolla, Civic, Jetta"
                                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold pl-6"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Ubicación Preferida</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-600" />
                                            <Input
                                                placeholder="Ciudad o Estado"
                                                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold pl-12"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Year & Budget */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Rango & Presupuesto</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Year Range */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Rango de Años</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="number"
                                            placeholder="Desde"
                                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold text-center"
                                            value={formData.yearMin}
                                            onChange={(e) => setFormData({ ...formData, yearMin: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Hasta"
                                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold text-center"
                                            value={formData.yearMax}
                                            onChange={(e) => setFormData({ ...formData, yearMax: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Budget Range */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Presupuesto (MXN)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">$</span>
                                            <Input
                                                type="number"
                                                placeholder="Mín"
                                                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold pl-8"
                                                value={formData.budgetMin}
                                                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">$</span>
                                            <Input
                                                type="number"
                                                placeholder="Máx"
                                                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-bold pl-8"
                                                value={formData.budgetMax}
                                                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Notes */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" />
                                Detalles Adicionales
                            </label>
                            <Textarea
                                placeholder="Cuéntanos más... ¿Algún color en especial? ¿Equipamiento específico? ¿Versión preferida?"
                                className="min-h-[120px] rounded-3xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-medium p-6 resize-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="flex flex-col items-center space-y-6 pt-4">
                        <Button
                            type="submit"
                            disabled={!formData.brand || loading}
                            className="h-20 px-12 rounded-3xl text-lg font-black uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    Procesando Petición
                                </div>
                            ) : (
                                "Activar Búsqueda Maestro"
                            )}
                        </Button>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 text-center max-w-sm leading-relaxed">
                            Al activar la búsqueda, nuestro equipo verificará disponibilidad nacional y te notificará vía email/whatsapp.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}