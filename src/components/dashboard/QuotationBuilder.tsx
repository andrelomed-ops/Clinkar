"use client";

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    AlertCircle,
    ChevronRight,
    DollarSign,
    Hammer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuotationItem {
    id: string;
    label: string;
    cost: number;
}

interface QuotationBuilderProps {
    failedItems: { id: string; label: string }[];
    onSave: (items: any[]) => void;
    onCancel: () => void;
}

export function QuotationBuilder({ failedItems, onSave, onCancel }: QuotationBuilderProps) {
    const [items, setItems] = useState<QuotationItem[]>(
        failedItems.map(item => ({ id: item.id, label: item.label, cost: 0 }))
    );

    const updateCost = (id: string, cost: number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, cost } : item));
    };

    const total = items.reduce((sum, item) => sum + item.cost, 0);

    const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

    return (
        <div className="animate-reveal space-y-10 py-6">
            {/* Alerta de Simplicidad */}
            <div className="bg-amber-100 dark:bg-amber-900/20 p-8 rounded-[2.5rem] flex items-center gap-6 border-b-4 border-amber-500/20">
                <div className="h-20 w-20 bg-amber-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                    <Hammer className="h-10 w-10 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Costo de Reparaciones</h2>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400 italic">Dinos cuánto costaría arreglar los problemas que encontraste.</p>
                </div>
            </div>

            {/* Lista de Fallas con Costos Gigantes */}
            <div className="space-y-6">
                {items.map((item, idx) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-xl"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center font-black">
                                    {idx + 1}
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter pt-2">{item.label}</h3>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">Escribe o elige un costo:</p>

                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={item.cost || ''}
                                        onChange={(e) => updateCost(item.id, Number(e.target.value))}
                                        className="w-full h-24 pl-16 pr-8 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] text-4xl font-black border-4 border-transparent focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                    />
                                </div>

                                {/* Botones de Monto Rápido */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {QUICK_AMOUNTS.map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => updateCost(item.id, amount)}
                                            className={cn(
                                                "py-4 rounded-2xl text-lg font-black transition-all active:scale-95 border-2",
                                                item.cost === amount
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-500"
                                            )}
                                        >
                                            +${amount}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resumen Final Gigante */}
            <div className="bg-zinc-950 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Total Presupuestado</p>
                    <h4 className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums">
                        ${total.toLocaleString()} <span className="text-2xl text-zinc-600 uppercase">mxn</span>
                    </h4>
                </div>

                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => onSave(items)}
                        disabled={total === 0}
                        className="h-24 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] text-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
                    >
                        TERMINAR Y ENVIAR
                        <ChevronRight className="h-8 w-8 ml-2" />
                    </Button>
                    <button
                        onClick={onCancel}
                        className="py-4 text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                        CANCELAR Y VOLVER
                    </button>
                </div>
            </div>
        </div>
    );
}
