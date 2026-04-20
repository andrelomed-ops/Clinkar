"use client";

import { Gift, ArrowRight, CarFront, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ReferralPromoCard() {
    return (
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-emerald-500/30 animate-reveal stagger-2 flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
                <Gift className="h-48 w-48" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <CarFront className="h-5 w-5 text-emerald-300 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Programa de Referidos PRO</span>
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tighter italic uppercase underline decoration-emerald-400 decoration-4 underline-offset-4">Gana con StarterKar</h3>
                <p className="text-emerald-100/80 mb-8 font-bold text-sm leading-snug max-w-[240px]">
                    Refiere a un amigo y obtén <span className="text-white">Inspecciones Gratis</span> o <span className="text-white italic">50% de descuento</span> en tu próxima comisión.
                </p>
            </div>

            <div className="flex flex-col gap-3 relative z-10 w-full">
                <Button asChild variant="secondary" className="w-full rounded-2xl h-14 font-black text-emerald-700 bg-white hover:bg-emerald-50 shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                    <Link href="/dashboard/referrals">
                        Invitar Amigos <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-2">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Beneficios Acumulables</span>
                </div>
            </div>
        </div>
    );
}
