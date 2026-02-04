"use client";

import { useState } from "react";
import { Lightbulb, Rocket, Globe, Building2, Send, CheckCircle2, Sparkles, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ClinkarEvolutionHub() {
    const [suggestion, setSuggestion] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [category, setCategory] = useState<'Comprador' | 'Aliado' | 'Infraestructura'>('Comprador');

    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!suggestion.trim()) return;
        setSubmitted(true);
        console.log(`[Evolution Hub] New Idea from ${category}: ${suggestion}`);
        setTimeout(() => {
            setSubmitted(false);
            setSuggestion("");
            setIsOpen(false);
        }, 3000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {isOpen ? (
                <div className="bg-slate-900 border border-indigo-500/20 rounded-[2rem] p-6 w-[22rem] shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 h-48 w-48 bg-indigo-500/10 rounded-full blur-3xl" />

                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {submitted ? (
                        <div className="py-8 text-center space-y-4 animate-in zoom-in">
                            <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 text-white">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-black text-white">¡Idea Capturada!</h3>
                            <p className="text-emerald-100/60 text-xs px-4">Tu visión alimenta nuestra infraestructura.</p>
                        </div>
                    ) : (
                        <div className="relative z-10 space-y-4">
                            <header className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-indigo-400" />
                                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400">Motor de Evolución</h3>
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight">¿Qué mejoramos hoy?</h2>
                            </header>

                            <div className="flex gap-1">
                                {(['Comprador', 'Aliado', 'Infraestructura'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${category === cat
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <textarea
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                    placeholder="Ej: 'Pagos con cripto'..."
                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none placeholder:text-slate-600 transition-all font-medium"
                                />

                                <Button type="submit" className="w-full h-10 px-6 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all text-xs">
                                    Enviar Propuesta <Send className="ml-2 h-3 w-3" />
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="h-6 w-6 animate-pulse" />
                </button>
            )}
        </div>
    );
}
