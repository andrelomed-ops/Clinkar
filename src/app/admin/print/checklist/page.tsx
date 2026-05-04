"use client";

import React, { useRef } from "react";
import { Printer, Download, ArrowLeft, ShieldCheck, CheckSquare, Car, FileText } from "lucide-react";
import { CAR_INSPECTION_SECTIONS } from "@/lib/inspection-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

export default function PrintableChecklistPage() {
    const printRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const isCertificate = searchParams.get('mode') === 'certificate';

    const handlePrint = () => {
        window.print();
    };

    // Filter sections based on mode
    const displaySections = isCertificate 
        ? CAR_INSPECTION_SECTIONS 
        : CAR_INSPECTION_SECTIONS.filter(s => s.id !== 'legal');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Control Bar - Hidden on Print */}
            <div className="sticky top-0 z-[110] bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-3 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xs font-black uppercase tracking-tight">
                            {isCertificate ? 'Certificación 150 Puntos' : 'Checklist Mecánico'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mr-2">
                        <Link href="/admin/print/checklist" className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", !isCertificate ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>TÉCNICO</Link>
                        <Link href="/admin/print/checklist?mode=certificate" className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", isCertificate ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>CERTIFICADO</Link>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="h-10 px-6 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* Printable Document - Optimized for A4 */}
            <div className="max-w-[21cm] mx-auto mt-4 bg-white shadow-2xl print:shadow-none print:mt-0 p-8 md:p-12 print:p-6 min-h-[29.7cm] text-zinc-900 font-sans" ref={printRef}>
                {/* Header Document - Compacted */}
                <div className="flex justify-between items-end border-b-2 border-zinc-900 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-black rounded flex items-center justify-center">
                            <Car className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-black italic tracking-tighter uppercase">Starter<span className="text-indigo-600">Kar</span></span>
                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400">Inspección de Certeza</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-black uppercase italic tracking-tight">
                            {isCertificate ? 'Certificado de Certeza' : 'Hoja de Inspección'}
                        </h2>
                        <span className="text-[8px] font-black bg-zinc-900 text-white px-2 py-0.5 rounded uppercase tracking-widest">
                            {isCertificate ? 'Estándar 150 Puntos' : '120 Puntos Técnicos'}
                        </span>
                    </div>
                </div>

                {/* Metadata & Vehicle Specs - Integrated & Compact */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-[9px] font-bold uppercase">
                    <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-2 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                        <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                            <span className="text-zinc-400">MARCA/MODELO:</span>
                            <span className="text-zinc-300">________________</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                            <span className="text-zinc-400">AÑO:</span>
                            <span className="text-zinc-300">_______</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                            <span className="text-zinc-400">VIN:</span>
                            <span className="text-zinc-300">________________</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                            <span className="text-zinc-400">KM:</span>
                            <span className="text-zinc-300">_______</span>
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="p-3 border border-zinc-200 rounded-xl">
                            <p className="text-zinc-400 mb-0.5">FECHA</p>
                            <p className="text-zinc-200 mt-1">__/__/202_</p>
                        </div>
                        <div className="p-3 border border-zinc-200 rounded-xl">
                            <p className="text-zinc-400 mb-0.5">RESPONSABLE</p>
                            <p className="text-zinc-200 mt-1">___________</p>
                        </div>
                        <div className="col-span-2 px-3 py-2 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                            <span className="text-[8px] tracking-widest">FOLIO DE CONTROL</span>
                            <span className="font-black italic">#SK-INS-_______</span>
                        </div>
                    </div>
                </div>

                {/* Checklist Sections - 3 Columns for maximum efficiency */}
                <div className="space-y-6">
                    {displaySections.map((section, sIdx) => (
                        <div key={section.id} className="break-inside-avoid">
                            <div className="flex items-center gap-2 mb-2 border-l-3 border-indigo-600 pl-3">
                                <span className="text-[12px] font-black italic uppercase tracking-tighter">{sIdx + 1}. {section.label}</span>
                                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">({section.items.length} PTOS)</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                                {section.items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-1.5 py-0.5 border-b border-zinc-50">
                                        <div className="h-3 w-3 border border-zinc-300 rounded-sm mt-0.5 shrink-0" />
                                        <span className="text-[8px] leading-[1.1] text-zinc-700 uppercase">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Remarks / Observations */}
                <div className="mt-6 border-2 border-dashed border-zinc-100 rounded-2xl p-6 break-inside-avoid">
                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-6 tracking-widest">Observaciones Adicionales / Diagnóstico Técnico:</p>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-px bg-zinc-100 w-full" />)}
                    </div>
                    <div className="mt-4 text-[7px] text-zinc-300 italic uppercase">Espacio para notas sobre reparaciones sugeridas, hallazgos críticos o recomendaciones del inspector.</div>
                </div>

                {/* Signatures Area - Compacted to single row */}
                <div className="mt-8 pt-6 border-t-2 border-zinc-900 break-inside-avoid">
                    <div className="grid grid-cols-3 gap-8 items-end mb-6">
                        <div className="text-center">
                            <div className="h-16 border-b border-zinc-200 mb-1" />
                            <p className="text-[8px] font-black uppercase">Firma Técnico Responsable</p>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-3 border-2 border-zinc-900 rounded-2xl bg-zinc-50">
                            <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-2">VEREDICTO FINAL</p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-4 w-4 border-2 border-zinc-900 rounded-sm" />
                                    <span className="text-[9px] font-black italic">APROBADO</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-4 w-4 border-2 border-zinc-900 rounded-sm" />
                                    <span className="text-[9px] font-black italic">RECHAZADO</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="h-16 border-b border-zinc-200 mb-1" />
                            <p className="text-[8px] font-black uppercase">Sello de Certificación SK</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-indigo-400" />
                            <div>
                                <p className="text-[9px] font-black uppercase italic tracking-tighter leading-none">Garantía de Certeza StarterKar</p>
                                <p className="text-[7px] text-zinc-500 uppercase mt-0.5 font-bold">Documento Técnico oficial para certificación vehicular.</p>
                            </div>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest">www.starterkar.com</p>
                    </div>
                </div>
            </div>

            {/* Print Styles Optimized */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                        size: A4;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    /* Hide floating buttons and global UI elements */
                    .fixed, .absolute.bottom-10, button[class*="rounded-full"], .print\\:hidden {
                        display: none !important;
                    }
                    .min-h-screen {
                        min-height: auto !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                .break-inside-avoid {
                    break-inside: avoid;
                }
            `}</style>
        </div>
    );
}
