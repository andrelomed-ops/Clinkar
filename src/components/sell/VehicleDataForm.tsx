
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
    // Marketplace Categories (Admin only)
    marketplace_category?: string;
    agency_name?: string;
    bonus_text?: string;
}

interface Props {
    data: VehicleFormData;
    onChange: (data: VehicleFormData) => void;
    isAdminMode?: boolean;
}

export function VehicleDataForm({ data, onChange, isAdminMode = false }: Props) {
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

            {isAdminMode && (
                <div className="bg-amber-500/5 dark:bg-amber-500/10 p-8 rounded-[2rem] border border-amber-500/20 space-y-6 animate-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-black italic shadow-lg shadow-amber-500/20">A</div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-amber-900 dark:text-amber-200">Clasificación de Mercado (Admin)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400">Categoría en Marketplace</Label>
                            <select 
                                value={data.marketplace_category || 'REGULAR'}
                                onChange={(e) => handleChange('marketplace_category', e.target.value)}
                                className="w-full h-12 px-4 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                            >
                                <option value="REGULAR">Venta Estándar (Usados)</option>
                                <option value="CERTIFIED">StarterKar Certificado</option>
                                <option value="FLASH_SALE">StarterKar Venta Flash 🔥</option>
                                <option value="BORDER">Autos Fronterizos 🌎</option>
                                <option value="INVESTOR">Solo Inversionistas 💎</option>
                                <option value="NEW_CAR">Auto Nuevo (Alianza Agencia) ⚡</option>
                            </select>
                        </div>

                        {data.marketplace_category === 'NEW_CAR' && (
                            <>
                                <div className="space-y-2">
                                    <Label className="font-bold text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400">Agencia de Alianza</Label>
                                    <Input 
                                        value={data.agency_name || ''}
                                        onChange={(e) => handleChange('agency_name', e.target.value)}
                                        placeholder="Ej. BMW Autowelt"
                                        className="h-12 rounded-xl border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="font-bold text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400">Beneficio Exclusivo (Tag)</Label>
                                    <Input 
                                        value={data.bonus_text || ''}
                                        onChange={(e) => handleChange('bonus_text', e.target.value)}
                                        placeholder="Ej. Seguro 1er año gratis / Mantenimiento incluido"
                                        className="h-12 rounded-xl border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
