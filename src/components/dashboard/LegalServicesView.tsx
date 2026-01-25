"use client";

import { Shield, FileText, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";

export function LegalServicesView() {
    // Mock Debt State
    const [debts] = useState([
        { id: 1, concept: "Tenencia 2025", amount: 1500, status: "PENDING" },
        { id: 2, concept: "Verificación Vehicular", amount: 650, status: "PENDING" },
        { id: 3, concept: "Multa CDMX - Exceso Velocidad", amount: 0, status: "PAID" },
    ]);

    const totalDebt = debts.reduce((acc, curr) => curr.status === "PENDING" ? acc + curr.amount : acc, 0);

    return (
        <section className="bg-background rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        Estatus Legal y Gestoría
                    </h2>
                    {totalDebt > 0 ? (
                        <div className="px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" />
                            Adeudos Detectados
                        </div>
                    ) : (
                        <div className="px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            Al Corriente
                        </div>
                    )}
                </div>
                <p className="text-muted-foreground">Monitor de obligaciones vehiculares y multas.</p>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-8">
                {/* Debt List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Detalle de Adeudos</h3>
                    <div className="space-y-3">
                        {debts.map((debt) => (
                            <div key={debt.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    {debt.status === "PAID" ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-red-500/30 flex items-center justify-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                        </div>
                                    )}
                                    <span className={`font-medium ${debt.status === "PAID" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                        {debt.concept}
                                    </span>
                                </div>
                                <span className="font-bold font-mono">
                                    ${debt.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action / Service Offer */}
                <div className="bg-secondary/50 rounded-3xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <Shield className="h-4 w-4" />
                            Servicio Clinkar
                        </div>
                        <h3 className="text-xl font-bold">¿Quieres entregar "Sin Adeudos"?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            No pierdas tiempo en filas. Clinkar puede realizar la gestión y pago de estos trámites por ti. El pago de estos servicios se realiza de forma adicional e independiente al precio de venta.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                        <div>
                            <span className="block text-[10px] font-bold text-muted-foreground uppercase">Total a pagar</span>
                            <span className="text-2xl font-black text-foreground">${totalDebt.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">(+ Comisión)</span>
                        </div>
                        <button className="h-12 px-6 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            Solicitar Gestoría
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
