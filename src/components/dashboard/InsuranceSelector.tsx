"use client";

import { useState } from "react";
import { Shield, ShieldCheck, CheckCircle2, Star, Zap, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsuranceSelectorProps {
    carValue: number;
    onSelectOption: (option: string, cost: number) => void;
}

interface InsuranceQuote {
    id: string;
    provider: string;
    logoColor: string; // Tailwind color class for mock logo
    planName: string;
    price: number;
    deductible: string;
    features: string[];
    tag?: { text: string; color: string; icon: any };
}

export function InsuranceSelector({ carValue, onSelectOption }: InsuranceSelectorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Mock Quotes Engine based on Car Value
    const quotes: InsuranceQuote[] = [
        {
            id: 'qualitas-broad',
            provider: 'Quálitas',
            logoColor: 'bg-purple-600',
            planName: 'Paquete Amplia',
            price: Math.round(carValue * 0.038), // ~3.8%
            deductible: '3% Material / 0% Robo',
            features: ['Auto Sustituto', 'Asistencia Legal Premium'],
            tag: { text: 'Mayor Cobertura', color: 'bg-purple-100 text-purple-700', icon: Star }
        },
        {
            id: 'axa-smart',
            provider: 'AXA',
            logoColor: 'bg-blue-600',
            planName: 'Cobertura Esencial',
            price: Math.round(carValue * 0.029), // ~2.9%
            deductible: '5% Material / 10% Robo',
            features: ['Asistencia Vial 24/7', 'Gestoría Vehicular'],
            tag: { text: 'Mejor Precio', color: 'bg-green-100 text-green-700', icon: ThumbsUp }
        },
        {
            id: 'gnp-premium',
            provider: 'GNP Seguros',
            logoColor: 'bg-orange-600',
            planName: 'Premium Clinkar',
            price: Math.round(carValue * 0.034), // ~3.4%
            deductible: '5% Material / 5% Robo',
            features: ['Seguro Llantas', 'Responsabilidad Civil USA'],
            tag: { text: 'Recomendado', color: 'bg-blue-100 text-blue-700', icon: Zap }
        }
    ];

    const handleSelect = (quote: InsuranceQuote | null) => {
        if (!quote) {
            setSelectedId('declined');
            onSelectOption('declined', 0);
            return;
        }
        setSelectedId(quote.id);
        onSelectOption(quote.provider, quote.price);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Asegura tu Auto</h2>
                        <p className="text-xs text-slate-500">Compara y elige tu cobertura ideal.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors",
                        selectedId === 'declined'
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-transparent text-slate-400 border-slate-200 hover:border-slate-300"
                    )}
                >
                    {selectedId === 'declined' ? 'Seguro Rechazado' : 'Ya tengo seguro'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {quotes.map((quote) => {
                    const isSelected = selectedId === quote.id;
                    const Icon = quote.tag?.icon;

                    return (
                        <div
                            key={quote.id}
                            onClick={() => handleSelect(quote)}
                            className={cn(
                                "relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group",
                                isSelected
                                    ? "border-blue-600 bg-blue-50/50 shadow-blue-100 ring-1 ring-blue-600"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                        >
                            {/* TAG */}
                            {quote.tag && (
                                <div className={cn(
                                    "absolute -top-3 left-4 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm",
                                    quote.tag.color
                                )}>
                                    {Icon && <Icon className="h-3 w-3" />}
                                    {quote.tag.text}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* MOCK LOGO */}
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0", quote.logoColor)}>
                                        {quote.provider.substring(0, 3).toUpperCase()}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900">{quote.provider}</h3>
                                            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">{quote.planName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span>Deducible: <strong>{quote.deductible}</strong></span>
                                            <span className="hidden sm:inline text-slate-300">|</span>
                                            <span className="hidden sm:inline">{quote.features[0]}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xl font-black text-slate-900">${quote.price.toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium h-6">
                                        {isSelected ? (
                                            <span className="text-blue-600 font-bold flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Seleccionado
                                            </span>
                                        ) : (
                                            "Anual"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
