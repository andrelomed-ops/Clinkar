"use client";

import { ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type WarrantyType = 'NONE' | 'STANDARD' | 'EXTENDED';

interface WarrantyOption {
    type: WarrantyType;
    title: string;
    price: number;
    duration: string;
    features: string[];
}

export function WarrantySelector({ carPrice, onSelect }: { carPrice: number, onSelect: (w: { type: WarrantyType, cost: number } | null) => void }) {

    // Calculate pricing dynamically
    const options: WarrantyOption[] = [
        {
            type: 'STANDARD',
            title: "Clinkar Estándar",
            price: 2500,
            duration: "90 Días",
            features: ["Motor y Transmisión", "Cobertura Nacional", "Grúa incluida"]
        },
        {
            type: 'EXTENDED',
            title: "Escudo Extendido",
            price: Math.max(5000, carPrice * 0.02), // Min 5k or 2%
            duration: "12 Meses",
            features: ["Cobertura Total", "Auto Sustituto", "Hoteles por avería"]
        }
    ];

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Protección Mecánica (Opcional)
            </div>

            <div className="grid grid-cols-1 gap-2">
                {options.map((opt) => (
                    <label
                        key={opt.type}
                        className="relative flex items-start gap-3 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 bg-white dark:bg-zinc-900/50 cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/5"
                    >
                        <input
                            type="radio"
                            name="warranty"
                            className="mt-1"
                            onChange={() => onSelect({ type: opt.type, cost: opt.price })}
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className={cn(
                                    "font-bold text-sm",
                                    opt.type === 'EXTENDED' ? "text-indigo-600 dark:text-indigo-400 flex items-center gap-1" : "text-zinc-900 dark:text-white"
                                )}>
                                    {opt.type === 'EXTENDED' && <Star className="h-3 w-3 fill-current" />}
                                    {opt.title}
                                </span>
                                <span className="font-black text-sm text-zinc-900 dark:text-white">
                                    +${opt.price.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 font-medium mb-1.5">{opt.duration}</p>
                            <div className="flex flex-wrap gap-1">
                                {opt.features.map(f => (
                                    <span key={f} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </label>
                ))}

                {/* Option: No Warranty */}
                <label className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer opacity-70 hover:opacity-100 transition-all">
                    <input
                        type="radio"
                        name="warranty"
                        className="mt-0.5"
                        defaultChecked
                        onChange={() => onSelect(null)}
                    />
                    <span className="text-xs font-medium text-zinc-500">
                        No agregar protección extra (Solo Bóveda).
                    </span>
                </label>
            </div>
        </div>
    );
}
