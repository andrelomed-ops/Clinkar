
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car, Calendar, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { CAR_BRANDS_MODELS } from "@/lib/car-data";

export function SimpleIntakeForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "car", // car, moto, heavy, other
        make: "",
        model: "",
        year: ""
    });

    const handleContinue = () => {
        if (!formData.make || !formData.model || !formData.year) {
            toast.error("Por favor completa los campos del vehículo.");
            return;
        }

        if (parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
            toast.error("Año inválido.");
            return;
        }

        setLoading(true);
        const params = new URLSearchParams({
            make: formData.make,
            model: formData.model,
            year: formData.year,
            category: 'REGULAR' // Default category as it's agreed later
        });
        
        router.push(`/sell/onboarding?${params.toString()}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-xl mx-auto">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">
                    <Zap className="h-3 w-3 fill-current" /> Valuación Expertizada
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic leading-none">
                    Datos del <br />
                    <span className="text-indigo-600 dark:text-indigo-500">Vehículo.</span>
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Cuéntanos qué activo deseas certificar para la venta.
                </p>
            </div>

            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
                
                <div className="relative bg-white dark:bg-zinc-950 p-10 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] space-y-8">
                    
                    {/* Vehicle Type Selector - Premium Tabs */}
                    <div className="grid grid-cols-4 gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        {[
                            { id: 'car', label: 'Auto', icon: Car },
                            { id: 'moto', label: 'Moto', icon: Zap },
                            { id: 'heavy', label: 'Pesado', icon: Warehouse },
                            { id: 'other', label: 'Otro', icon: ShieldCheck }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setFormData({...formData, type: t.id, make: "", model: ""})}
                                className={cn(
                                    "flex flex-col items-center gap-2 py-4 rounded-xl transition-all duration-300",
                                    formData.type === t.id 
                                        ? "bg-white dark:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-indigo-600 dark:text-indigo-400 scale-[1.02] border border-zinc-200 dark:border-zinc-700" 
                                        : "text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
                                )}
                            >
                                <t.icon className={cn("h-5 w-5", formData.type === t.id ? "fill-current" : "")} />
                                <span className="text-[7px] font-black uppercase tracking-[0.2em]">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {/* Marca */}
                        <div className="space-y-3">
                            <Label className="px-1 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <span className="h-1 w-1 bg-indigo-500 rounded-full" /> {formData.type === 'other' ? 'Tipo de Activo' : 'Marca'}
                            </Label>
                            {formData.type === 'car' ? (
                                <div className="relative group/select">
                                    <select 
                                        value={formData.make}
                                        onChange={(e) => setFormData({...formData, make: e.target.value, model: ""})}
                                        className="w-full h-16 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-8 font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:bg-white dark:hover:bg-zinc-900"
                                    >
                                        <option value="">Selecciona Marca...</option>
                                        {Object.keys(CAR_BRANDS_MODELS).sort().map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                        <option value="OTRA">Otra marca...</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-hover/select:text-indigo-500 transition-colors pointer-events-none" />
                                </div>
                            ) : (
                                <Input 
                                    value={formData.make}
                                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                                    placeholder={formData.type === 'other' ? "Ej. Jet Privado, Yate..." : "Marca..."}
                                    className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-8 font-black focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                />
                            )}
                        </div>
                        
                        {/* Modelo */}
                        {(formData.type !== 'other') && (
                            <div className="space-y-3">
                                <Label className="px-1 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                    <span className="h-1 w-1 bg-indigo-500 rounded-full" /> Modelo / Versión
                                </Label>
                                {formData.type === 'car' && formData.make !== 'OTRA' && formData.make !== "" ? (
                                    <div className="relative group/select">
                                        <select 
                                            value={formData.model}
                                            onChange={(e) => setFormData({...formData, model: e.target.value})}
                                            className="w-full h-16 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-8 font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:bg-white dark:hover:bg-zinc-900"
                                        >
                                            <option value="">Selecciona Modelo...</option>
                                            {CAR_BRANDS_MODELS[formData.make]?.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                            <option value="OTRO">Otro modelo...</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-hover/select:text-indigo-500 transition-colors pointer-events-none" />
                                    </div>
                                ) : (
                                    <Input 
                                        value={formData.model}
                                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        placeholder="Versión específica..."
                                        className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-8 font-black focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                    />
                                )}
                            </div>
                        )}

                        {/* Año */}
                        <div className="space-y-3">
                            <Label className="px-1 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <span className="h-1 w-1 bg-indigo-500 rounded-full" /> Año de Fabricación
                            </Label>
                            <div className="relative group/select">
                                <select 
                                    value={formData.year}
                                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                                    className="w-full h-16 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-8 font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:bg-white dark:hover:bg-zinc-900"
                                >
                                    <option value="">Selecciona Año...</option>
                                    {Array.from({length: 40}, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-hover/select:text-indigo-500 transition-colors pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={loading}
                        className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] group flex flex-col gap-1 items-center justify-center overflow-hidden relative"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <span className="relative z-10">Continuar a la Agenda</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-[8px] font-black text-zinc-400 uppercase tracking-widest pt-4 border-t border-zinc-100 dark:border-zinc-900">
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 100% Seguro</span>
                        <span className="h-1 w-1 bg-zinc-300 dark:bg-zinc-800 rounded-full" />
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Valuación Real</span>
                    </div>
                </div>
            </div>

            <p className="text-center text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em] opacity-60">
                * La certificación física de 150 puntos es obligatoria para la venta elite.
            </p>
        </div>
    );
}
