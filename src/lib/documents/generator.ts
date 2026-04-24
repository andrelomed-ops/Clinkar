import { jsPDF } from "jspdf";

export interface DocumentData {
    transactionId: string;
    carPrice: number;
    carDetails: {
        make: string;
        model: string;
        year: number;
        vin?: string;
        plates?: string;
        color?: string;
    };
    buyerName?: string;
    sellerName?: string;
    date: string;
}

export async function generateContractPDF(data: DocumentData) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO", 105, y, { align: "center" });
    
    y += 10;
    doc.setFontSize(8);
    doc.text("(MODELO BASADO EN LINEAMIENTOS PROFECO)", 105, y, { align: "center" });

    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const intro = `Contrato de compraventa que celebran por una parte el VENDEDOR, y por otra parte el COMPRADOR, respecto del vehículo marca ${data.carDetails.make}, modelo ${data.carDetails.model}, año ${data.carDetails.year}, con número de serie (VIN) ${data.carDetails.vin || "N/A"} y placas ${data.carDetails.plates || "N/A"}.`;
    
    const splitIntro = doc.splitTextToSize(intro, 170);
    doc.text(splitIntro, margin, y);
    y += (splitIntro.length * 5) + 10;

    // Clauses
    doc.setFont("helvetica", "bold");
    doc.text("CLÁUSULAS", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    const clauses = [
        "PRIMERA. El objeto del presente contrato es la compraventa del vehículo antes descrito, el cual se entrega en el estado mecánico y de carrocería que el COMPRADOR conoce y acepta.",
        "SEGUNDA. El precio pactado por la unidad es de $" + data.carPrice.toLocaleString() + " MXN, el cual ha sido liquidado mediante la Bóveda Digital de StarterKar bajo el folio " + data.transactionId + ".",
        "TERCERA. El VENDEDOR declara que el vehículo es de su propiedad y se encuentra libre de todo gravamen o responsabilidad legal.",
        "CUARTA. El VENDEDOR se obliga a hacer entrega de la documentación original que ampara la propiedad del vehículo (Factura, Tenencias, Verificaciones).",
        "QUINTA. Las partes aceptan que para cualquier controversia se someterán a la jurisdicción de los tribunales competentes de la Ciudad de México y a la Procuraduría Federal del Consumidor (PROFECO)."
    ];

    clauses.forEach(clause => {
        const lines = doc.splitTextToSize(clause, 170);
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(lines, margin, y);
        y += (lines.length * 5) + 5;
    });

    y += 20;
    doc.text("__________________________", 50, y, { align: "center" });
    doc.text("__________________________", 160, y, { align: "center" });
    y += 5;
    doc.text("EL VENDEDOR", 50, y, { align: "center" });
    doc.text("EL COMPRADOR", 160, y, { align: "center" });

    return doc.output("arraybuffer");
}

export async function generateResponsivaPDF(data: DocumentData) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CARTA RESPONSIVA DE COMPRAVENTA", 105, y, { align: "center" });

    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const text = `En la fecha ${data.date}, se hace entrega física del vehículo ${data.carDetails.make} ${data.carDetails.model} ${data.carDetails.year} con placas ${data.carDetails.plates || "N/A"}.

A partir de la firma de la presente y la entrega de las llaves, el COMPRADOR asume toda la responsabilidad civil, penal y administrativa que se derive del uso, manejo y posesión de la unidad antes descrita.

El VENDEDOR se deslinda de cualquier incidente, infracción o mal uso que se le dé al vehículo posterior a este acto.`;

    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    
    y += 60;
    doc.text("Folio de Transacción: " + data.transactionId, margin, y);
    y += 10;
    doc.text("Monto de Operación: $" + data.carPrice.toLocaleString() + " MXN", margin, y);

    y += 30;
    doc.text("__________________________", 105, y, { align: "center" });
    y += 5;
    doc.text("FIRMA DE CONFORMIDAD", 105, y, { align: "center" });

    return doc.output("arraybuffer");
}

export async function generateCertificatePDF(data: DocumentData) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header with "StarterKar" style
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICADO STARTERKAR", 105, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    y = 60;
    doc.setFontSize(14);
    doc.text("PASAPORTE DIGITAL DE CONFIANZA", margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Este documento certifica que el vehículo ${data.carDetails.make} ${data.carDetails.model} ${data.carDetails.year} ha sido validado bajo el protocolo de 150 puntos de StarterKar.`, margin, y);

    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("RESULTADOS DE INSPECCIÓN:", margin, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    
    const points = [
        "✓ Motor y Transmisión: ÓPTIMO",
        "✓ Sistema Eléctrico: VERIFICADO",
        "✓ Historial Legal (REPUVE/RAPI): SIN REPORTES",
        "✓ Documentación: VALIDADA",
        "✓ Neumáticos y Suspensión: SEGURO PARA CIRCULAR"
    ];

    points.forEach(p => {
        doc.text(p, margin + 5, y);
        y += 8;
    });

    y += 20;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);
    
    y += 10;
    doc.setFontSize(8);
    doc.text("ESTE CERTIFICADO TIENE VALIDEZ OFICIAL DENTRO DEL ECOSISTEMA STARTERKAR.", 105, y, { align: "center" });

    return doc.output("arraybuffer");
}
