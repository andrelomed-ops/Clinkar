"use client";

import { BadgeCheck } from "lucide-react";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
            <BadgeCheck className="w-5 h-5" />
            Imprimir Certificado (PDF)
        </button>
    );
}
