"use client";

import { Wrench, ShieldAlert } from "lucide-react";

interface RepairQuotationTableProps {
    failedItems: Array<{ id: string, label: string, cost: number, note: string }>;
    onCostChange: (id: string, cost: string) => void;
}

export function RepairQuotationTable({ failedItems, onCostChange }: RepairQuotationTableProps) {
    const total = failedItems.reduce((acc, item) => acc + (item.cost || 0), 0);

    if (failedItems.length === 0) return (
        <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-green-800">Unidad en Excelente Estado</h4>
            <p className="text-sm text-green-700/70">No se han detectado puntos críticos que requieran cotización de reparación.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-3">
                <Wrench className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold tracking-tight">Presupuesto de Recuperación</h3>
            </header>

            <div className="bg-background border border-border rounded-[2rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/20 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Punto de Falla</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Observación</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-40">Costo Estimado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {failedItems.map((item) => (
                            <tr key={item.id} className="hover:bg-secondary/5 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm tracking-tight">{item.label}</p>
                                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">ID: {item.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs text-muted-foreground font-medium">{item.note || "Sin notas adicionales"}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs">$</span>
                                        <input
                                            type="number"
                                            value={item.cost || ""}
                                            onChange={(e) => onCostChange(item.id, e.target.value)}
                                            className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl pl-6 pr-4 py-2 font-black text-primary text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-primary/5">
                            <td colSpan={2} className="px-6 py-6 text-right">
                                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inversión Total Estimada</span>
                            </td>
                            <td className="px-6 py-6">
                                <span className="text-xl font-black text-primary">${total.toLocaleString()} <span className="text-[10px]">MXN</span></span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

import { CheckCircle2 } from "lucide-react";
