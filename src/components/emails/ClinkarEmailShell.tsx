"use client";

import React from "react";
import { Mail, ShieldCheck, ArrowRight, Star } from "lucide-react";

interface EmailTemplateProps {
    title: string;
    preheader: string;
    children: React.ReactNode;
    ctaLabel?: string;
    ctaLink?: string;
}

/**
 * Base Shell for all Clinkar Transactional Emails
 * Designed with premium aesthetic (Dark/Light compatible logic)
 */
export const ClinkarEmailShell = ({ title, preheader, children, ctaLabel, ctaLink }: EmailTemplateProps) => {
    return (
        <div className="max-w-xl mx-auto bg-white border border-zinc-100 rounded-[2rem] overflow-hidden font-sans shadow-2xl shadow-indigo-500/5">
            {/* Header */}
            <header className="bg-indigo-600 p-8 text-center">
                <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="text-white h-7 w-7" />
                </div>
                <h1 className="text-white text-2xl font-black tracking-tight">{title}</h1>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-2">{preheader}</p>
            </header>

            {/* Body */}
            <main className="p-10">
                <div className="text-zinc-600 leading-relaxed space-y-4">
                    {children}
                </div>

                {ctaLabel && ctaLink && (
                    <div className="mt-10">
                        <a
                            href={ctaLink}
                            className="block w-full bg-zinc-900 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform"
                        >
                            {ctaLabel} <ArrowRight className="inline-block ml-2 h-4 w-4" />
                        </a>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 p-8 text-center border-t border-zinc-100">
                <div className="flex justify-center gap-4 mb-4">
                    <Star className="h-4 w-4 text-zinc-300 fill-zinc-300" />
                    <Star className="h-4 w-4 text-zinc-300 fill-zinc-300" />
                    <Star className="h-4 w-4 text-zinc-300 fill-zinc-300" />
                </div>
                <p className="text-xs text-zinc-400 font-medium">
                    © 2026 Clinkar. Tu Bóveda Digital Segura.
                </p>
                <div className="mt-4 flex justify-center gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                    <a href="/terms">Privacidad</a>
                    <span>•</span>
                    <a href="/support">Soporte</a>
                </div>
            </footer>
        </div>
    );
};
