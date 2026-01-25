"use client";

import { Shield, Printer, ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Mock Data (In production, fetch from Supabase using params.id)
    const contract = {
        folio: `CLK-${id.toUpperCase()}-${new Date().getFullYear()}`,
        date: new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' }),
        seller: {
            name: "Juan Pérez García",
            rfc: "PEGJ800101H20",
            address: "Av. Reforma 222, CDMX"
        },
        buyer: {
            name: "Carlos Usuario Demo",
            rfc: "XAXX010101000",
            address: "Calle de Prueba 123, CDMX"
        },
        vehicle: {
            make: "Tesla",
            model: "Model 3",
            year: 2022,
            vin: "5YJ3E1EB8NF123456",
            color: "Blanco",
            price: 350000
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-secondary/30 pb-20 print:bg-white print:pb-0">
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
                        Imprimir / Descargar PDF
                    </button>
                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                        <Shield className="h-3 w-3" />
                        Legalmente Vinculante
                    </div>
                </div>
            </nav>

            {/* Contract Document */}
            <main className="max-w-[21cm] mx-auto mt-8 bg-white p-[2.5cm] shadow-2xl print:shadow-none print:mt-0 print:p-0 min-h-[29.7cm] relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <Shield className="h-[20cm] w-[20cm]" />
                </div>

                <div className="relative z-10 space-y-8 text-justify font-serif text-sm leading-relaxed text-black/90">
                    {/* Header */}
                    <div className="text-center space-y-4 border-b pb-6 mb-8">
                        <h1 className="text-xl font-bold uppercase tracking-widest">Contrato de Compraventa de Vehículo Automotor</h1>
                        <p className="text-xs font-sans text-muted-foreground">
                            Folio Bóveda Digital: <span className="font-mono text-black">{contract.folio}</span>
                        </p>
                    </div>

                    {/* Proemio */}
                    <p>
                        CONTRATO DE COMPRAVENTA que celebran en la Ciudad de México, a <strong>{contract.date}</strong>, por una parte el C. <strong>{contract.seller.name}</strong>, a quien en lo sucesivo se le denominará el <strong>"VENDEDOR"</strong>, y por la otra parte el C. <strong>{contract.buyer.name}</strong>, a quien en lo sucesivo se le denominará el <strong>"COMPRADOR"</strong>, al tenor de las siguientes:
                    </p>

                    {/* Clauses */}
                    <div className="space-y-6">
                        <h3 className="text-center font-bold tracking-widest text-xs uppercase my-6">— CLÁUSULAS —</h3>

                        <div>
                            <p className="font-bold mb-1">PRIMERA. - OBJETO.</p>
                            <p>
                                El "VENDEDOR" transmite la propiedad del vehículo automotor usado que se describe a continuación al "COMPRADOR", quien lo adquiere para sí, libre de todo gravamen y responsabilidad legal:
                            </p>
                            <ul className="mt-4 ml-8 list-disc space-y-1 font-sans text-xs bg-gray-50 p-4 border rounded">
                                <li><strong>Marca:</strong> {contract.vehicle.make}</li>
                                <li><strong>Modelo:</strong> {contract.vehicle.model}</li>
                                <li><strong>Año:</strong> {contract.vehicle.year}</li>
                                <li><strong>Color:</strong> {contract.vehicle.color}</li>
                                <li><strong>NIV (VIN):</strong> {contract.vehicle.vin}</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold mb-1">SEGUNDA. - PRECIO Y FORMA DE PAGO.</p>
                            <p>
                                El precio pactado por la compraventa del vehículo es la cantidad de <strong>${contract.vehicle.price.toLocaleString()} (PESOS 00/100 M.N.)</strong>.
                                <br /><br />
                                Ambas partes acuerdan utilizar la plataforma tecnológica <strong>CLINKAR</strong> y su servicio de "Bóveda Digital" (Escrow) para la liquidación de la operación. El "VENDEDOR" reconoce haber recibido la notificación de fondos asegurados y acepta transferir la posesión física contra la liberación del Código QR de seguridad.
                            </p>
                        </div>

                        <div>
                            <p className="font-bold mb-1">TERCERA. - ESTADO DEL VEHÍCULO.</p>
                            <p>
                                El "COMPRADOR" manifiesta haber revisado el vehículo a su entera satisfacción, así como haber tenido acceso al <strong>Reporte de Inspección Mecánica de 150 Puntos</strong> emitido a través de la plataforma Clinkar, aceptando las condiciones físicas y mecánicas en las que se encuentra (Ad-Corpus).
                            </p>
                        </div>

                        <div>
                            <p className="font-bold mb-1">CUARTA. - VICIOS OCULTOS Y SANEAMIENTO.</p>
                            <p>
                                El "VENDEDOR" responde por el saneamiento para el caso de evicción y garantiza la procedencia lícita del vehículo, obligándose a sacar en paz y a salvo al "COMPRADOR" de cualquier controversia legal anterior a la fecha de este contrato.
                            </p>
                        </div>

                        <div>
                            <p className="font-bold mb-1">QUINTA. - JURISDICCIÓN.</p>
                            <p>
                                Para la interpretación y cumplimiento del presente contrato, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                            </p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="pt-20 mt-12 border-t flex justify-between items-end gap-12 page-break-inside-avoid">
                        <div className="flex-1 text-center space-y-4">
                            <div className="h-24 flex items-end justify-center">
                                <span className="font-cursive text-2xl text-blue-900 rotate-[-5deg] opacity-80">Firma Digital Verificada</span>
                            </div>
                            <div className="border-t border-black pt-2">
                                <p className="font-bold">{contract.seller.name}</p>
                                <p className="text-xs text-muted-foreground">EL VENDEDOR</p>
                            </div>
                        </div>

                        <div className="flex-1 text-center space-y-4">
                            <div className="h-24 flex items-end justify-center">
                                <span className="font-cursive text-2xl text-blue-900 rotate-[-2deg] opacity-80">Firma Digital Verificada</span>
                            </div>
                            <div className="border-t border-black pt-2">
                                <p className="font-bold">{contract.buyer.name}</p>
                                <p className="text-xs text-muted-foreground">EL COMPRADOR</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-12 text-center">
                        <p className="text-[10px] text-muted-foreground">
                            Contrato generado electrónicamente por Clinkar S.A. de C.V. | Hash de Seguridad: {id}-{new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
