"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, HelpCircle, X, Sparkles, ArrowRight, Send, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { generateOpsBrainResponse } from "@/lib/ops-brain";

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function MagicSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showHumanButton, setShowHumanButton] = useState(false);
    const pathname = usePathname();
    const scrollRef = useRef<HTMLDivElement>(null);

    const getInitialAdvice = (path: string) => {
        if (path.includes("/transaction")) return "Hola 👋 Estoy aquí para resolver tus dudas técnicas sobre la Bóveda Digital o el proceso de pago. ¿En qué puedo ayudarte?";
        if (path.includes("/buy")) return "¡Hola! Si tienes dudas sobre cómo funciona nuestra revisión de 150 puntos o la seguridad de tu compra, pregúntame.";
        if (path.includes("/sell")) return "Resolveré tus dudas sobre la certificación y cómo Clinkar protege tu venta. ¿Qué quieres saber?";
        return "¡Hola! Soy tu Asistente de Procesos de Clinkar. ¿Tienes dudas sobre la Bóveda Digital, Seguridad o Pagos?";
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: getInitialAdvice(pathname)
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulation delay for "thinking"
        setTimeout(() => {
            const userMessageCount = messages.filter(m => m.role === 'user').length + 1;
            const response = generateOpsBrainResponse(input, userMessageCount);

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content
            };
            setMessages(prev => [...prev, assistantMsg]);
            setIsTyping(false);

            if (response.offerHuman) {
                setShowHumanButton(true);
            }
        }, 600);
    };

    const handleTalkToHuman = () => {
        const phone = "525522120249";
        const text = `Hola, necesito soporte humano personalizado. Estoy en la página: ${window.location.href}. Ya hablé con el Asistente de Operaciones pero sigo con dudas.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const isInspectionPage = pathname.includes("/dashboard/inspector/report-150");

    return (
        <div className={cn(
            "fixed right-8 z-[100] flex flex-col items-end gap-4 transition-all duration-500",
            // If on inspection page OR buy page (mobile), lift it up
            (isInspectionPage || (pathname.includes("/buy/") && !pathname.endsWith("/buy")))
                ? "bottom-24 md:bottom-8"
                : "bottom-8"
        )}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="w-80 md:w-96 bg-white dark:bg-zinc-900 border border-indigo-500/30 rounded-[2.5rem] shadow-[0_20px_60px_rgba(79,70,229,0.3)] flex flex-col overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-16 translate-x-16" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm tracking-tight">Asistente Clinkar</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors relative z-10 text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat Context / Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-zinc-950/50"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-border/50 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-border/50 flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input & Human Action */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-border/50 space-y-4">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Escribe tu duda operativa..."
                                    className="w-full h-12 pl-4 pr-12 rounded-2xl bg-secondary/50 dark:bg-zinc-800/50 border-none text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>

                            {showHumanButton && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30"
                                >
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center mb-3 font-medium italic">¿Todavía tienes dudas? Un experto puede ayudarte:</p>
                                    <button
                                        onClick={handleTalkToHuman}
                                        className="w-full h-10 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all group shadow-lg shadow-indigo-600/20"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        Hablar con un Humano <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                drag
                dragMomentum={false}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 flex items-center justify-center relative group"
            >
                <div className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20 group-hover:opacity-0" />
                {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
            </motion.button>
        </div >
    );
}
