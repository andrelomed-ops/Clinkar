"use client";

import { Car, ChevronRight, Clock, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    carName: string;
    year: number;
    price: number;
    status: "PENDING" | "FUNDS_HELD" | "RELEASED" | "CANCELLED";
    image?: string;
    role: "buyer" | "seller";
}

interface TransactionListProps {
    transactions: Transaction[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function TransactionList({ transactions, selectedId, onSelect }: TransactionListProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-end justify-between px-1 pb-2 border-b border-slate-100/50">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Tu Garage</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Operaciones Activas</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg h-10 w-10 shrink-0">
                    <span className="text-sm font-black text-slate-900 leading-none">{transactions.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 leading-none mt-0.5">Autos</span>
                </div>
            </div>

            <div className="grid gap-4">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        onClick={() => onSelect(tx.id)}
                        className={cn(
                            "group cursor-pointer rounded-xl border p-3 transition-all hover:shadow-md",
                            selectedId === tx.id
                                ? "bg-slate-900 border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                                : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {/* Car Icon / Image Placeholder */}
                            {/* Car Icon / Image Placeholder */}
                            <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 overflow-hidden",
                                selectedId === tx.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                                {tx.image ? (
                                    <img
                                        src={tx.image}
                                        alt={tx.carName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Car className="h-5 w-5" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1 mb-1">
                                    <h3 className={cn("font-bold text-sm truncate", selectedId === tx.id ? "text-white" : "text-slate-900")}>
                                        {tx.carName} {tx.year}
                                    </h3>
                                    <div className="flex">
                                        <span className={cn(
                                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider truncate max-w-full",
                                            tx.status === 'RELEASED' ? "bg-green-500/20 text-green-600" :
                                                tx.status === 'FUNDS_HELD' ? "bg-amber-500/20 text-amber-600" :
                                                    "bg-slate-500/20 text-slate-500"
                                        )}>
                                            {tx.status === 'RELEASED' ? 'Entregado' : tx.status === 'FUNDS_HELD' ? 'En Proceso' : 'Pendiente'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded border border-transparent shadow-sm",
                                            tx.role === 'buyer'
                                                ? "bg-blue-600 text-white"
                                                : "bg-purple-600 text-white"
                                        )}>
                                            {tx.role === 'buyer' ? 'Compra' : 'Venta'}
                                        </span>
                                        <p className={cn("text-[10px] font-medium truncate", selectedId === tx.id ? "text-slate-400" : "text-slate-500")}>
                                            ${tx.price.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* FINANCING BADGE (For Economy/Bank Portfolio) */}
                                    {tx.year >= 2017 && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[9px] text-emerald-600 font-bold truncate">
                                                Enganche desde ${(tx.price * 0.20).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedId === tx.id && <ChevronRight className="h-4 w-4 text-slate-500 shrink-0 mt-3" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
