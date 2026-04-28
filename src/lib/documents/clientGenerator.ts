import { jsPDF } from "jspdf";

interface DocData {
    transactionId: string;
    carPrice: number;
    carDetails: { make: string; model: string; year: number | string; vin?: string; plates?: string; color?: string; km?: string; motor?: string; repuve?: string; };
    date: string;
    time?: string;
    buyerName?: string;
    sellerName?: string;
    buyerRfc?: string;
    sellerRfc?: string;
    buyerAddress?: string;
    sellerAddress?: string;
    paymentMethod?: string;
    city?: string;
}

// ─── StarterKar Logo (drawn with primitives) ──────────────────────────
function drawLogo(doc: jsPDF, x: number, y: number, size = 10) {
    // Hexagon background
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(x, y, size * 2.4, size * 2, 2, 2, "F");
    // "S" letter
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(size * 1.5);
    doc.setFont("helvetica", "bold");
    doc.text("S", x + size * 1.2, y + size * 1.55, { align: "center" });
    // "tarterKar" next to
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(size * 1.1);
    doc.setFont("helvetica", "bold");
    doc.text("StarterKar", x + size * 2.8, y + size * 1.2);
    doc.setFontSize(size * 0.65);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("PLATAFORMA DE TRANSACCIONES VEHICULARES SEGURAS", x + size * 2.8, y + size * 1.85);
}

