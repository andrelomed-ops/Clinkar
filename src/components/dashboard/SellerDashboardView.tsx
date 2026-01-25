
import { CheckCircle2, Clock, Wallet, FileCheck } from "lucide-react";
import LEGAL_TEXTS from "@/data/legal_texts.json";

export default function SellerDashboardView() {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8">
            <header>
                <h2 className="text-lg font-bold text-slate-900">Estado Financiero del Auto</h2>
                <p className="text-sm text-slate-500">Resumen de costos y utilidades</p>
            </header>

            <div className="grid gap-4">
                {/* Inspección */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Costo de Inspección</p>
                            <p className="text-xs text-slate-400">Pagado anticipadamente</p>
                        </div>
                    </div>
                    <span className="font-bold text-slate-900">$900.00</span>
                </div>

                {/* Comisión Diferida */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Comisión de Éxito</p>
                            <p className="text-xs text-amber-600 font-medium">Diferida hasta la venta</p>
                        </div>
                    </div>
                    <span className="font-bold text-slate-900">$600.00</span>
                </div>

                {/* Estatus Legal */}
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Estatus Legal</p>
                            <p className="text-xs text-blue-600 font-medium">Verificado por Abogados</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-sm">
                        VERIFICADO
                    </span>
                </div>
            </div>

            {/* Disclaimers */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-[10px] text-slate-400 leading-tight">
                    * {LEGAL_TEXTS.NON_CUSTODIAL_DISCLAIMER}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                    * {LEGAL_TEXTS.PARTNER_WARNING}
                </p>
            </div>
        </div>
    );
}
