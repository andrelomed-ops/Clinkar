import React, { useRef, useState } from 'react';
import { BadgeCheck, History, Loader2, Printer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas'; // Import html2canvas
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react'; // Changed to QRCodeSVG for better html2canvas support

interface ServiceEntry {
    date: string;
    type: string;
    description: string;
    provider: string;
    verified: boolean;
}

interface DigitalPassportProps {
    car: any;
    purchaseDate: string;
    ownerName: string;
    serviceHistory: ServiceEntry[];
}

export const DigitalPassport = ({ car, purchaseDate, ownerName, serviceHistory }: DigitalPassportProps) => {
    const passportRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- STRATEGY A: CLIENT-SIDE GENERATION via html2canvas ---
    const handleDownloadCertificate = async () => {
        if (!passportRef.current) return;
        setIsGenerating(true);

        try {
            // Wait for any potential webfont loading or image rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            // 1. Capture the element
            const canvas = await html2canvas(passportRef.current, {
                scale: 3, // Higher resolution for better print quality
                useCORS: true,
                logging: false, // Set to true if debugging is needed
                allowTaint: true,
                backgroundColor: '#ffffff',
                imageTimeout: 15000, // Wait longer for images
                onclone: (clonedDoc) => {
                    // Ensure the cloned element is visible and properly styled
                    const clonedElement = clonedDoc.querySelector('[data-passport-root]');
                    if (clonedElement instanceof HTMLElement) {
                        clonedElement.style.transform = 'none';
                        clonedElement.style.margin = '0';
                    }
                }
            });

            // 2. Generate PDF
            const imgData = canvas.toDataURL('image/png', 1.0);

            // A4 dimensions in mm
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Single page logic is sufficient for this component usually
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Save
            const safeMake = car.make.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const safeModel = car.model.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            pdf.save(`Clinkar_Passport_${safeMake}_${safeModel}.pdf`);

        } catch (err) {
            console.error("PDF Generation failed", err);
            alert("No se pudo generar el PDF automáticamente. Iniciando modo de impresión alternativa...");
            // Fallback to native print if canvas fails
            handleNativePrint();
        } finally {
            setIsGenerating(false);
        }
    };

    // --- STRATEGY B: NATIVE BROWSER PRINT (FAILSAFE) ---
    const handleNativePrint = () => {
        if (!passportRef.current) return;

        // Open a new window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Por favor permite los pop-ups para imprimir.");
            return;
        }

        // Get the HTML content
        const content = passportRef.current.outerHTML;

        // Write the full document structure
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Digital Passport - ${car.make} ${car.model}</title>
                    <meta charset="utf-8">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            background: white; 
                            font-family: 'Inter', sans-serif;
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                        }
                        @media print {
                            body { margin: 0; padding: 20mm; }
                            @page { size: A4 portrait; margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body class="flex justify-center items-start min-h-screen">
                    <div class="w-full max-w-[210mm] transform scale-100 origin-top">
                        ${content}
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                            }, 800);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Generate Verification URL
    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify/asset/${car.id}`
        : `https://clinkar.com/verify/asset/${car.id}`;

    return (
        <div className="max-w-md mx-auto space-y-6">

            {/* --- VISIBLE PASSPORT (and Source for PDF) --- */}
            <div ref={passportRef} className="bg-card print:bg-white border-2 border-border rounded-[2rem] overflow-hidden shadow-2xl relative print:shadow-none print:border-0">
                {/* Holographic Header */}
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" style={{ color: '#ffffff' }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', color: '#ffffff' }}>
                            <BadgeCheck className="h-3 w-3" style={{ color: '#34d399' }} /> Clinkar Verified Asset
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', color: '#ffffff' }}>PASAPORTE DIGITAL</h2>
                        <p className="text-[10px] font-mono mt-2 uppercase tracking-widest" style={{ color: 'rgba(199, 210, 254, 0.8)' }}>
                            ID: {car.id.substring(0, 8).toUpperCase()}-{Math.random().toString(36).substring(7).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="px-8 pb-10">
                    <div className="relative -mt-10 mb-6 flex justify-center">
                        <div className="h-24 w-24 bg-white rounded-2xl p-2 shadow-xl rotate-3 flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
                            <div className="h-full w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-1" style={{ backgroundColor: '#0f172a' }}>
                                {/* Real QR Code */}
                                <div className="bg-white p-1 rounded-lg">
                                    <QRCodeSVG
                                        value={verificationUrl}
                                        size={70}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"H"}
                                        includeMargin={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>{car.make} {car.model}</h3>
                        <p className="text-sm font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>{car.year} • {car.transmission} • {car.distance.toLocaleString()} km</p>
                    </div>

                    {/* Ownership Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                            <div className="text-[10px] uppercase font-bold mb-1" style={{ color: '#94a3b8' }}>Propietario Registrado</div>
                            <div className="font-bold text-sm truncate" style={{ color: '#0f172a' }}>{ownerName}</div>
                        </div>
                        <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                            <div className="text-[10px] uppercase font-bold mb-1" style={{ color: '#94a3b8' }}>Fecha de Emisión</div>
                            <div className="font-bold text-sm truncate" style={{ color: '#0f172a' }}>{purchaseDate}</div>
                        </div>
                    </div>

                    {/* Service Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2 mb-4" style={{ borderColor: '#f1f5f9' }}>
                            <History className="h-4 w-4" style={{ color: '#4f46e5' }} />
                            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Historial de Valor</h4>
                        </div>

                        <div className="relative pl-4 space-y-0">
                            {/* Vertical Line */}
                            <div className="absolute left-[5px] top-2 bottom-2 w-[2px]" style={{ backgroundColor: '#f1f5f9' }}></div>

                            {serviceHistory.map((service, index) => (
                                <div key={index} className="relative pl-6 py-3 group">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-0 top-5 h-3 w-3 rounded-full border-2 z-10"
                                        style={{
                                            borderColor: '#ffffff',
                                            backgroundColor: service.verified ? '#10b981' : '#cbd5e1',
                                            boxShadow: service.verified ? '0 0 0 2px #d1fae5' : 'none'
                                        }}
                                    />

                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{service.type}</div>
                                        {service.verified && (
                                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
                                                style={{ backgroundColor: '#ecfdf5', color: '#059669', borderColor: '#d1fae5' }}>
                                                VERIFICADO
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs mb-1 leading-relaxed" style={{ color: '#64748b' }}>{service.description}</p>
                                    <div className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                                        {service.date}  •  {service.provider}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Disclaimer Footer */}
                <div className="p-4 text-center border-t" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                    <p className="text-[10px] leading-tight" style={{ color: '#94a3b8' }}>
                        Este documento es un comprobante digital generado por Clinkar Platform. La autenticidad puede verificarse escaneando el código QR superior.
                    </p>
                </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="grid grid-cols-1 gap-3">
                <Button
                    onClick={handleDownloadCertificate}
                    disabled={isGenerating}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12 font-bold shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {isGenerating ? 'Generando PDF...' : 'Descargar Certificado (PDF)'}
                </Button>

                <Button
                    onClick={handleNativePrint}
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-12 font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Imprimir / Guardar como PDF (Alternativo)
                </Button>
            </div>

            <p className="text-center text-xs text-slate-400 px-4">
                ¿Problemas con la descarga? Usa la opción <span className="font-bold text-slate-500">"Imprimir"</span> y selecciona "Guardar como PDF" en tu navegador.
            </p>
        </div>
    );
};