// ─── Helper: section title ────────────────────────────────────────────
function sectionTitle(doc: jsPDF, text: string, y: number, m: number) {
    doc.setFillColor(79, 70, 229);
    doc.rect(m, y, 170, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(text, m + 3, y + 4.2);
    doc.setTextColor(0, 0, 0);
    return y + 10;
}

// ─── Helper: data row ─────────────────────────────────────────────────
function dataRow(doc: jsPDF, label: string, value: string, y: number, m: number, even = false) {
    if (even) { doc.setFillColor(248, 248, 252); doc.rect(m, y - 3.5, 170, 6, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80);
    doc.text(label, m + 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(20, 20, 20);
    doc.text(value, m + 60, y);
    return y + 6;
}

// ─── Helper: draw border ──────────────────────────────────────────────
function pageBorder(doc: jsPDF) {
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, 194, 281);
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 220);
    doc.rect(10, 10, 190, 277);
}

// ─── CONTRATO DE COMPRAVENTA ─────────────────────────────────────────
export async function downloadContractClient(data: DocData) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const m = 15;
    let y = 15;
    const city = data.city || "Ciudad de México";
    const time = data.time || "12:00 hrs";

    pageBorder(doc);

    // Logo
    drawLogo(doc, m, y, 9);
    y += 25;

    // Title block
    doc.setFillColor(245, 245, 252);
    doc.rect(m, y, 170, 18, "F");
    doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5);
    doc.rect(m, y, 170, 18);
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 100);
    doc.text("CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO", 105, y + 7, { align: "center" });
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
    doc.text("Conforme a NOM-122-SCFI-2010 · Código Civil Federal Arts. 2248–2326 · Lineamientos PROFECO", 105, y + 13, { align: "center" });
    y += 22;

    // Folio badge
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(m, y, 170, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text(`FOLIO DE TRANSACCIÓN: ${data.transactionId}   ·   FECHA: ${data.date}   ·   HORA: ${time}   ·   LUGAR: ${city}`, 105, y + 4.8, { align: "center" });
    y += 12;

    // ── Datos del Vehículo ──
    y = sectionTitle(doc, "I. DATOS DEL VEHÍCULO", y, m);
    const vRows: [string, string][] = [
        ["Marca / Submarca:", data.carDetails.make],
        ["Modelo:", data.carDetails.model],
        ["Año Modelo:", String(data.carDetails.year)],
        ["Color:", data.carDetails.color || "Ver Factura Original"],
        ["Kilometraje Actual:", data.carDetails.km || "Ver Odómetro"],
        ["Núm. Identificación Vehicular (VIN):", data.carDetails.vin || "Ver Factura Original"],
        ["Número de Motor:", data.carDetails.motor || "Ver Factura Original"],
        ["Placas de Circulación:", data.carDetails.plates || "Ver Tarjeta de Circulación"],
        ["Núm. REPUVE:", data.carDetails.repuve || "Sin reporte de robo"],
        ["Precio Pactado:", `$${data.carPrice.toLocaleString("es-MX")} MXN (${amountWords(data.carPrice)} Pesos 00/100 M.N.)`],
        ["Método de Pago:", data.paymentMethod || "Transferencia Electrónica Bóveda Digital StarterKar"],
    ];
    vRows.forEach(([l, v], i) => { y = dataRow(doc, l, v, y, m, i % 2 === 0); });
    y += 4;

    // ── Datos de las Partes ──
    y = sectionTitle(doc, "II. DATOS DE LAS PARTES", y, m);
    const pRows: [string, string][] = [
        ["VENDEDOR:", data.sellerName || "___________________________________"],
        ["RFC Vendedor:", data.sellerRfc || "______________________"],
        ["Domicilio Vendedor:", data.sellerAddress || "________________________________________"],
        ["COMPRADOR:", data.buyerName || "___________________________________"],
        ["RFC Comprador:", data.buyerRfc || "______________________"],
        ["Domicilio Comprador:", data.buyerAddress || "________________________________________"],
    ];
    pRows.forEach(([l, v], i) => { y = dataRow(doc, l, v, y, m, i % 2 === 0); });
    y += 4;

    // ── Cláusulas ──
    if (y > 200) { doc.addPage(); pageBorder(doc); y = 20; }
    y = sectionTitle(doc, "III. CLÁUSULAS", y, m);

    const clauses = [
        ["PRIMERA. OBJETO Y CONSENTIMIENTO.", `El presente contrato tiene por objeto la compraventa, a título oneroso, del vehículo descrito en el apartado I. Ambas partes manifiestan prestar su consentimiento libre de vicios, errores o dolo, conforme al Art. 1812 del Código Civil Federal.`],
        ["SEGUNDA. PRECIO, FORMA Y MOMENTO DE PAGO.", `El precio libremente pactado es de $${data.carPrice.toLocaleString("es-MX")} MXN (${amountWords(data.carPrice)} Pesos 00/100 M.N.), liquidado en su totalidad mediante la Bóveda Digital de StarterKar, bajo el folio ${data.transactionId}. El VENDEDOR reconoce haber recibido dicho monto a su entera satisfacción al momento de la firma.`],
        ["TERCERA. PROPIEDAD, AUSENCIA DE GRAVÁMENES Y SANEAMIENTO.", `El VENDEDOR declara, bajo protesta de decir verdad, ser el legítimo propietario del vehículo; que éste no tiene reporte de robo en el REPUVE, no tiene gravámenes, hipotecas, prendas, multas pendientes ni adeudos de tenencia o verificación a la fecha de firma. En caso contrario, el VENDEDOR responderá de la evicción conforme a los Arts. 2119–2164 del Código Civil Federal.`],
        ["CUARTA. ESTADO FÍSICO Y MECÁNICO.", `El COMPRADOR declara conocer el estado actual del vehículo, habiéndolo inspeccionado o renunciando expresamente a dicha inspección. El vehículo se transmite en el estado en que se encuentra, conforme al Art. 2284 del Código Civil Federal, sin garantía implícita de funcionalidad salvo vicios ocultos que el VENDEDOR conozca y omita declarar.`],
        ["QUINTA. ENTREGA DE LA UNIDAD Y DOCUMENTACIÓN.", `La entrega física del vehículo se verificará el día ${data.date} a las ${time} en ${city}. El VENDEDOR hará entrega simultánea de: (a) Factura o Carta Factura original con endoso a nombre del COMPRADOR; (b) Tarjeta de circulación vigente; (c) Constancias de verificación y tenencias al corriente; (d) Llaves.`],
        ["SEXTA. TRANSFERENCIA DE PROPIEDAD Y RESPONSABILIDAD.", `La propiedad se transmite al COMPRADOR en el momento de la entrega física y firma del presente instrumento (Arts. 2014 y 2248 CCF). A partir de ese instante, el COMPRADOR asume toda responsabilidad civil, penal, fiscal y administrativa derivada de la posesión y uso del vehículo, obligándose a tramitar el cambio de propietario ante la autoridad vehicular competente en un plazo no mayor a 30 días hábiles.`],
        ["SÉPTIMA. ACTIVIDADES VULNERABLES (LEY ANTILAVADO).", `Las partes manifiestan que los recursos utilizados para la presente operación son de origen lícito y que la transacción se realiza a través de la plataforma StarterKar, que cuenta con controles de debida diligencia conforme a la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (D.O.F. 17-oct-2012).`],
        ["OCTAVA. JURISDICCIÓN Y SOLUCIÓN DE CONTROVERSIAS.", `Para cualquier controversia derivada del presente contrato, las partes se someten a la jurisdicción de los tribunales del domicilio del COMPRADOR o, a elección de éste, ante la Procuraduría Federal del Consumidor (PROFECO), renunciando a cualquier otro fuero que pudiera corresponderles. El presente contrato es ejecutable como título ejecutivo mercantil conforme al Código de Comercio.`],
    ];

    doc.setFontSize(8.8);
    clauses.forEach(([title, body]) => {
        if (y > 255) { doc.addPage(); pageBorder(doc); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 120);
        const tl = doc.splitTextToSize(title, 168);
        doc.text(tl, m + 1, y); y += tl.length * 4.8;
        doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
        const bl = doc.splitTextToSize(body, 168);
        doc.text(bl, m + 1, y); y += bl.length * 4.8 + 4;
    });

    // ── Firmas ──
    if (y > 230) { doc.addPage(); pageBorder(doc); y = 20; }
    y = sectionTitle(doc, "IV. DECLARACIÓN FINAL Y FIRMAS", y, m);
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
    const declText = `Leído y aceptado el presente instrumento en todas y cada una de sus partes, en ${city}, a las ${time} horas del día ${data.date}, las partes lo firman en dos ejemplares de igual valor y validez.`;
    const declLines = doc.splitTextToSize(declText, 168);
    doc.text(declLines, m + 1, y); y += declLines.length * 5 + 10;

    // Signature blocks
    const sigY = y + 15;
    [[m, "EL VENDEDOR"], [120, "EL COMPRADOR"]].forEach(([sx, label]) => {
        const nx = Number(sx);
        doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5);
        doc.line(nx, sigY, nx + 65, sigY);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
        doc.text(String(label), nx + 32.5, sigY + 4.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Nombre y Firma", nx + 32.5, sigY + 9, { align: "center" });
        doc.line(nx, sigY + 18, nx + 65, sigY + 18);
        doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
        doc.text("TESTIGO", nx + 32.5, sigY + 22.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Nombre y Firma", nx + 32.5, sigY + 27, { align: "center" });
    });

    y = sigY + 35;
    // Legalidad digital
    doc.setFillColor(240, 240, 255);
    doc.setDrawColor(200, 200, 230); doc.setLineWidth(0.3);
    doc.roundedRect(m, y, 170, 12, 2, 2, "FD");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 120);
    doc.text("★  La autenticidad de este documento puede verificarse con el folio de transacción en app.starterkar.com/verify", 105, y + 4.5, { align: "center" });
    doc.text(`Folio: ${data.transactionId}  ·  Generado: ${data.date} ${time}  ·  StarterKar S.A.P.I. de C.V.`, 105, y + 9, { align: "center" });

    doc.save(`Contrato_Compraventa_StarterKar_${data.transactionId}.pdf`);
}

