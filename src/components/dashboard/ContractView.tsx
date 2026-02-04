"use client";

import { Shield, Printer, ArrowLeft, FileCheck, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getInspectionLabel } from "@/lib/inspection-utils";
import { Vehicle } from "@/data/cars";
import { NOM_122_BOILERPLATE, CUSTODIAL_DISCLOSURE } from "@/lib/legal-compliance";
import { WarrantyExplanation } from "./WarrantyExplanation";

import { useState } from "react";
import { PostSaleEcosystem } from "./PostSaleEcosystem";
import { HandoverSafeCheck } from "./HandoverSafeCheck";

interface ContractViewProps {
    contract: any;
    id: string;
}

export function ContractView({ contract, id }: ContractViewProps) {
    const [isSigned, setIsSigned] = useState(false);
    const [isSigning, setIsSigning] = useState(false);

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    const handleSign = () => {
        setIsSigning(true);
        setTimeout(() => {
            setIsSigning(false);
            setIsSigned(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 2000);
    };

    const inspectionLabel = getInspectionLabel(contract.vehicle.category as Vehicle['category'] || 'Car');
    const legalProfile = contract.legal;

    return (
        <div className="min-h-screen bg-secondary/30 pb-20 print:bg-white print:pb-0 overflow-x-hidden">
            {/* Non-printable Navigation */}
            <nav className="print:hidden border-b bg-background px-6 h-16 flex items-center justify-between sticky top-0 z-50">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    {isSigned ? (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir / Descargar PDF
                        </button>
                    ) : (
                        <div className="flex flex-col items-end gap-2">
                            <button
                                disabled={isSigning}
                                onClick={handleSign}
                                className="flex items-center gap-2 h-9 px-6 rounded-full bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all hover:scale-105 disabled:opacity-50"
                            >
                                {isSigning ? (
                                    <>
                                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Firmando digitalmente...
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="h-4 w-4" />
                                        FIRMAR DIGITALMENTE (Recomendado)
                                    </>
                                )}
                            </button>
                            <span className="text-[10px] text-muted-foreground font-medium max-w-[200px] text-right leading-tight">
                                ¿Prefieres firma autógrafa? <button onClick={handlePrint} className="underline hover:text-primary">Imprime 2 copias</button> ANTES de ir a tu cita.
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                        <Shield className="h-3 w-3" />
                        Legalmente Vinculante
                    </div>
                </div>
            </nav>

            {isSigned && (
                <div className="max-w-[21cm] mx-auto mt-8 px-6 print:hidden">
                    <PostSaleEcosystem transactionId={id} state={legalProfile.state} />
                </div>
            )}

            {/* Contract Document */}
            <main className="max-w-[21cm] mx-auto mt-8 mb-20 bg-white p-[2cm] md:p-[2.5cm] shadow-2xl print:shadow-none print:mt-0 print:p-0 min-h-[29.7cm] relative rounded-sm print:rounded-none">
                {/* Visual Frame for Digital Version */}
                <div className="absolute inset-0 border-2 border-indigo-500/5 pointer-events-none print:hidden rounded-sm" />

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden">
                    <Shield className="h-[25cm] w-[25cm]" />
                </div>

                <div className="relative z-10 space-y-8 text-justify font-serif text-sm leading-relaxed text-black/90">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-10">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3 text-indigo-600">
                                <Shield className="h-10 w-10" />
                                <div className="font-black text-2xl tracking-tighter uppercase italic">CLINKAR</div>
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-[0.1em] text-black">Contrato de Compraventa</h1>
                        </div>

                        <div className="text-right space-y-2">
                            <div className="p-3 border-2 border-black/10 rounded-xl inline-block">
                                <QrCode className="h-12 w-12 text-black/20" />
                            </div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                Autenticidad Verificada <br /> via Blockchain Simulado
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-[10px] font-sans uppercase tracking-widest font-bold border-b pb-4 mb-8">
                        <div>
                            Registro PROFECO: <span className="text-black">{NOM_122_BOILERPLATE.RECA_NUMBER}</span>
                        </div>
                        <div className="text-right">
                            Folio Bóveda: <span className="font-mono text-black">{contract.folio}</span>
                        </div>
                    </div>

                    {/* Proemio */}
                    <p>
                        CONTRATO DE COMPRAVENTA que celebran en {legalProfile.state}, México, a <strong>{contract.date}</strong>, por una parte el C. <strong>{contract.seller.name}</strong>, a quien en lo sucesivo se le denominará el <strong>&quot;VENDEDOR&quot;</strong>, y por la otra parte el C. <strong>{contract.buyer.name}</strong>, a quien en lo sucesivo se le denominará el <strong>&quot;COMPRADOR&quot;</strong>, al tenor de las siguientes:
                    </p>

                    {/* Clauses */}
                    <div className="space-y-6">
                        <h3 className="text-center font-bold tracking-widest text-xs uppercase my-6">— CLÁUSULAS —</h3>

                        <div>
                            <p className="font-bold mb-1">PRIMERA. - OBJETO.</p>
                            <p>
                                El &quot;VENDEDOR&quot; transmite la propiedad del vehículo/activo usado que se describe a continuación al &quot;COMPRADOR&quot;, quien lo adquiere para sí, libre de todo gravamen y responsabilidad legal:
                            </p>
                            <ul className="mt-4 ml-8 list-disc space-y-1 font-sans text-xs bg-gray-50 p-4 border rounded">
                                <li><strong>Categoría:</strong> {contract.vehicle.category}</li>
                                <li><strong>Marca/Marca de Motor:</strong> {contract.vehicle.make}</li>
                                <li><strong>Modelo:</strong> {contract.vehicle.model}</li>
                                <li><strong>Año:</strong> {contract.vehicle.year}</li>
                                <li><strong>Ubicación de Entrega:</strong> {contract.vehicle.location}</li>
                                <li><strong>NIV / VIN / Matrícula:</strong> {contract.vehicle.vin}</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold mb-1">SEGUNDA. - PRECIO Y CUMPLIMIENTO FISCAL.</p>
                            <p>
                                El precio pactado por la compraventa es la cantidad de <strong>${contract.vehicle.price.toLocaleString()} (PESOS 00/100 M.N.)</strong>. {legalProfile.taxClause}
                                <br /><br />
                                Ambas partes acuerdan utilizar la plataforma tecnológica <strong>CLINKAR</strong> para la liquidación. El &quot;VENDEDOR&quot; reconoce haber recibido la notificación de fondos asegurados en Escrow y acepta transferir la posesión física contra la liberación del Código QR.
                                <br /><br />
                                <em>Nota Logística: Si las partes optan por firma autógrafa, se obligan a presentarse en el punto de encuentro con dos (2) tantos impresos de este contrato para su suscripción.</em>
                            </p>
                        </div>

                        <div>
                            <p className="font-bold mb-1">TERCERA. - ESTADO Y GARANTÍA (NOM-122).</p>
                            <p>
                                El &quot;COMPRADOR&quot; manifiesta haber tenido acceso al reporte de <strong>{inspectionLabel}</strong>.
                                <br /><br />
                                <strong>Garantía Obligatoria:</strong> {NOM_122_BOILERPLATE.WARRANTY_DISCLOSURE} Esta garantía no cubre piezas de desgaste natural o daños causados por mal uso posterior a la entrega.
                            </p>
                        </div>

                        <div>
                            <p className="font-bold mb-1">CUARTA. - DOCUMENTACIÓN VINCULANTE.</p>
                            <p>
                                El &quot;VENDEDOR&quot; hace entrega de la siguiente documentación original, la cual garantiza la legal propiedad de la unidad:
                            </p>
                            <ul className="mt-4 ml-8 list-none space-y-1 font-sans text-[10px] text-muted-foreground grid grid-cols-2">
                                {NOM_122_BOILERPLATE.DOCUMENTATION_LIST.map((doc, idx) => (
                                    <li key={idx}>[✓] {doc}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold mb-1">QUINTA. - JURISDICCIÓN Y COMPETENCIA.</p>
                            <p>
                                Para la interpretación y cumplimiento del presente contrato, las partes se someten a la jurisdicción de los <strong>{legalProfile.jurisdiction}</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                            </p>
                        </div>
                    </div>

                    {/* Safe Handover Verification before Signing */}
                    {!isSigned && (
                        <div className="mt-12 pt-8 border-t border-dashed border-zinc-200 print:hidden">
                            <HandoverSafeCheck />
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="pt-20 mt-12 border-t-2 border-black flex justify-between items-end gap-12 page-break-inside-avoid relative">
                        {/* Security Seal */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-6 py-2 border-2 border-black rounded-full flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sello Digital de Seguridad Clinkar</span>
                        </div>

                        <div className="flex-1 text-center space-y-6">
                            <div className="h-24 flex items-end justify-center relative group">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <Shield className="h-20 w-20" />
                                </div>
                                <span className={cn(
                                    "font-cursive text-3xl text-indigo-900/80 rotate-[-5deg] z-10 transition-all duration-1000",
                                    isSigned ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-4"
                                )}>
                                    Firma Digital Verificada
                                </span>
                            </div>
                            <div className="border-t border-black pt-4">
                                <p className="font-bold text-base">{contract.seller.name}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">EL VENDEDOR</p>
                            </div>
                        </div>

                        <div className="flex-1 text-center space-y-6">
                            <div className="h-24 flex items-end justify-center relative group">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <Shield className="h-20 w-20" />
                                </div>
                                <span className={cn(
                                    "font-cursive text-3xl text-indigo-900/80 rotate-[-2deg] z-10 transition-all duration-1000 delay-300",
                                    isSigned ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-4"
                                )}>
                                    Firma Digital Verificada
                                </span>
                            </div>
                            <div className="border-t border-black pt-4">
                                <p className="font-bold text-base">{contract.buyer.name}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">EL COMPRADOR</p>
                            </div>
                        </div>
                    </div>

                    {/* Warranty Policy - Additional Information */}
                    <div className="mt-12 pt-8 border-t border-dashed border-zinc-200 print:hidden">
                        <WarrantyExplanation />
                    </div>

                    {/* Footer */}
                    <div className="pt-12 text-center space-y-4">
                        <div className="border-t pt-4">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                Operación Orquestada por Clinkar S.A. de C.V. conforme a la Ley Federal de Protección al Consumidor.
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">
                                Folio de Seguridad: {id.toUpperCase()} • {legalProfile.state}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200">
                            <p className="text-[8px] leading-tight text-gray-500 text-center italic">
                                <strong>Aviso de Custodia:</strong> {CUSTODIAL_DISCLOSURE.DISCLAIMER_TEXT}
                                <br />
                                Entidad de Custodia: {CUSTODIAL_DISCLOSURE.PARTNER_TYPE} {CUSTODIAL_DISCLOSURE.REGULATION}.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
