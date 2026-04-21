
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Car, Gauge, Palette, Settings, Fuel as FuelIcon, Calendar } from "lucide-react";

export interface VehicleFormData {
    make: string;
    model: string;
    year: string;
    version: string;
    km: string;
    color: string;
    transmission: string;
    fuel: string;
}

interface Props {
    data: VehicleFormData;
    onChange: (data: VehicleFormData) => void;
}

export function VehicleDataForm({ data, onChange }: Props) {
    const handleChange = (field: keyof VehicleFormData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Datos del Vehículo
                </h2>
                <p className="text-zinc-500 text-sm">
                    Cuéntanos los detalles técnicos para generar tu ficha técnica.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 mb-1">
                            <Car className="h-3 w-3" /> Marca
                        </Label>
                        <Input 
                            value={data.make}
                            onChange={(e) => handleChange('make', e.target.value)}
                            placeholder="Ej. Mazda"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 mb-1">
                            <Car className="h-3 w-3" /> Modelo
                        </Label>
                        <Input 
                            value={data.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                            placeholder="Ej. CX-5"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 mb-1">
                            <Calendar className="h-3 w-3" /> Año
                        </Label>
                        <Input 
                            value={data.year}
                            type="number"
                            onChange={(e) => handleChange('year', e.target.value)}
                            placeholder="2022"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 mb-1">
                            <Gauge className="h-3 w-3" /> Kilometraje
                        </Label>
                        <Input 
                            value={data.km}
                            type="number"
                            onChange={(e) => handleChange('km', e.target.value)}
                            placeholder="Ej. 15000"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-zinc-500 mb-1">
                            <Palette className="h-3 w-3" /> Color
                        </Label>
                        <Input 
                            value={data.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            placeholder="Rojo"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <Label className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-zinc-500">
                                <Settings className="h-3 w-3" /> Transmisión
                            </Label>
                            <select 
                                value={data.transmission}
                                onChange={(e) => handleChange('transmission', e.target.value)}
                                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            >
                                <option value="AUTOMATIC">Automática</option>
                                <option value="MANUAL">Manual</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-zinc-500">
                                <FuelIcon className="h-3 w-3" /> Combustible
                            </Label>
                            <select 
                                value={data.fuel}
                                onChange={(e) => handleChange('fuel', e.target.value)}
                                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            >
                                <option value="GASOLINE">Gasolina</option>
                                <option value="DIESEL">Diesel</option>
                                <option value="HYBRID">Híbrido</option>
                                <option value="ELECTRIC">Eléctrico</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