// ─── CARTA RESPONSIVA ────────────────────────────────────────────────
export async function downloadResponsivaClient(data: DocData) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const m = 15;
    let y = 15;
    const city = data.city || "Ciudad de México";
    const time = data.time || "12:00 hrs";

    pageBorder(doc);
    drawLogo(doc, m, y, 9);
    y += 25;

    // Title block
    doc.setFillColor(5, 150, 105);
    doc.rect(m, y, 170, 18, "F");
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("CARTA RESPONSIVA DE ENTREGA VEHICULAR", 105, y + 7, { align: "center" });
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(220, 255, 240);
    doc.text("Instrumento legal de deslinde de responsabilidades y acuse de recibo · Código Civil Federal", 105, y + 13, { align: "center" });
    y += 22;

    // Folio badge
    doc.setFillColor(5, 150, 105);
    doc.roundedRect(m, y, 170, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${data.transactionId}   ·   FECHA: ${data.date}   ·   HORA: ${time}   ·   LUGAR: ${city}`, 105, y + 4.8, { align: "center" });
    y += 12;

    // ── Datos de Identificación ──
    doc.setFillColor(5, 150, 105);
    doc.rect(m, y, 170, 6, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("I. IDENTIFICACIÓN DE LAS PARTES Y DEL VEHÍCULO", m + 3, y + 4.2);
    doc.setTextColor(0, 0, 0); y += 10;

    const idRows: [string, string][] = [
        ["QUIEN ENTREGA (Vendedor):", data.sellerName || "___________________________________"],
        ["QUIEN RECIBE (Comprador):", data.buyerName || "___________________________________"],
        ["Vehículo:", `${data.carDetails.make} ${data.carDetails.model} ${data.carDetails.year}`],
        ["Color:", data.carDetails.color || "Ver Factura"],
        ["No. de Serie (VIN):", data.carDetails.vin || "Ver Factura Original"],
        ["Número de Motor:", data.carDetails.motor || "Ver Factura Original"],
        ["Placas:", data.carDetails.plates || "Ver Tarjeta de Circulación"],
        ["Folio de Transacción:", data.transactionId],
        ["Monto de Operación:", `$${data.carPrice.toLocaleString("es-MX")} MXN`],
    ];
    idRows.forEach(([l, v], i) => { y = dataRow(doc, l, v, y, m, i % 2 === 0); });
    y += 6;

    // ── Cláusulas ──
    doc.setFillColor(5, 150, 105);
    doc.rect(m, y, 170, 6, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("II. CLÁUSULAS DE DESLINDE Y TRANSFERENCIA DE RESPONSABILIDAD", m + 3, y + 4.2);
    doc.setTextColor(0, 0, 0); y += 10;

    const rclauses = [
        ["PRIMERA. ENTREGA VOLUNTARIA Y CONFORMIDAD.", `EL VENDEDOR entrega en este acto a EL COMPRADOR la posesión física del vehículo descrito en el apartado I, en el estado en que se encuentra. EL COMPRADOR lo recibe de conformidad, habiendo tenido la oportunidad de revisarlo, y renuncia a cualquier reclamación por defectos aparentes.`],
        ["SEGUNDA. RESPONSABILIDAD DEL VENDEDOR HASTA ESTE ACTO.", `EL VENDEDOR se hace responsable de cualquier infracción de tránsito, responsabilidad civil, penal, administrativa o fiscal que se hubiera originado con fecha y hora ANTERIOR a las ${time} del día ${data.date}, momento en que se firma la presente carta.`],
        ["TERCERA. TRANSFERENCIA TOTAL DE RESPONSABILIDAD AL COMPRADOR.", `A partir de las ${time} horas del ${data.date}, EL COMPRADOR asume de manera integral y exclusiva toda responsabilidad civil, penal y administrativa derivada del uso, manejo, posesión y disposición del vehículo. EL VENDEDOR queda completamente deslindado de cualquier hecho ilícito, accidente, multa o daño a terceros que ocurra con posterioridad a este momento.`],
        ["CUARTA. OBLIGACIÓN DE CAMBIO DE PROPIETARIO.", `EL COMPRADOR se obliga a iniciar el trámite de cambio de propietario ante la autoridad vehicular competente dentro de los 30 días hábiles siguientes a la firma del presente instrumento, presentando la factura debidamente endosada. El incumplimiento de esta obligación es responsabilidad exclusiva del COMPRADOR.`],
        ["QUINTA. AUSENCIA DE ADEUDOS Y SITUACIÓN LEGAL DEL VEHÍCULO.", `EL VENDEDOR manifiesta bajo protesta de decir verdad que, a la fecha de la presente carta, el vehículo no tiene reporte de robo en el REPUVE, no tiene multas pendientes, no adeuda verificaciones ni tenencias, y no es objeto de embargo o medida cautelar alguna.`],
        ["SEXTA. PLATAFORMA INTERMEDIARIA.", `StarterKar S.A.P.I. de C.V. actúa exclusivamente como plataforma tecnológica intermediaria. La custodia de los fondos a través de la Bóveda Digital garantizó la liquidación segura, pero StarterKar no asume responsabilidad sobre el estado del vehículo, el cumplimiento de los trámites registrales ni los actos realizados por las partes con posterioridad a la operación.`],
    ];

    doc.setFontSize(8.8);
    rclauses.forEach(([title, body]) => {
        if (y > 252) { doc.addPage(); pageBorder(doc); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setTextColor(5, 100, 70);
        const tl = doc.splitTextToSize(title, 168);
        doc.text(tl, m + 1, y); y += tl.length * 4.8;
        doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
        const bl = doc.splitTextToSize(body, 168);
        doc.text(bl, m + 1, y); y += bl.length * 4.8 + 4;
    });

    // ── Checklist ──
    if (y > 220) { doc.addPage(); pageBorder(doc); y = 20; }
    doc.setFillColor(5, 150, 105);
    doc.rect(m, y, 170, 6, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("III. ACUSE DE ENTREGA — DOCUMENTACIÓN E INVENTARIO RECIBIDO", m + 3, y + 4.2);
    doc.setTextColor(0, 0, 0); y += 10;

    doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
    const items = [
        "Factura o Carta Factura original con endoso",
        "Llave principal del vehículo",
        "Llave de repuesto",
        "Tarjeta de circulación vigente",
        "Manual del propietario / guantera",
        "Comprobante de verificación vigente",
        "Comprobante de tenencias al corriente",
        "Llanta de refacción y herramientas básicas",
    ];
    items.forEach((item, i) => {
        const col = i < 4 ? m + 2 : m + 87;
        const row = y + (i < 4 ? i : i - 4) * 6.5;
        doc.setDrawColor(5, 150, 105); doc.setLineWidth(0.3);
        doc.roundedRect(col, row - 3.5, 4, 4, 0.5, 0.5);
        doc.setTextColor(30, 30, 30);
        doc.text(item, col + 6, row);
    });
    y += 4 * 6.5 + 6;

    // ── Firmas ──
    if (y > 225) { doc.addPage(); pageBorder(doc); y = 20; }
    doc.setFillColor(5, 150, 105);
    doc.rect(m, y, 170, 6, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("IV. FIRMAS Y RATIFICACIÓN", m + 3, y + 4.2);
    doc.setTextColor(0, 0, 0); y += 10;

    doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
    const confirm = `Leído, entendido y aceptado en ${city}, a las ${time} horas del día ${data.date}, las partes firman la presente Carta Responsiva como constancia de la entrega física y legal del vehículo.`;
    const cLines = doc.splitTextToSize(confirm, 168);
    doc.text(cLines, m + 1, y); y += cLines.length * 5 + 12;

    const sigY = y + 12;
    [[m, "QUIEN ENTREGA (VENDEDOR)"], [120, "QUIEN RECIBE (COMPRADOR)"]].forEach(([sx, label]) => {
        const nx = Number(sx);
        doc.setDrawColor(5, 150, 105); doc.setLineWidth(0.5);
        doc.line(nx, sigY, nx + 65, sigY);
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(5, 100, 70);
        doc.text(String(label), nx + 32.5, sigY + 4.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Nombre completo y firma", nx + 32.5, sigY + 8.5, { align: "center" });
        doc.text("INE / Pasaporte No.: ___________________", nx + 32.5, sigY + 13, { align: "center" });
    });

    y = sigY + 25;
    doc.setFillColor(240, 255, 248);
    doc.setDrawColor(5, 150, 105); doc.setLineWidth(0.3);
    doc.roundedRect(m, y, 170, 12, 2, 2, "FD");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(5, 100, 70);
    doc.text("★  Este documento no sustituye el trámite de cambio de propietario ante la autoridad vehicular.", 105, y + 4.5, { align: "center" });
    doc.text(`Folio: ${data.transactionId}  ·  Generado: ${data.date} ${time}  ·  StarterKar S.A.P.I. de C.V.`, 105, y + 9, { align: "center" });

    doc.save(`Carta_Responsiva_StarterKar_${data.transactionId}.pdf`);
}

function amountWords(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)} Millones`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)} Mil`;
    return String(num);
}
