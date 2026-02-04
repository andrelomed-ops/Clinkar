
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";

export function ProcessingOverlay({ isVisible, message = "Analizando Documento..." }: { isVisible: boolean, message?: string }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-300">
            <div className="relative mb-8">
                {/* Pulsing Brain Effect */}
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="relative h-24 w-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce-slow">
                    <BrainCircuit className="h-12 w-12 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-8 w-8 text-yellow-400 animate-spin-slow" />
                </div>
            </div>

            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {message}
            </h3>

            <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold uppercase tracking-widest">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando con IA
            </div>

            {/* Scanning Line Animation */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-scan" />
        </div>
    );
}
