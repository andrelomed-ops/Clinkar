"use client";

import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminBillingViewProps {
    transactions: any[];
    onRegisterPayment: (id: string, amount: number) => void;
}

export function AdminBillingView({ transactions, onRegisterPayment }: AdminBillingViewProps) {
    const releasedTx = transactions.filter(tx => tx.status === 'RELEASED');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Gestión de Cobranza (Success Fees)</h3>
                <div className="space-y-4">
                    {releasedTx.length > 0 ? releasedTx.map(tx => (
                        <div key={tx.id} className="p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between group hover:border-indigo-500/30 transition-all gap-6">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center border",
                                    tx.commission_paid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                )}>
                                    <DollarSign className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black italic uppercase">{tx.cars?.make} {tx.cars?.model}</h4>
                                    <div className="flex flex-wrap gap-4 mt-1">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">VENDEDOR: {tx.seller_email || tx.seller_id?.substring(0,8)}</p>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">MONTO: ${tx.car_price?.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">COMISIÓN (3.5%): ${(tx.car_price * 0.035).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {tx.commission_paid ? (
                                    <div className="text-right">
                                        <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">PAGADO</span>
                                        <p className="text-[9px] font-bold text-zinc-600 mt-2 uppercase">{tx.commission_payment_method} • {new Date(tx.commission_payment_date).toLocaleDateString()}</p>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => onRegisterPayment(tx.id, tx.car_price * 0.035)}
                                        className="h-14 px-8 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                                    >
                                        REGISTRAR PAGO
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                            <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">No hay liquidaciones pendientes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
