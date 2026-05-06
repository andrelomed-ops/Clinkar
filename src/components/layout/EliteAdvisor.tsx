"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, CarFront, Compass, HelpCircle, User, Mountain, Ship, Building2, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { generateOpsBrainResponse } from "@/lib/ops-brain";
import { generateAIBrainResponse } from "@/lib/ai-brain";
import { Vehicle } from "@/data/cars";
import { ALL_CARS } from "@/data/cars";
import { BotCar3D } from "@/components/ui/BotCar3D";

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: any[];
}

export function EliteAdvisor() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hola 👋 Soy tu asesor inteligente StarterKar. Cuéntame qué necesitas. Por ejemplo: "Busco un auto seguro para mi hija universitaria" o "Necesito una SUV familiar".'
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const QUICK_REPLIES = [
        "🎓 Busco mi primer auto",
        "👨‍👩‍👧‍👦 Familiar de 7 pasajeros",
        "⚡ Opciones eléctricas",
        "🏔️ Algo para off-road",
        "🏎️ Deportivos"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-elite-advisor', handleOpen);
        return () => window.removeEventListener('open-elite-advisor', handleOpen);
    }, []);

    const handleSend = async (customInput?: string) => {
        const text = customInput || input;
        if (!text.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        setTimeout(async () => {
            let response;
            if (text.toLowerCase().includes('credito') || text.toLowerCase().includes('financiamiento')) {
                response = { 
                    content: "En StarterKar actuamos como tu **Broker de Élite**. No somos el banco, somos tu enlace estratégico. Analizamos tu perfil y negociamos con nuestro pool de 5+ financieras aliadas para conseguirte la mejor tasa del mercado. \n\nPara iniciar, solo necesitas elegir un auto apto (2018+) y un asesor humano te guiará con los documentos cuando estés listo para avanzar en tu compra." 
                };
            } else {
                const { createBrowserClient } = await import("@/lib/supabase/client");
                const supabase = createBrowserClient();
                const aiRes = await generateAIBrainResponse(text, ALL_CARS, supabase);
                response = { content: aiRes.content, recommendations: (aiRes as any).recommendations };
            }

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content,
                recommendations: response.recommendations
            };
            setMessages(prev => [...prev, assistantMsg]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            {/* Chat Bubble - shown above the 3D bot when closed */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="relative cursor-pointer pointer-events-auto mr-2"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest">
                                Pídeme lo que buscas
                            </span>
                        </div>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-zinc-900 border-b border-r border-zinc-200 dark:border-zinc-800 rotate-45 transform origin-top-left -z-10" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Advisor Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="h-[540px] bg-white/20 dark:bg-zinc-900/40 backdrop-blur-[40px] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative mb-3 pointer-events-auto"
                        style={{ width: 'min(320px, calc(100vw - 2rem))' }}
                    >
                        {/* Header */}
                        <div className="bg-indigo-600/60 backdrop-blur-xl p-6 flex justify-between items-center relative overflow-hidden border-b border-white/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl -translate-y-16 translate-x-16 animate-pulse" />
                            <div className="flex items-center gap-3 relative z-10">
                                {messages.length > 1 && (
                                    <button onClick={() => setMessages([messages[0]])} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors mr-1">
                                        <ArrowLeft className="h-4 w-4 text-white" />
                                    </button>
                                )}
                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <CarFront className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm tracking-tight uppercase">Elite Advisor</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                        <span className="text-[9px] text-white/80 font-black uppercase tracking-[0.2em]">Soporte IA</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors relative z-10">
                                <X className="h-5 w-5" />
                            </button>
                        </div>


                                <div className="flex flex-col h-full overflow-hidden">
                                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-transparent">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                                <div className="flex flex-col max-w-[85%]">
                                                    <div className={cn(
                                                        "p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-xl backdrop-blur-md",
                                                        msg.role === 'user'
                                                            ? "bg-indigo-600/90 text-white rounded-tr-none border border-indigo-400/30"
                                                            : "bg-white/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border border-white/40 dark:border-zinc-700/50 rounded-tl-none"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                    
                                                    {msg.recommendations && (
                                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                                            {msg.recommendations.map((car: any, idx: number) => (
                                                                <a
                                                                    key={idx}
                                                                    href={`/buy/${car.id}`}
                                                                    className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-indigo-500 transition-all group"
                                                                >
                                                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-zinc-100 dark:bg-zinc-800">
                                                                        <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                    </div>
                                                                    <div className="px-1">
                                                                        <div className="font-black text-[9px] text-zinc-900 dark:text-white uppercase truncate tracking-tight">{car.make} {car.model}</div>
                                                                        <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                                                            ${car.price?.toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white/50 dark:bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none border border-white/40 dark:border-zinc-700/50 flex gap-1 backdrop-blur-md">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!isTyping && messages.length === 1 && (
                                            <div className="flex flex-wrap gap-2 pt-4">
                                                {QUICK_REPLIES.map((reply) => (
                                                    <button
                                                        key={reply}
                                                        onClick={() => handleSend(reply)}
                                                        className="text-[10px] px-3 py-2 rounded-full bg-white/40 dark:bg-zinc-900/40 border border-white/40 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all font-black uppercase tracking-tight backdrop-blur-md text-zinc-800 dark:text-zinc-100 shadow-sm"
                                                    >
                                                        {reply}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Input Section */}
                                    <div className="p-4 bg-white/5 backdrop-blur-3xl border-t border-zinc-200 dark:border-zinc-800">
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                placeholder="Ej. Auto seguro y familiar..."
                                                className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-white/40 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-[11px] font-bold focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none backdrop-blur-sm"
                                            />
                                            <button
                                                onClick={() => handleSend()}
                                                className="absolute right-2 h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D Bot Trigger */}
            <div className="pointer-events-auto">
                <BotCar3D onClick={() => setIsOpen(true)} isOpen={isOpen} />
            </div>
        </div>
    );
}
