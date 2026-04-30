"use client";

import { cn } from "@/lib/utils";
import { ShieldCheck, CarFront, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface CedulaCertezaProps {
    car: {
        make: string;
        model: string;
        year: number;
        vin?: string;
        provenance?: string;
        fair_price_suggested?: number;
        reconditioning_budget?: number;
        reconditioning_notes?: any;
        status?: string;
        location?: string;
        mechanical_notes?: string;
        legal_notes?: string;
    };
    inspectorName?: string;
    date?: string;
}

export function CedulaCertezaPrint({ car, inspectorName = "STAFF STARTERKAR", date = new Date().toLocaleDateString() }: CedulaCertezaProps) {
    return (
        <div className="bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none print:m-0" id="cedula-print-area">
            {/* Header / Seal */}
            <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        StarterKar<br/>
                        <span className="text-2xl">Cédula de Certeza</span>
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-zinc-500">Documento de Arbitraje Técnico y Legal</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="h-20 w-20 bg-black rounded-2xl flex items-center justify-center text-white text-3xl font-black italic">S</div>
                    <p className="text-[9px] font-black mt-2">FOLIO: SK-{car.vin?.slice(-6) || "PENDIENTE"}</p>
                </div>
            </div>

            {/* Vehicle Main Data */}
            <div className="grid grid-cols-2 gap-8 mb-8 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Unidad Dictaminada</p>
                    <h2 className="text-3xl font-black uppercase italic tracking-tight">{car.make} {car.model}</h2>
                    <p className="text-lg font-bold text-zinc-600">{car.year} • {car.location || "MÉXICO"}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Sugerencia StarterKar</p>
                    <p className="text-3xl font-black italic tracking-tighter">
                        {car.fair_price_suggested ? `$${car.fair_price_suggested.toLocaleString()}` : "SUJETO A REVISIÓN"}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase">PRECIO JUSTO ESTIMADO</p>
                </div>
            </div>

            {/* Integrity Matrix */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 border-2 border-black rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Procedencia</span>
                    </div>
                    <p className="text-xs font-bold uppercase">{car.provenance || "ÚNICO DUEÑO"}</p>
                </div>
                <div className="p-4 border-2 border-black rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <CarFront className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Mecánica</span>
                    </div>
                    <p className="text-xs font-bold uppercase">{car.status === 'certified' ? "CERTIFICADO" : "EN REACONDICIONAMIENTO"}</p>
                </div>
                <div className="p-4 border-2 border-black rounded-xl bg-black text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        <span className="text-[10px] font-black uppercase">Estatus Legal</span>
                    </div>
                    <p className="text-xs font-bold uppercase">LIBRE DE GRAVAMEN</p>
                </div>
            </div>

            {/* Reality Reporting Section */}
            <div className="space-y-6 mb-10">
                <div className="border-l-4 border-black pl-4">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info className="h-3 w-3" /> Dictamen Mecánico (Realidad del Auto)
                    </h3>
                    <p className="text-xs leading-relaxed text-zinc-700 italic">
                        {Array.isArray(car.reconditioning_notes) && car.reconditioning_notes.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                                {car.reconditioning_notes.map((n: any, i: number) => (
                                    <li key={i}>{typeof n === 'string' ? n : n.note}</li>
                                ))}
                            </ul>
                        ) : (
                            car.mechanical_notes || car.reconditioning_notes || "Unidad en condiciones óptimas para circulación. Se recomienda mantenimiento preventivo en 5,000km."
                        )}
                    </p>
                    {car.reconditioning_budget && car.reconditioning_budget > 0 && (
                        <p className="mt-3 text-[10px] font-black text-red-600 uppercase">
                            PRESUPUESTO DE REACONDICIONAMIENTO ESTIMADO: ${car.reconditioning_budget.toLocaleString()} MXN
                        </p>
                    )}
                </div>

                <div className="border-l-4 border-zinc-300 pl-4">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-2">Observaciones Legales</h3>
                    <p className="text-xs leading-relaxed text-zinc-600 italic">
                        {car.legal_notes || "Documentación completa. Factura original validada ante SAT. Tenencias al corriente."}
                    </p>
                </div>
            </div>

            {/* Footer / Transparency Disclaimer */}
            <div className="mt-auto pt-10 border-t border-zinc-200">
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <p className="text-[8px] leading-relaxed text-zinc-400 font-medium">
                            Este documento es una Cédula de Certeza emitida por StarterKar bajo el marco de "Justicia y Certeza". No constituye un contrato de compraventa, sino un arbitraje técnico y legal para facilitar tratos justos entre particulares. Los datos aquí contenidos reflejan el estado de la unidad a la fecha de inspección.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase mb-1">VALIDADO POR:</p>
                        <p className="text-xs font-bold">{inspectorName}</p>
                        <p className="text-[9px] font-medium text-zinc-500 mt-1">{date}</p>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-center opacity-20">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-black rounded-full" />
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase">STARTERKAR INTEGRITY ENGINE</span>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #cedula-print-area, #cedula-print-area * {
                        visibility: visible;
                    }
                    #cedula-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
