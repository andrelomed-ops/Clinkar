"use client";

import { Shield, CheckCircle2, AlertCircle, HelpCircle, Star, Award, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function PartnerVettingStatus() {
    const shadowInspectionsDone = 2;
    const shadowInspectionsTotal = 3;
    const qualityScore = 4.9;

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold tracking-tight">Estatus de Socio PRO</h4>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] uppercase font-black px-1.5 py-0.5">
                                En Verificación
                            </Badge>
                            <span className="text-[10px] text-slate-500 font-bold">Nivel 1</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-xl font-black text-white">{qualityScore}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Quality Score</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-black/20 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400 flex items-center gap-1.5">
                            <Search className="h-3 w-3" /> Shadow Inspections (Probación)
                        </span>
                        <span className="text-white">{shadowInspectionsDone}/{shadowInspectionsTotal}</span>
                    </div>
                    <Progress value={(shadowInspectionsDone / shadowInspectionsTotal) * 100} className="h-2 bg-slate-700" />
                    <p className="text-[10px] text-slate-500 italic">
                        {shadowInspectionsDone < shadowInspectionsTotal
                            ? "Tus reportes están siendo auditados por un Inspector Senior."
                            : "Vetting completado. Tu bono de referido se liberará pronto."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 space-y-1">
                        <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase text-emerald-400">Especialidad Luxe</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Pendiente: Subir fotos de escáner.</p>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 space-y-1">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-blue-400" />
                            <span className="text-[10px] font-black uppercase text-blue-400">Protocolo Clinkar</span>
                        </div>
                        <p className="text-[10px] text-slate-500 text-emerald-400 font-bold">Acreditado ✓</p>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/80 leading-snug">
                    <span className="font-bold">Aviso:</span> Tu bono por referir a "Mecánica Sánchez" se activará cuando completen su 3er servicio exitoso.
                </p>
            </div>
        </div>
    );
}
