"use client";

import { Shield, Printer, ArrowLeft, FileSignature, AlertTriangle, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LiabilityReleaseLetterProps {
    transactionId: string;
    contract: any; // We'll reuse the contract data structure
}

export function LiabilityReleaseLetter({ transactionId, contract }: LiabilityReleaseLetterProps) {
    const [currentDate, setCurrentDate] = useState<string>("");
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const now = new Date();
        setCurrentDate(now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        setCurrentTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    }, []);

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30 pb-20 print:bg-white print:pb-0 overflow-x-hidden">
            {/* Non-printable Navigation */}
            <nav className="print:hidden border-b bg-background px-6 h-16 flex items-center justify-between sticky top-0 z-50">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir / Guardar como PDF
                    </button>
                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                        <Shield className="h-3 w-3" />
                        Documento Legal
                    </div>
                </div>
            </nav>

            {/* Document Content */}
            <main className="max-w-[21cm] mx-auto mt-8 mb-20 bg-white p-[2.5cm] shadow-2xl print:shadow-none print:mt-0 print:p-0 min-h-[29.7cm] relative rounded-sm print:rounded-none">

                <div className="space-y-6 text-justify font-serif text-sm leading-relaxed text-black/90 tracking-wide">
                    {/* Header */}
                    <div className="flex flex-col items-center border-b-2 border-black pb-6 mb-8">
                        <h1 className="text-xl font-black uppercase tracking-[0.2em] text-black">Carta Responsiva</h1>
                        <p className="text-[10px] uppercase tracking-widest mt-2">{contract.vehicle.make} {contract.vehicle.model} {contract.vehicle.year}</p>
                    </div>

                    {/* Date and Location */}
                    <p className="text-right italic mb-8">
                        En {contract.legal.state}, México; a {currentDate}, siendo las {currentTime} horas.
                    </p>

                    {/* Body */}
                    <div className="space-y-6">
                        <p>
                            Por medio de la presente, el <strong>C. {contract.buyer.name}</strong> (en lo sucesivo "EL COMPRADOR"), recibe de entera conformidad física, mecánica y legal del <strong>C. {contract.seller.name}</strong> (en lo sucesivo "EL VENDEDOR"), el vehículo automotor que se describe a continuación:
                        </p>

                        <div className="bg-gray-50 p-6 border border-gray-200 rounded-sm font-sans text-xs">
                            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                                <li><strong>Marca:</strong> {contract.vehicle.make}</li>
                                <li><strong>Modelo:</strong> {contract.vehicle.model}</li>
                                <li><strong>Año:</strong> {contract.vehicle.year}</li>
                                <li><strong>Color:</strong> {contract.vehicle.color || 'N/A'}</li>
                                <li><strong>NIV/Serie:</strong> {contract.vehicle.vin}</li>
                                <li><strong>Placas:</strong> {contract.vehicle.plates || 'BAJA'}</li>
                                <li><strong>Motor:</strong> {contract.vehicle.engineNum || 'N/A'}</li>
                            </ul>
                        </div>

                        <p>
                            <strong>DECLARACIÓN DE RESPONSABILIDAD:</strong>
                        </p>

                        <p>
                            A partir de la fecha y hora señaladas en el encabezado de este documento:
                        </p>

                        <ol className="list-decimal ml-8 space-y-4 marker:font-bold">
                            <li>
                                "EL COMPRADOR" asume la <strong>responsabilidad total</strong>, civil, penal, administrativa y de tránsito, derivada del uso, manejo y posesión del vehículo descrito anteriormente.
                            </li>
                            <li>
                                "EL COMPRADOR" deslinda a "EL VENDEDOR" de cualquier responsabilidad futura relacionada con infracciones de tránsito, accidentes vehiculares, adeudos de tenencia futuros, o cualquier acto ilícito en el que pudiera verse involucrada la unidad a partir de este momento.
                            </li>
                            <li>
                                "EL COMPRADOR" se compromete a realizar el trámite de <strong>cambio de propietario</strong> ante la autoridad vehicular correspondiente en un plazo no mayor a 15 días hábiles, o en su defecto, acepta la responsabilidad por la omisión de dicho trámite.
                            </li>
                            <li>
                                "EL VENDEDOR" manifiesta que hasta el momento de la entrega, el vehículo no tiene reporte de robo y se entrega libre de gravamen, habiendo cubierto los pagos de tenencia y verificación según se estipula en el contrato de compraventa anexo.
                            </li>
                        </ol>
                    </div>

                    {/* Signatures */}
                    <div className="pt-24 mt-12 flex justify-between gap-12 page-break-inside-avoid">
                        <div className="flex-1 flex flex-col items-center gap-4">
                            <div className="w-full border-t border-black"></div>
                            <div className="text-center">
                                <p className="font-bold text-sm uppercase">{contract.seller.name}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">EL VENDEDOR (ENTREGA)</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center gap-4">
                            <div className="w-full border-t border-black"></div>
                            <div className="text-center">
                                <p className="font-bold text-sm uppercase">{contract.buyer.name}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">EL COMPRADOR (RECIBE Y ACEPTA)</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="mt-16 pt-8 border-t-2 border-double border-gray-200 text-[10px] text-center text-gray-400 uppercase tracking-wide">
                        <p className="flex items-center justify-center gap-2 mb-2 font-bold text-gray-500">
                            <AlertTriangle className="h-3 w-3" />
                            Importante
                        </p>
                        Este documento es un anexo al Contrato de Compraventa. Se recomienda conservar el original para cualquier aclaración ante las autoridades correspondientes.
                        <br />
                        Generado digitalmente por Clinkar - {transactionId}
                    </div>
                </div>
            </main>
        </div>
    );
}
