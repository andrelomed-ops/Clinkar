"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Car, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAIBrainResponse } from "@/lib/ai-brain"; // Import from library
import { Vehicle } from "@/data/cars";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: any[];
}

interface StarterKarAIBotProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCar?: (carId: string) => void;
    inventory?: Vehicle[];
}

export function StarterKarAIBot({ isOpen, onClose, onSelectCar, inventory = [], mode = 'modal' }: StarterKarAIBotProps & { mode?: 'modal' | 'embedded' }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hola 👋 Soy tu asesor inteligente StarterKar. Cuéntame qué necesitas. Por ejemplo: "Busco un auto seguro para mi hija universitaria" o "Necesito una SUV familiar".'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [searchStep, setSearchStep] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const QUICK_REPLIES = [
        "🎓 Busco mi primer auto",
        "👨‍👩‍👧‍👦 Familiar de 7 pasajeros",
        "⚡ Opciones eléctricas",
        "🏔️ Algo para off-road",
        "🏎️ Deportivos destacados"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, searchStep]);

    const handleSend = async (customInput?: string) => {
        const messageText = customInput || input;
        if (!messageText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);
        
        // Simulated "Live Search" Sequence (Shorter for faster feel)
        setSearchStep("🔍 Analizando inventario...");
        setTimeout(() => setSearchStep("🎯 Filtrando opciones..."), 400);

        // Final Response
        setTimeout(async () => {
            try {
                const { createBrowserClient } = await import("@/lib/supabase/client");
                const supabase = createBrowserClient();
                
                const chatMessages = [
                    ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: messageText }
                ];

                const response = await fetch('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: chatMessages, context: inventory })
                });


                if (response.ok) {
                    const data = await response.json();
                    setMessages(prev => [...prev, { 
                        id: Date.now().toString(), 
                        role: 'assistant', 
                        content: data.response,
                        recommendations: data.recommendations
                    }]);
                } else {
                    const response = await generateAIBrainResponse(messageText, inventory, supabase);
                    setMessages(prev => [...prev, response]);
                }
            } catch {
                const { createBrowserClient } = await import("@/lib/supabase/client");
                const supabase = createBrowserClient();
                const response = await generateAIBrainResponse(messageText, inventory, supabase);
                setMessages(prev => [...prev, response]);
            }
            setIsTyping(false);
            setSearchStep(null);
        }, 900); // Reduced to 0.9s total
    };

    if (!isOpen && mode === 'modal') return null;

    const Container = mode === 'modal' ? 'div' : 'section';

    // Conditional classes based on mode
    const wrapperClasses = mode === 'modal'
        ? "fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-md flex items-center justify-center p-4"
        : "w-full h-[600px] flex flex-col border border-border rounded-3xl shadow-sm bg-card overflow-hidden";

    const innerClasses = mode === 'modal'
        ? "bg-white/10 dark:bg-zinc-900/10 backdrop-blur-[40px] w-full max-w-md h-[600px] rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-white/30 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        : "flex flex-col h-full";

    return (
        <Container className={wrapperClasses}>
            {mode === 'modal' ? (
                <div className={innerClasses}>
                    <Content
                        onClose={onClose}
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        handleSend={handleSend}
                        isTyping={isTyping}
                        searchStep={searchStep}
                        messagesEndRef={messagesEndRef}
                        mode={mode}
                        quickReplies={QUICK_REPLIES}
                        onSelectCar={onSelectCar}
                    />
                </div>
            ) : (
                <Content
                    onClose={onClose}
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    isTyping={isTyping}
                    searchStep={searchStep}
                    messagesEndRef={messagesEndRef}
                    mode={mode}
                    quickReplies={QUICK_REPLIES}
                    onSelectCar={onSelectCar}
                />
            )}
        </Container>
    );
}

function Content({ onClose, messages, input, setInput, handleSend, isTyping, searchStep, messagesEndRef, mode, onSelectCar }: any) {
    return (
        <>
            {/* Header */}
            <div className={`p-4 border-b bg-indigo-600/40 backdrop-blur-2xl text-white flex justify-between items-center ${mode === 'embedded' ? 'rounded-t-3xl' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center border border-white/10">
                        <CarFront className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold">Asesor StarterKar AI</h3>
                        <p className="text-xs text-white/70">Asesor Predictivo Inteligente</p>
                    </div>
                </div>
                {mode === 'modal' && (
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent backdrop-blur-sm">
                {messages.map((msg: Message) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                            "p-4 rounded-2xl text-sm font-black shadow-xl backdrop-blur-xl",
                            msg.role === 'user'
                                ? "bg-indigo-600/90 text-white rounded-tr-none border border-white/20"
                                : "bg-white/30 dark:bg-zinc-800/30 text-zinc-950 dark:text-zinc-100 border border-white/40 rounded-bl-none"
                        )}>
                            {msg.content}
                        </div>


                        {/* Recommendations Card - Compact Icons Version */}
                        {msg.recommendations && (
                            <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                                {msg.recommendations.map((car: any, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => onSelectCar?.(car.id)}
                                        className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg hover:border-indigo-500/50 transition-all cursor-pointer group active:scale-95"
                                    >
                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-zinc-200 dark:bg-zinc-800">
                                            {car.image ? (
                                                <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Car className="h-5 w-5 text-zinc-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-1">
                                            <div className="font-black text-[10px] text-zinc-900 dark:text-white uppercase truncate tracking-tight">{car.make} {car.model}</div>
                                            <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                                ${car.price?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {searchStep && (
                    <div className="flex items-center gap-2 ml-4 text-xs text-muted-foreground animate-pulse">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        {searchStep}
                    </div>
                )}

                {/* Quick Replies Buttons */}
                {!isTyping && !searchStep && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {messages.length === 1 && (messages[0] as any).id === 'welcome' && (
                            <>
                                {['🎓 Busco mi primer auto', '👨‍👩‍👧‍👦 Familiar de 7 pasajeros', '⚡ Opciones eléctricas'].map((reply) => (
                                    <button
                                        key={reply}
                                        onClick={() => handleSend(reply)}
                                        className="text-[10px] px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-border hover:border-indigo-500 hover:text-indigo-600 transition-all font-bold uppercase tracking-tight"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 dark:bg-zinc-900/5 backdrop-blur-3xl border-t border-white/10">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ej. Auto familiar seguro..."
                        className="flex-1 bg-secondary rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </>
    );
}
