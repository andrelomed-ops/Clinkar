"use client";

import { Globe, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportBadgeProps {
    type: 'FRONTERIZO' | 'IMPORTADO';
    className?: string;
}

export function ImportBadge({ type, className }: ImportBadgeProps) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-4 rounded-2xl border bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-500/5",
            type === 'FRONTERIZO' ? "border-amber-500/20" : "border-indigo-500/20",
            className
        )}>
            <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0",
                type === 'FRONTERIZO' ? "bg-amber-500 shadow-lg shadow-amber-500/20" : "bg-indigo-600 shadow-lg shadow-indigo-500/20"
            )}>
                <Globe className="h-5 w-5" />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Auto {type}</span>
                    <div className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-[8px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-0.5">
                        <ShieldCheck className="h-2 w-2" /> Protección Clinkar
                    </div>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 leading-tight mt-0.5">
                    {type === 'FRONTERIZO'
                        ? "Este vehículo se encuentra en zona fronteriza. Clinkar asegura el pago hasta que el auto llegue a tu ciudad."
                        : "Vehículo importado legalmente. Verificado por nuestra red de gestoría certificada."
                    }
                </p>
            </div>

            <AlertCircle className="h-4 w-4 text-zinc-300 cursor-help" />
        </div>
    );
}
