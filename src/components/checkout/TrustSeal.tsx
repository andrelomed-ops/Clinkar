
import { Shield } from "lucide-react";
import LEGAL_TEXTS from "@/data/legal_texts.json";

export default function TrustSeal() {
    return (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 items-start">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-800">Garantía de Fondos Protegidos</p>
                <p className="text-xs text-emerald-600 leading-relaxed font-medium">
                    {LEGAL_TEXTS.TRUST_SEAL_TEXT.replace("Garantía de Fondos Protegidos: ", "")}
                </p>
            </div>
        </div>
    );
}
