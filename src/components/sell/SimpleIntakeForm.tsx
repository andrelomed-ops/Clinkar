
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                    Datos de tu Auto
                </h2>
                <p className="text-zinc-500 text-sm font-medium">
                    Cuéntanos qué vehículo deseas certificar para la venta.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-zinc-400">
                            <Car className="h-3 w-3" /> Marca
                        </Label>
                        <div className="relative">
                            <select 
                                value={formData.make}
                                onChange={(e) => setFormData({...formData, make: e.target.value, model: ""})}
                                className="w-full h-14 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            >
                                <option value="">Selecciona Marca...</option>
                                {Object.keys(CAR_BRANDS_MODELS).sort().map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                                <option value="OTRA">Otra marca...</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-zinc-400">
                            <Car className="h-3 w-3" /> Modelo
                        </Label>
                        <div className="relative">
                            <select 
                                value={formData.model}
                                disabled={!formData.make || formData.make === 'OTRA'}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                className="w-full h-14 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                            >
                                <option value="">Selecciona Modelo...</option>
                                {formData.make && CAR_BRANDS_MODELS[formData.make] && CAR_BRANDS_MODELS[formData.make].map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                                <option value="OTRO">Otro modelo...</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                        {formData.make === 'OTRA' && (
                             <Input 
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                placeholder="Escribe marca y modelo..."
                                className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 font-bold mt-2"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-zinc-400">
                            <Calendar className="h-3 w-3" /> Año
                        </Label>
                        <select 
                            value={formData.year}
                            onChange={(e) => setFormData({...formData, year: e.target.value})}
                            className="w-full h-14 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        >
                            <option value="">Selecciona Año...</option>
                            {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Button
                    onClick={handleContinue}
                    disabled={loading}
                    className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] group"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                            Continuar a la Agenda <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>

                <p className="text-[10px] text-zinc-400 font-bold text-center uppercase tracking-tighter">
                    * La documentación se valida físicamente durante la revisión.
                </p>
            </div>
        </div>
    );
}
