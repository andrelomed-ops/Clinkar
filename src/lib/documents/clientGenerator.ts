import { jsPDF } from "jspdf";

interface DocData {
    transactionId: string;
    carPrice: number;
    carDetails: { make: string; model: string; year: number | string; vin?: string; plates?: string };
    date: string;
}

export async function downloadContractClient(data: DocData) {
    const doc = new jsPDF();
    const m = 20; // margin
    let y = 25;

    // ── HEADER ──────────────────────────────────────────────
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("STARTERKAR — PLATAFORMA DE TRANSACCIONES VEHICULARES SEGURAS", 105, 11, { align: "center" });

    doc.setTextColor(0, 0, 0);
    y = 30;
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO", 105, y, { align: "center" });
    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("(MODELO BASADO EN LINEAMIENTOS PROFECO — NOM-143-SCFI-2000)", 105, y, { align: "center" });

    // ── DIVIDER ──────────────────────────────────────────────
    y += 8;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(m, y, 190, y);
    y += 8;

    // ── DATOS DEL VEHÍCULO ───────────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL VEHÍCULO", m, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const vehicleLines = [
        ["Marca:", data.carDetails.make],
        ["Modelo:", data.carDetails.model],
        ["Año:", String(data.carDetails.year)],
        ["Número de Serie (VIN):", data.carDetails.vin || "Ver Factura Original"],
        ["Placas:", data.carDetails.plates || "Ver Factura Original"],
        ["Folio StarterKar:", data.transactionId],
        ["Precio Pactado:", `$${data.carPrice.toLocaleString("es-MX")} MXN`],
        ["Fecha de Operación:", data.date],
    ];

    vehicleLines.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, m, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, 75, y);
        y += 5;
    });

    y += 3;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(m, y, 190, y);
    y += 8;

    // ── CLÁUSULAS ────────────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("CLÁUSULAS", m, y);
    y += 7;

    const clauses = [
        ["PRIMERA. OBJETO.", `El presente contrato tiene por objeto la compraventa del vehículo descrito en el apartado anterior, mismo que el VENDEDOR declara ser de su legítima propiedad y estar libre de gravámenes, adeudos o cualquier carga que limite su libre disposición.`],
        ["SEGUNDA. PRECIO Y FORMA DE PAGO.", `El precio pactado de manera libre y voluntaria por ambas partes es de $${data.carPrice.toLocaleString("es-MX")} MXN (${numberToWords(data.carPrice)} pesos MXN), el cual ha sido liquidado en su totalidad a través de la Bóveda Digital de StarterKar bajo el folio de transacción ${data.transactionId}, conforme al protocolo de Trato Seguro.`],
        ["TERCERA. CONDICIÓN DEL VEHÍCULO.", `El COMPRADOR declara conocer el estado físico y mecánico actual del vehículo, habiéndolo inspeccionado previamente o renunciando expresamente a dicha inspección, por lo que el VENDEDOR no asume responsabilidad por defectos aparentes o conocidos por el COMPRADOR al momento de la firma.`],
        ["CUARTA. ENTREGA DE DOCUMENTACIÓN.", `El VENDEDOR se obliga a hacer entrega de la documentación original que ampara la propiedad del vehículo, incluyendo: Factura o Carta Factura original, Tarjeta de circulación vigente, Constancias de verificación y tenencias pagadas. La entrega de documentos se realizará en el acto de entrega física del vehículo.`],
        ["QUINTA. TRANSFERENCIA DE PROPIEDAD.", `La transmisión de la propiedad del vehículo se efectuará al momento de la firma del presente contrato y entrega de la unidad. A partir de ese momento, el COMPRADOR asume todos los derechos y obligaciones derivados de la posesión y uso del vehículo.`],
        ["SEXTA. JURISDICCIÓN.", `Para cualquier controversia derivada del presente contrato, las partes se someten expresamente a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando al fuero que por razón de su domicilio presente o futuro pudiera corresponderles. Asimismo, se acepta la jurisdicción de la Procuraduría Federal del Consumidor (PROFECO).`],
    ];

    doc.setFontSize(9);
    clauses.forEach(([title, body]) => {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(title, 170);
        doc.text(titleLines, m, y);
        y += titleLines.length * 4.5;
        doc.setFont("helvetica", "normal");
        const bodyLines = doc.splitTextToSize(body, 170);
        doc.text(bodyLines, m, y);
        y += bodyLines.length * 4.5 + 4;
    });

    // ── FIRMAS ───────────────────────────────────────────────
    if (y > 245) { doc.addPage(); y = 20; }
    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(m, y, 190, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Leído y aceptado por ambas partes en la Ciudad de México, a " + data.date, 105, y, { align: "center" });
    y += 20;

    doc.setDrawColor(100, 100, 100);
    doc.line(m, y, 85, y);
    doc.line(115, y, 190, y);
    y += 5;
    doc.setFontSize(8);
    doc.text("EL VENDEDOR", 52, y, { align: "center" });
    doc.text("EL COMPRADOR", 152, y, { align: "center" });
    y += 12;
    doc.line(m, y, 85, y);
    doc.line(115, y, 190, y);
    y += 5;
    doc.text("TESTIGO", 52, y, { align: "center" });
    doc.text("TESTIGO", 152, y, { align: "center" });

    // ── FOOTER ───────────────────────────────────────────────
    y += 15;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.3);
    doc.line(m, y, 190, y);
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Documento generado por StarterKar S.A.P.I. de C.V. | Folio: " + data.transactionId + " | Fecha: " + data.date, 105, y, { align: "center" });

    doc.save(`Contrato_Compraventa_${data.transactionId}.pdf`);
}

