import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualEscrowProps {
    amount: number;
    isSecured: boolean;
}

export const VisualEscrow = ({ amount, isSecured }: VisualEscrowProps) => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 border border-slate-700 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className={cn(
                    "h-20 w-20 rounded-full flex items-center justify-center border-4 transition-all duration-700",
                    isSecured
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                        : "bg-amber-500/10 border-amber-500/50 text-amber-400"
                )}>
                    {isSecured ? (
                        <Shield className="h-10 w-10 animate-pulse" />
                    ) : (
                        <Lock className="h-10 w-10" />
                    )}
                </div>

                <div>
                    <h3 className="text-slate-200 font-bold uppercase tracking-widest text-sm mb-1">
                        {isSecured ? "Fondos Asegurados" : "Bóveda en Espera"}
                    </h3>
                    <div className="text-3xl font-black text-white tracking-tight">
                        ${amount.toLocaleString()} <span className="text-sm font-medium text-slate-400">MXN</span>
                    </div>
                </div>

                {isSecured && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300">
                            Dinero protegido por Clinkar
                        </span>
                    </div>
                )}

                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    {isSecured
                        ? "El vendedor NO recibirá el dinero hasta que confirmes la recepción y satisfacción del vehículo."
                        : "Tu dinero se mantendrá en nuestra cuenta concentradora (Escrow) hasta el momento de la entrega."
                    }
                </p>
            </div>
        </div>
    );
};
