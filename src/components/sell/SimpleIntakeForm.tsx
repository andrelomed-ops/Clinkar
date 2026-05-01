
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
    Car, 
    Calendar, 
    ArrowRight, 
    Loader2, 
    ChevronDown, 
    Zap, 
    Warehouse, 
    ShieldCheck,
    Cpu
} from "lucide-react";
import { toast } from "sonner";
import { CAR_BRANDS_MODELS } from "@/lib/car-data";
import { cn } from "@/lib/utils";

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
            category: 'REGULAR'
        });
        
        router.push(`/sell/onboarding?${params.toString()}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-xl mx-auto pb-20">
            {/* Header Section - Sophisticated & Clean */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">
                    <Cpu className="h-3 w-3" /> StarterKar Technology
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase italic leading-[0.9] select-none">
                    Certificación de <br />
                    <span className="text-indigo-600 dark:text-indigo-500">Activos Elite.</span>
                </h2>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                    Precisión algorítmica para la valuación de tu vehículo.
                </p>
            </div>

            <div className="relative">
                {/* Main Container - Solid Luxury Minimalism */}
                <div className="bg-white dark:bg-zinc-900/50 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
                    
                    <div className="space-y-10">
                        {/* Elegant Category Selector */}
                        <div className="flex items-center justify-between p-1 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
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
                                        "flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[1.8rem] transition-all duration-300",
                                        formData.type === t.id 
                                            ? "bg-white dark:bg-zinc-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]" 
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    )}
                                >
                                    <t.icon className="h-5 w-5" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{t.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-8">
                            {/* Inputs - Minimal & Precise */}
                            <div className="space-y-3">
                                <Label className="px-1 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                    <span className="h-1 w-1 bg-indigo-500 rounded-full" /> {formData.type === 'other' ? 'Activo' : 'Marca'}
                                </Label>
                                <div className="relative group">
                                    {formData.type === 'car' ? (
                                        <div className="relative">
                                            <select 
                                                value={formData.make}
                                                onChange={(e) => setFormData({...formData, make: e.target.value, model: ""})}
                                                className="w-full h-16 appearance-none rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-8 font-black text-xs focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700"
                                            >
                                                <option value="">SELECCIONAR...</option>
                                                {Object.keys(CAR_BRANDS_MODELS).sort().map(brand => (
                                                    <option key={brand} value={brand}>{brand}</option>
                                                ))}
                                                <option value="OTRA">OTRA MARCA</option>
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    ) : (
                                        <Input 
                                            value={formData.make}
                                            onChange={(e) => setFormData({...formData, make: e.target.value})}
                                            placeholder={formData.type === 'other' ? "EJ. AERONAVE, EMBARCACIÓN..." : "MARCA..."}
                                            className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-8 font-black focus:ring-2 focus:ring-indigo-500/10 text-xs transition-all placeholder:text-zinc-300"
                                        />
                                    )}
                                </div>
                            </div>
                            
                            {/* Modelo */}
                            {(formData.type !== 'other') && (
                                <div className="space-y-3">
                                    <Label className="px-1 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                        <span className="h-1 w-1 bg-indigo-500 rounded-full" /> Modelo
                                    </Label>
                                    <div className="relative group">
                                        {formData.type === 'car' && formData.make !== 'OTRA' && formData.make !== "" ? (
                                            <div className="relative">
                                                <select 
                                                    value={formData.model}
                                                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                                                    className="w-full h-16 appearance-none rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-8 font-black text-xs focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700"
                                                >
                                                    <option value="">SELECCIONAR MODELO</option>
                                                    {CAR_BRANDS_MODELS[formData.make]?.map(model => (
                                                        <option key={model} value={model}>{model}</option>
                                                    ))}
                                                    <option value="OTRO">OTRO MODELO</option>
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        ) : (
                                            <Input 
                                                value={formData.model}
                                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                                placeholder="VERSIÓN..."
                                                className="h-16 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-8 font-black focus:ring-2 focus:ring-indigo-500/10 text-xs transition-all"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Año */}
                            <div className="space-y-3">
                                <Label className="px-1 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                    <span className="h-1 w-1 bg-indigo-500 rounded-full" /> Año
                                </Label>
                                <div className="relative group">
                                    <select 
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                        className="w-full h-16 appearance-none rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-8 font-black text-xs focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700"
                                    >
                                        <option value="">AÑO</option>
                                        {Array.from({length: 40}, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleContinue}
                                disabled={loading}
                                className="w-full h-20 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                    <>
                                        Continuar Proceso <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-[8px] font-black text-zinc-400 uppercase tracking-widest pt-6 border-t border-zinc-50 dark:border-zinc-800">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Certificado</span>
                            <span className="h-1 w-1 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                            <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-500" /> Valuación Real</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] opacity-40">
                Experiencia StarterKar Elite 2026
            </p>
        </div>
    );
}
