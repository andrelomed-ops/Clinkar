"use client";

import { useState } from "react";
import { MessageSquare, Search, Book, ShieldCheck, CreditCard, Wrench, HelpCircle, ArrowRight, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'Vault' | 'Transaction' | 'Partners' | 'General';
}

const FAQS: FAQItem[] = [
    {
        id: "1",
        category: "Vault",
        question: "¿Clinkar guarda mi dinero?",
        answer: "No. Clinkar es un facilitador tecnológico. Los fondos son procesados y resguardados por instituciones financieras reguladas (como Stripe o socios bancarios). Clinkar solo actúa como el 'árbitro' que autoriza la liberación tras el cumplimiento de los protocolos."
    },
    {
        id: "2",
        category: "Transaction",
        question: "¿Qué pasa si el auto no coincide con el reporte?",
        answer: "La Bóveda protege tu pago. Si el auto tiene discrepancias mayores no reportadas, la transacción se cancela y los fondos se regresan íntegramente al comprador."
    },
    {
        id: "3",
        category: "Partners",
        question: "¿Cómo sé si el mecánico es confiable?",
        answer: "Todos los socios comerciales de Clinkar pasan por el Protocolo Quality Seal, que incluye shadow inspections y reputación vinculada."
    }
];

export function ClinkarSupportHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<any[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '¡Hola! Soy el asistente inteligente de Clinkar. ¿Tienes dudas sobre la Bóveda Digital, el anonimato o cómo gestionar tu envío?'
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsThinking(true);

        // Import dynamic brain logic
        const { generateAIBrainResponse } = await import("@/lib/ai-brain");

        // Simulate thinking delay for premium feel
        setTimeout(async () => {
            const { createBrowserClient } = await import("@/lib/supabase/client");
            const supabase = createBrowserClient();
            const aiResponse = await generateAIBrainResponse(userMsg.content, undefined, supabase);
            setMessages(prev => [...prev, aiResponse]);
            setIsThinking(false);
        }, 1200);
    };

    return (
        <div className="relative">
            {/* Widget Trigger */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/40 p-0 z-50 group border-4 border-white dark:border-zinc-900"
            >
                {isOpen ? <X className="h-8 w-8 text-white" /> : <Bot className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />}
                <span className="absolute -top-2 -right-1 bg-emerald-500 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900" />
            </Button>

            {isOpen && (
                <div className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
                        <div className="space-y-2">
                            <Badge className="bg-white/20 text-white border-0 text-[10px] font-black uppercase">Asistencia Digital 24/7</Badge>
                            <h3 className="text-2xl font-black tracking-tight">Soporte Clinkar</h3>
                            <p className="text-indigo-100/70 text-sm leading-tight">Privacidad total y transacciones seguras.</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-black/20">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "max-w-[85%] p-4 rounded-2xl text-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    msg.role === 'user'
                                        ? "bg-indigo-600 text-white ml-auto rounded-tr-none"
                                        : "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 mr-auto rounded-tl-none border border-slate-100 dark:border-white/5"
                                )}
                            >
                                <p className="leading-relaxed">{msg.content}</p>

                                {msg.recommendations && msg.recommendations.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Opciones Recomendadas:</p>
                                        {msg.recommendations.map((rec: any) => (
                                            <div key={rec.id} className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <div className="font-bold text-xs">{rec.make} {rec.model}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">${rec.price.toLocaleString()}</div>
                                                <div className="text-[9px] mt-1 text-emerald-500 font-bold uppercase tracking-tighter">{rec.reason}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isThinking && (
                            <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none mr-auto border border-slate-100 dark:border-white/5 animate-pulse flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
                                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-6 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Escribe tu duda aquí..."
                                className="w-full bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-2xl h-14 pl-6 pr-14 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-black outline-none transition-all"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isThinking}
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!inputValue.trim() || isThinking}
                                className="absolute right-2 top-2 h-10 w-10 text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 p-0 transition-transform active:scale-90"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest px-4">
                            Tus datos personales están protegidos por el Protocolo Clinkar.
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
}