export async function downloadResponsivaClient(data: DocData) {
    const doc = new jsPDF();
    const m = 20;
    let y = 25;

    // ── HEADER ──────────────────────────────────────────────
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("STARTERKAR — PROTOCOLO TRATO SEGURO | DESLINDE DE RESPONSABILIDADES", 105, 11, { align: "center" });

    doc.setTextColor(0, 0, 0);
    y = 30;
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("CARTA RESPONSIVA DE ENTREGA VEHICULAR", 105, y, { align: "center" });
    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("(INSTRUMENTO LEGAL DE DESLINDE Y ACUSE DE RECIBO)", 105, y, { align: "center" });

    y += 8;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.5);
    doc.line(m, y, 190, y);
    y += 8;

    // ── CUERPO ───────────────────────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const intro = `En la Ciudad de México, a ${data.date}, mediante la presente CARTA RESPONSIVA se hace constar la entrega física y legal del vehículo de las siguientes características:`;
    const introLines = doc.splitTextToSize(intro, 170);
    doc.text(introLines, m, y);
    y += introLines.length * 5 + 5;

    // Vehicle data box
    doc.setFillColor(245, 245, 250);
    doc.setDrawColor(200, 200, 210);
    doc.roundedRect(m, y, 170, 32, 3, 3, "FD");
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Vehículo:", m + 5, y); doc.setFont("helvetica", "normal"); doc.text(`${data.carDetails.make} ${data.carDetails.model} ${data.carDetails.year}`, 60, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("No. de Serie (VIN):", m + 5, y); doc.setFont("helvetica", "normal"); doc.text(data.carDetails.vin || "Ver Factura Original", 60, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Folio de Transacción:", m + 5, y); doc.setFont("helvetica", "normal"); doc.text(data.transactionId, 60, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Monto de Operación:", m + 5, y); doc.setFont("helvetica", "normal"); doc.text(`$${data.carPrice.toLocaleString("es-MX")} MXN`, 60, y);
    y += 10;

    const clauses = [
        `PRIMERO. El COMPRADOR declara recibir el vehículo descrito en el presente instrumento en el estado físico y mecánico que ha verificado previamente, otorgando su plena conformidad con las condiciones de entrega.`,
        `SEGUNDO. A partir de la firma de la presente Carta Responsiva y la entrega material de las llaves y documentación del vehículo, el COMPRADOR asume de manera integral y exclusiva toda la responsabilidad civil, penal y administrativa que se derive del uso, manejo, posesión y disposición del bien descrito.`,
        `TERCERO. El VENDEDOR se deslinda expresamente de cualquier accidente, infracción, multa, daño a terceros, delito o cualquier hecho ilícito que se genere con motivo del uso del vehículo con posterioridad a la fecha consignada en este documento.`,
        `CUARTO. El COMPRADOR acepta tramitar, en el plazo más breve posible, el cambio de propietario ante las autoridades correspondientes, liberando al VENDEDOR de cualquier obligación fiscal o administrativa relacionada con el vehículo.`,
        `QUINTO. La plataforma StarterKar actúa exclusivamente como intermediario tecnológico en la presente operación, sin asumir responsabilidad sobre las condiciones del vehículo o el cumplimiento de las obligaciones entre las partes.`,
    ];

    clauses.forEach((clause, i) => {
        if (y > 255) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(clause, 170);
        doc.setFont("helvetica", "normal");
        doc.text(lines, m, y);
        y += lines.length * 5 + 4;
    });

    // ── CHECKLIST DE ENTREGA ─────────────────────────────────
    if (y > 220) { doc.addPage(); y = 20; }
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ACUSE DE ENTREGA — DOCUMENTACIÓN RECIBIDA:", m, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const checkItems = [
        "☐  Factura o Carta Factura original",
        "☐  Llave principal del vehículo",
        "☐  Llave de repuesto",
        "☐  Tarjeta de circulación",
        "☐  Manual del propietario",
        "☐  Verificación vehicular vigente",
    ];

    const half = Math.ceil(checkItems.length / 2);
    checkItems.slice(0, half).forEach((item, i) => {
        doc.text(item, m, y + i * 6);
    });
    checkItems.slice(half).forEach((item, i) => {
        doc.text(item, 110, y + i * 6);
    });
    y += half * 6 + 10;

    // ── FIRMAS ───────────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(m, y, 190, y);
    y += 10;
    doc.setFontSize(8.5);
    doc.text("Leído, entendido y aceptado en la Ciudad de México, a " + data.date, 105, y, { align: "center" });
    y += 18;

    doc.setDrawColor(100, 100, 100);
    doc.line(m, y, 85, y);
    doc.line(115, y, 190, y);
    y += 5;
    doc.setFontSize(8);
    doc.text("QUIEN ENTREGA (VENDEDOR)", 52, y, { align: "center" });
    doc.text("QUIEN RECIBE (COMPRADOR)", 152, y, { align: "center" });

    // ── FOOTER ───────────────────────────────────────────────
    y += 20;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.3);
    doc.line(m, y, 190, y);
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Documento generado por StarterKar S.A.P.I. de C.V. | Folio: " + data.transactionId + " | Fecha: " + data.date, 105, y, { align: "center" });

    doc.save(`Carta_Responsiva_${data.transactionId}.pdf`);
}

function numberToWords(num: number): string {
    // Simple approximation for amounts
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} millones`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} mil`;
    return String(num);
}
