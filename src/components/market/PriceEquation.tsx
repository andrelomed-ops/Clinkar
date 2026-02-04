import { TrendingDown, Info, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceEquationProps {
    data: {
        marketValue: number;
        deductions: {
            label: string;
            amount: number;
            type: 'mechanical' | 'esthetic' | 'admin';
        }[];
        finalPrice: number;
    };
}

export const PriceEquation = ({ data }: PriceEquationProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Transparencia de Precio
                </h3>
                <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute right-0 w-64 p-3 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl text-xs text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        El precio Clinkar se calcula restando las imperfecciones del valor real de mercado.
                    </div>
                </div>
            </div>

            {/* Waterfall Chart */}
            <div className="space-y-3 relative">
                {/* 1. Market Value (Anchor) */}
                <div className="relative">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-500">Valor de Mercado (Libro)</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400 line-through decoration-red-500/50">
                            {formatCurrency(data.marketValue)}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 w-full opacity-30"></div>
                    </div>
                </div>

                {/* 2. Deductions (The savings) */}
                {data.deductions.map((deduction, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-red-500/20 ml-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {deduction.label}
                            </span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                                - {formatCurrency(deduction.amount)}
                            </span>
                        </div>
                    </div>
                ))}

                {/* 3. Final Price (The Clinkar Price) */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 mb-1 block">
                                Precio Clinkar Certificado
                            </span>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(data.finalPrice)}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                                Ahorro Total: {formatCurrency(data.marketValue - data.finalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
