"use client";

import { ShieldCheck, Calendar, FileText, Award, CheckCircle } from "lucide-react";
import { Vehicle } from "@/data/cars";
import { getInspectionBadge, getInspectionLabel } from "@/lib/inspection-utils";

interface TrustSealProps {
    folio: string;
    date: string;
    score: number;
    category?: Vehicle['category'];
}

export function TrustSeal({ folio, date, score, category = 'Car' }: TrustSealProps) {
    const badge = getInspectionBadge(category);
    const label = getInspectionLabel(category);

    return (
        <div className="relative group overflow-hidden bg-gradient-to-br from-primary via-primary to-[#1a3a5f] rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/20 animate-in fade-in zoom-in duration-700">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-80 w-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 h-64 w-64 bg-primary-foreground/5 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row gap-10 items-center">
                {/* Badge Section */}
                <div className="shrink-0 relative">
                    <div className="h-32 w-32 rounded-full border-4 border-white/20 flex items-center justify-center p-2 bg-white/10 backdrop-blur-sm shadow-xl animate-bounce-subtle">
                        <ShieldCheck className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform rotate-12">
                        <Award className="h-6 w-6" />
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 flex items-center justify-center md:justify-start gap-2">
                            {badge}
                        </h4>
                        <h3 className="text-2xl font-black">Certificación Clinkar Elite</h3>
                    </div>

                    <p className="text-sm leading-relaxed text-white/80 font-medium max-w-2xl">
                        Este activo ha sido sometido a una {label.toLowerCase()} técnica y legal rigurosa.
                        La transparencia de este reporte garantiza que el valor de oferta es coherente con el estado real de la unidad,
                        protegiendo la inversión del comprador y la integridad del vendedor.
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                                <FileText className="h-3 w-3" /> Folio
                            </span>
                            <p className="font-mono text-sm font-bold tracking-tight">{folio}</p>
                        </div>
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                                <Calendar className="h-3 w-3" /> Fecha
                            </span>
                            <p className="font-bold text-sm tracking-tight">{date}</p>
                        </div>
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                                <CheckCircle className="h-3 w-3" /> Puntaje
                            </span>
                            <p className="font-black text-lg tracking-tight">{score}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
