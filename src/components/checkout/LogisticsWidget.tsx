"use client";

import { useState } from "react";
import { Truck, MapPin, Calculator, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShippingQuote {
    distanceKm: number;
    cost: number;
    estimatedDays: number;
    provider: string;
    origin: string;
    dest: string;
}

export function LogisticsWidget({ carLocation, onQuote }: { carLocation: string, onQuote: (quote: ShippingQuote | null) => void }) {
    const [zipCode, setZipCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState<ShippingQuote | null>(null);

    const handleCalculate = async () => {
        if (zipCode.length !== 5) return;
        setLoading(true);

        // Simulate API delay
        await new Promise(r => setTimeout(r, 1500));

        // Mock Calculation Logic (Same as Service)
        const distance = Math.floor(Math.random() * 1200) + 100;
        const cost = 1500 + (distance * 3.5);
        const finalCost = Math.ceil(cost / 100) * 100;

        const mockQuote: ShippingQuote = {
            distanceKm: distance,
            cost: finalCost,
            estimatedDays: Math.ceil(distance / 400) + 1,
            provider: 'Clinkar Logistics Network',
            origin: carLocation,
            dest: `CP ${zipCode}`
        };

        setQuote(mockQuote);
        onQuote(mockQuote);
        setLoading(false);
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-white font-bold text-sm">
                <Truck className="h-4 w-4 text-blue-600" />
                Envío a Domicilio
            </div>

            {!quote ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Tu Código Postal"
                        maxLength={5}
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleCalculate}
                        disabled={zipCode.length !== 5 || loading}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                    </button>
                </div>
            ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">Distancia ({quote.distanceKm}km)</span>
                        <span className="font-bold text-zinc-900 dark:text-white">${quote.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-500">
                        <span>Llegada estimada</span>
                        <span>{quote.estimatedDays} - {quote.estimatedDays + 2} días</span>
                    </div>
                    <button
                        onClick={() => { setQuote(null); onQuote(null); setZipCode(""); }}
                        className="text-[10px] text-red-500 hover:text-red-600 underline"
                    >
                        Cambiar destino
                    </button>
                </div>
            )}
        </div>
    );
}
