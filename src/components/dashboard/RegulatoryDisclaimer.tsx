"use client";

import { Info } from "lucide-react";

export function RegulatoryDisclaimer() {
    return (
        <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-400">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-300" />
            <p className="leading-relaxed">
                <strong className="font-semibold text-slate-500">Aviso Legal:</strong> Clinkar opera exclusivamente como enlace tecnológico y no es una entidad financiera.
                Las simulaciones de crédito son informativas y están basadas en tasas anuales promedio del mercado (14% - 18% anual).
                La aprobación final, tasa de interés real y condiciones del crédito están sujetas exclusivamente a la evaluación de riesgo
                y políticas de la institución financiera seleccionada. Clinkar no garantiza la aprobación del crédito.
            </p>
        </div>
    );
}
