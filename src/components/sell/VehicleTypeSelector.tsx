
"use client";

import { VEHICLE_CATEGORIES, VehicleCategory } from "@/lib/vehicle-intake-config";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
    selected: VehicleCategory | null;
    onSelect: (category: VehicleCategory) => void;
}

export function VehicleTypeSelector({ selected, onSelect }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Clasificación del Vehículo
                </h2>
                <p className="text-zinc-500 text-sm">
                    Selecciona la procedencia legal de tu auto para preparar la documentación.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VEHICLE_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={cn(
                            "relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 group",
                            selected === cat.id
                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/30"
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="text-3xl">{cat.icon}</div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                        {cat.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                                        {cat.description}
                                    </p>
                                </div>
                            </div>
                            {selected === cat.id && (
                                <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
