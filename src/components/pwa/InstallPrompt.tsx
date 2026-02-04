"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center"
                >
                    <div className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-4 shadow-2xl flex items-center gap-4 max-w-md w-full relative overflow-hidden">
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                            <img src="/icon-192.png" alt="App Icon" className="w-10 h-10 object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm">Instalar Clinkar Enterprise</h3>
                            <p className="text-xs text-zinc-400 truncate">Acceso rápido y modo offline.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <Download size={14} />
                                Instalar
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X size={14} className="text-zinc-500" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
