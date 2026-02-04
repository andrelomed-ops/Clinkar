"use client";

import { useState } from "react";
import { Truck, MapPin, CheckCircle2, Clock, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogisticsSelectorProps {
    origin: string;
    destination?: string;
    carValue?: number;
    onSelectOption: (option: string, cost: number) => void;
}

interface LogisticsQuote {
    id: string;
    provider: string;
    type: 'platform' | 'enclosed' | 'express';
    price: number;
    eta: string;
    description: string;
    icon: any;
}

export function LogisticsSelector({ origin, onSelectOption }: LogisticsSelectorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const quotes: LogisticsQuote[] = [
        {
            id: 'clinkar-standard',
            provider: 'Clinkar Logistics',
            type: 'platform',
            price: 2500,
            eta: '2-3 días hábiles',
            description: 'Transporte en plataforma abierta con seguro incluido.',
            icon: Truck
        },
        {
            id: 'premium-enclosed',
            provider: 'Elite Transport',
            type: 'enclosed',
            price: 5800,
            eta: '3-4 días hábiles',
            description: 'Caja cerrada para máxima protección contra el clima y escombros.',
            icon: Shield
        },
        {
            id: 'express-now',
            provider: 'Flash Deliver',
            type: 'express',
            price: 4200,
            eta: '24-48 horas',
            description: 'Envío prioritario con seguimiento GPS en tiempo real.',
            icon: Clock
        }
    ];

    const handleSelect = (quote: LogisticsQuote | null) => {
        if (!quote) {
            setSelectedId('self_pickup');
            onSelectOption('Recolección Propia', 0);
            return;
        }
        setSelectedId(quote.id);
        onSelectOption(quote.provider, quote.price);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-slate-400" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Logística y Entrega</h2>
                        <p className="text-xs text-slate-500">Origen: {origin}</p>
                    </div>
                </div>
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors",
                        selectedId === 'self_pickup'
                            ? "bg-zinc-800 text-white border-zinc-800"
                            : "bg-transparent text-slate-400 border-border hover:border-slate-300"
                    )}
                >
                    {selectedId === 'self_pickup' ? 'Recolección Propia' : 'Yo paso por él'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {quotes.map((quote) => {
                    const isSelected = selectedId === quote.id;
                    const Icon = quote.icon;

                    return (
                        <div
                            key={quote.id}
                            onClick={() => handleSelect(quote)}
                            className={cn(
                                "relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group",
                                isSelected
                                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-indigo-100 ring-1 ring-indigo-600"
                                    : "border-border bg-white dark:bg-zinc-900 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                                        isSelected ? "bg-indigo-600 text-white" : "bg-secondary text-muted-foreground"
                                    )}>
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-extrabold text-foreground">{quote.provider}</h3>
                                            <span className="text-[9px] font-black uppercase tracking-tighter bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-muted-foreground">
                                                {quote.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                                            {quote.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 w-fit px-2 py-0.5 rounded-full">
                                            <Clock className="h-3 w-3" />
                                            {quote.eta}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xl font-black text-foreground">
                                        ${quote.price.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-medium">Cotización Clinkar</div>
                                    {isSelected && (
                                        <div className="mt-2 text-indigo-600 flex items-center justify-end gap-1 animate-in zoom-in duration-300">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
