"use client";

import React from "react";
import { FileDown, Printer, ShieldAlert, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplateDownloads() {
    const handlePrintCedulaTemplate = () => {
        window.open('/admin/print/cedula/template', '_blank');
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <FileText className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Centro de Documentación</h3>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Formatos de Certeza & Resiliencia</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Oficial StarterKar
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handlePrintCedulaTemplate}
                    className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Printer className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-white uppercase tracking-tight">Cédula de Certeza</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Formato 1 Hoja (Mecánico)</p>
                        </div>
                    </div>
                    <Download className="h-5 w-5 text-zinc-700 group-hover:text-indigo-500 transition-colors" />
                </button>

                <button 
                    className="group bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-3xl flex items-center justify-between opacity-50 cursor-not-allowed"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="h-5 w-5 text-zinc-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-zinc-500 uppercase tracking-tight">Responsiva Legal</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Próximamente</p>
                        </div>
                    </div>
                    <FileDown className="h-5 w-5 text-zinc-800" />
                </button>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">
                    💡 CONSEJO DE RESILIENCIA: En caso de falla eléctrica o de red, mantenga siempre 10 copias impresas de la "Cédula de Certeza" para la operación manual de los mecánicos.
                </p>
            </div>
        </div>
    );
}
