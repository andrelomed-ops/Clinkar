"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAIBrainResponse } from "@/lib/ai-brain"; // Import from library
import { Vehicle } from "@/data/cars";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: any[];
}

interface ClinkarAIAdvisorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCar?: (carId: string) => void;
    inventory?: Vehicle[];
}

export function ClinkarAIAdvisor({ isOpen, onClose, onSelectCar, inventory = [], mode = 'modal' }: ClinkarAIAdvisorProps & { mode?: 'modal' | 'embedded' }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hola 👋 Soy tu asesor inteligente Clinkar. Cuéntame qué necesitas. Por ejemplo: "Busco un auto seguro para mi hija universitaria" o "Necesito una SUV familiar".'
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
        setSearchStep("🔍 Iniciando búsqueda en la web...");

        // Simulated "Live Search" Sequence
        setTimeout(() => setSearchStep("🌐 Consultando bases de datos globales..."), 1000);
        setTimeout(() => setSearchStep("🧠 Cruzando tendencias de mercado..."), 2000);
        setTimeout(() => setSearchStep("🎯 Filtrando inventario disponible..."), 3000);

        // Final Response
        setTimeout(async () => {
            const { createBrowserClient } = await import("@/lib/supabase/client");
            const supabase = createBrowserClient();
            const response = await generateAIBrainResponse(messageText, inventory, supabase);
            setMessages(prev => [...prev, response]);
            setIsTyping(false);
            setSearchStep(null);
        }, 4000); // 4 seconds total "search" time
    };

    if (!isOpen && mode === 'modal') return null;

    const Container = mode === 'modal' ? 'div' : 'section';

    // Conditional classes based on mode
    const wrapperClasses = mode === 'modal'
        ? "fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
        : "w-full h-[600px] flex flex-col border border-border rounded-3xl shadow-sm bg-card overflow-hidden";

    const innerClasses = mode === 'modal'
        ? "bg-background w-full max-w-md h-[600px] rounded-[2rem] shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
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
            <div className={`p-4 border-b bg-primary text-primary-foreground flex justify-between items-center ${mode === 'embedded' ? 'rounded-t-3xl' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-bold">Clinkar AI</h3>
                        <p className="text-xs text-primary-foreground/80">Asesor Predictivo</p>
                    </div>
                </div>
                {mode === 'modal' && (
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
                {messages.map((msg: Message) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                            "p-4 rounded-2xl text-sm",
                            msg.role === 'user'
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-background border border-border rounded-bl-none shadow-sm"
                        )}>
                            {msg.content}
                        </div>

                        {/* Recommendations Card */}
                        {msg.recommendations && (
                            <div className="mt-3 space-y-2 w-full">
                                {msg.recommendations.map((car: any, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => onSelectCar?.(car.id)}
                                        className="bg-background p-3 rounded-xl border border-border shadow-sm hover:border-primary transition-colors cursor-pointer flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-bold text-sm text-primary group-hover:underline">{car.make} {car.model}</div>
                                            <div className="text-xs text-muted-foreground">{car.reason}</div>
                                        </div>
                                        <div className="bg-secondary p-2 rounded-lg">
                                            <Car className="h-4 w-4 text-muted-foreground" />
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
            <div className="p-4 bg-background border-t">
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
