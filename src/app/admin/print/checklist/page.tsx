"use client";

import React, { useRef } from "react";
import { Printer, Download, ArrowLeft, ShieldCheck, CheckSquare, Car, FileText } from "lucide-react";
import { CAR_INSPECTION_SECTIONS } from "@/lib/inspection-data";
import Link from "next/link";

export default function PrintableChecklistPage() {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Control Bar - Hidden on Print */}
            <div className="sticky top-0 z-[110] bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tight">Formato de Inspección 150 Puntos</h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Documento oficial para mecánicos certificados</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        className="h-11 px-6 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Formato
                    </button>
                </div>
            </div>

            {/* Printable Document */}
            <div className="max-w-[21cm] mx-auto mt-8 bg-white shadow-2xl print:shadow-none print:mt-0 p-[2cm] min-h-[29.7cm] text-zinc-900 font-sans" ref={printRef}>
                {/* Header Document */}
                <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
                                <Car className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter uppercase">Starter<span className="text-indigo-600">Kar</span></span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Certeza & Confianza Automotriz</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Checklist de Certificación</h2>
                        <p className="text-[10px] font-black bg-zinc-900 text-white px-3 py-1 rounded mt-2 inline-block">ESTÁNDAR 150 PUNTOS</p>
                    </div>
                </div>

                {/* Meta Data Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10 text-[10px] font-bold uppercase tracking-wider">
                    <div className="p-4 border border-zinc-200 rounded-lg">
                        <p className="text-zinc-400 mb-1">Fecha de Inspección</p>
                        <p className="border-b border-zinc-100 pb-1 mt-2">____ / ____ / 202__</p>
                    </div>
                    <div className="p-4 border border-zinc-200 rounded-lg">
                        <p className="text-zinc-400 mb-1">Inspector Asignado</p>
                        <p className="border-b border-zinc-100 pb-1 mt-2">____________________</p>
                    </div>
                    <div className="p-4 border border-zinc-200 rounded-lg">
                        <p className="text-zinc-400 mb-1">Folio de Control</p>
                        <p className="text-zinc-900 font-black mt-2"># SK-INS-_______</p>
                    </div>
                </div>

                {/* Vehicle Specs Area */}
                <div className="bg-zinc-50 p-6 rounded-2xl mb-10 border border-zinc-100 grid grid-cols-2 gap-x-12 gap-y-4 text-[10px] font-bold">
                    <div className="flex justify-between border-b border-zinc-200 pb-1">
                        <span className="text-zinc-400">MARCA / MODELO:</span>
                        <span className="text-zinc-300">________________________</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-200 pb-1">
                        <span className="text-zinc-400">AÑO:</span>
                        <span className="text-zinc-300">____________</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-200 pb-1">
                        <span className="text-zinc-400">NÚMERO DE SERIE (VIN):</span>
                        <span className="text-zinc-300">________________________</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-200 pb-1">
                        <span className="text-zinc-400">KILOMETRAJE:</span>
                        <span className="text-zinc-300">____________</span>
                    </div>
                </div>

                {/* The 150 Points - Split by Sections */}
                <div className="space-y-12">
                    {CAR_INSPECTION_SECTIONS.map((section, sIdx) => (
                        <div key={section.id} className="break-inside-avoid">
                            <div className="flex items-center gap-3 mb-4 border-l-4 border-indigo-600 pl-4">
                                <span className="text-lg font-black italic uppercase tracking-tighter">{sIdx + 1}. {section.label}</span>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">({section.items.length} Puntos de revisión)</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                {section.items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-2 py-1.5 border-b border-zinc-50">
                                        <div className="h-3.5 w-3.5 border border-zinc-300 rounded mt-0.5" />
                                        <span className="text-[9px] leading-tight text-zinc-700">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Signatures and Verdict */}
                <div className="mt-20 border-t-2 border-zinc-900 pt-10 break-inside-avoid">
                    <div className="flex items-center justify-between mb-12">
                        <div className="text-center w-64">
                            <div className="h-20 border-b border-zinc-300 mb-2" />
                            <p className="text-[10px] font-black uppercase">Firma del Inspector</p>
                            <p className="text-[8px] text-zinc-400 mt-1 font-bold">Certificación StarterKar</p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] font-black uppercase tracking-widest">DICTAMEN FINAL</p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 border-2 border-zinc-900 px-4 py-2 rounded-xl">
                                    <div className="h-4 w-4 border-2 border-zinc-900 rounded-sm" />
                                    <span className="text-xs font-black italic uppercase">APROBADO</span>
                                </div>
                                <div className="flex items-center gap-2 border-2 border-zinc-300 px-4 py-2 rounded-xl text-zinc-300">
                                    <div className="h-4 w-4 border-2 border-zinc-300 rounded-sm" />
                                    <span className="text-xs font-black italic uppercase">RECHAZADO</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center w-64">
                            <div className="h-20 border-b border-zinc-300 mb-2" />
                            <p className="text-[10px] font-black uppercase">Sello de Taller / Agencia</p>
                            <p className="text-[8px] text-zinc-400 mt-1 font-bold">Validación Física</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-indigo-400" />
                            <div>
                                <p className="text-[10px] font-black uppercase italic tracking-tighter">Garantía de Certeza StarterKar</p>
                                <p className="text-[8px] font-medium text-zinc-400">Este documento es una declaración jurada de la condición mecánica del vehículo.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase">www.starterkar.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .min-h-screen {
                        min-height: auto !important;
                    }
                    @page {
                        margin: 0;
                        size: A4;
                    }
                }
                .break-inside-avoid {
                    break-inside: avoid;
                }
            `}</style>
        </div>
    );
}
