"use client";

import { useState } from "react";
import { Users, Gift, Share2, Copy, Check, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ReferralEngine() {
    const [copied, setCopied] = useState(false);
    const referralCode = "CLINK-PRO-99";

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://clinkar.com/invite/${referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Users size={180} />
            </div>

            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Gift className="h-6 w-6 text-indigo-100" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Crecimiento Clinkar PRO</h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Gana por expandir nuestra red</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <h4 className="text-3xl font-black leading-none tracking-tighter">
                            Invita a un Partner <br />
                            <span className="text-indigo-300">Gana $500 MXN</span>
                        </h4>
                        <p className="text-indigo-100/80 text-sm font-medium">
                            Por cada inspector o grúa que se registre con tu código y complete su primera orden de servicio.
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-indigo-500 bg-indigo-400 overflow-hidden" />
                                ))}
                                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 bg-white/20 flex items-center justify-center text-[10px] font-bold">+120</div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Únete a la red elite</span>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200 ml-1">Tu Enlace Único</label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-black/20 rounded-xl h-12 flex items-center px-4 font-mono text-xs overflow-hidden text-indigo-200 border border-white/10 uppercase tracking-tighter">
                                    clinkar.com/invite/{referralCode}
                                </div>
                                <Button
                                    onClick={handleCopy}
                                    variant="secondary"
                                    className="h-12 w-12 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 p-0"
                                >
                                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button className="h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold border-0">
                                <Share2 className="mr-2 h-4 w-4" /> Compartir
                            </Button>
                            <Button className="h-12 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black shadow-lg">
                                Ver Recompensas
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10">
                    <div className="text-center space-y-1">
                        <TrendingUp className="h-4 w-4 mx-auto text-indigo-300" />
                        <div className="text-lg font-black tracking-tighter">$12,500</div>
                        <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Generado Total</div>
                    </div>
                    <div className="text-center space-y-1">
                        <Users className="h-4 w-4 mx-auto text-indigo-300" />
                        <div className="text-lg font-black tracking-tighter">24</div>
                        <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Referidos Activos</div>
                    </div>
                    <div className="text-center space-y-1">
                        <Zap className="h-4 w-4 mx-auto text-indigo-300" />
                        <div className="text-lg font-black tracking-tighter">Gold</div>
                        <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Nivel de Partner</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
