import { jsPDF } from "jspdf";

interface DocData {
    transactionId: string;
    carPrice: number;
    carDetails: { make: string; model: string; year: number | string; vin?: string; plates?: string; color?: string; km?: string; motor?: string; };
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

// Shield logo drawn with jsPDF primitives
function drawShieldLogo(doc: jsPDF, x: number, y: number) {
    const sx = x, sy = y, w = 14, h = 16;
    // Shield body
    doc.setFillColor(79, 70, 229);
    doc.setDrawColor(60, 52, 200);
    doc.setLineWidth(0.3);
    // Draw shield: rounded top + pointed bottom using lines
    doc.lines(
        [
            [w * 0.4, 0], [w * 0.3, 0, w * 0.5, -h * 0.1, w * 0.5, -h * 0.15],
            [-w * 0.5, -h * 0.15, -w * 0.5, -h * 0.1, -w * 0.5, 0],
            [-w * 0.5, 0]
        ],
        sx + w * 0.5, sy + h, 1, 1, "FD", false
    );
    // Simpler: use roundedRect for top + triangle for bottom
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(sx, sy, w, h * 0.72, 2.5, 2.5, "F");
    // Triangle bottom
    doc.triangle(sx, sy + h * 0.65, sx + w, sy + h * 0.65, sx + w * 0.5, sy + h, "F");
    // "S" letter
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("S", sx + w * 0.5, sy + h * 0.45, { align: "center" });
    // Brand name
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("StarterKar", sx + w + 4, sy + h * 0.38);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("PLATAFORMA DE TRANSACCIONES VEHICULARES SEGURAS", sx + w + 4, sy + h * 0.68);
}

function pageBorder(doc: jsPDF) {
    doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.8); doc.rect(8, 8, 194, 281);
    doc.setLineWidth(0.2); doc.setDrawColor(200, 200, 230); doc.rect(10, 10, 190, 277);
}

function sectionBar(doc: jsPDF, text: string, y: number, m: number, color: number[]) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(m, y, 170, 6.5, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(text, m + 3, y + 4.5);
    doc.setTextColor(0, 0, 0);
    return y + 10;
}

function row(doc: jsPDF, label: string, value: string, y: number, m: number, shade = false) {
    if (shade) { doc.setFillColor(248, 248, 253); doc.rect(m, y - 4, 170, 5.8, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(70, 70, 100);
    doc.text(label, m + 2, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(20, 20, 20);
    const vLines = doc.splitTextToSize(value, 105);
    doc.text(vLines, m + 62, y);
    return y + Math.max(vLines.length * 4.5, 5.5);
}

function amountWords(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2)} Millones de`;
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 0)} Mil`;
    return String(n);
}

// ── CONTRATO DE COMPRAVENTA ────────────────────────────────────────────
export async function downloadContractClient(data: DocData) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const m = 15;
    let y = 15;
    const city = data.city || "Ciudad de México";
    const time = data.time || "12:00 hrs";

    pageBorder(doc);
    drawShieldLogo(doc, m, y);
    y += 24;

    // Title
    doc.setFillColor(245, 245, 252);
    doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5);
    doc.rect(m, y, 170, 16);
    doc.setFontSize(12.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 100);
    doc.text("CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO", 105, y + 7, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 110, 130);
    doc.text("Conforme a NOM-122-SCFI-2010 · Codigo Civil Federal · Lineamientos PROFECO", 105, y + 12.5, { align: "center" });
    y += 20;

    // Folio strip
    doc.setFillColor(79, 70, 229); doc.roundedRect(m, y, 170, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${data.transactionId}   |   FECHA: ${data.date}   |   HORA: ${time}   |   LUGAR: ${city}`, 105, y + 5, { align: "center" });
    y += 12;

    // Section I: Vehiculo
    y = sectionBar(doc, "I.  DATOS DEL VEHICULO", y, m, [79, 70, 229]);
    const vr: [string, string][] = [
        ["Marca / Submarca:", data.carDetails.make],
        ["Modelo:", data.carDetails.model],
        ["Año Modelo:", String(data.carDetails.year)],
        ["Color:", data.carDetails.color || "Ver Factura Original"],
        ["Kilometraje al momento de entrega:", data.carDetails.km || "Ver Odómetro"],
        ["No. de Identificacion Vehicular (VIN):", data.carDetails.vin || "Ver Factura Original"],
        ["Numero de Motor:", data.carDetails.motor || "Ver Factura Original"],
        ["Placas de Circulacion:", data.carDetails.plates || "Ver Tarjeta de Circulacion"],
        ["Registro REPUVE:", "Sin reporte de robo a fecha de firma"],
        ["Precio Pactado:", `$${data.carPrice.toLocaleString("es-MX")} MXN (${amountWords(data.carPrice)} Pesos 00/100 M.N.)`],
        ["Metodo de Pago:", data.paymentMethod || "Transferencia electronica entre particulares (SPEI)"],
    ];
    vr.forEach(([l, v], i) => { y = row(doc, l, v, y, m, i % 2 === 0); });
    y += 4;

    // Section II: Partes
    y = sectionBar(doc, "II.  DATOS DE LAS PARTES", y, m, [79, 70, 229]);
    const pr: [string, string][] = [
        ["VENDEDOR (Nombre completo):", data.sellerName || "________________________________________"],
        ["RFC del Vendedor:", data.sellerRfc || "______________________"],
        ["Domicilio del Vendedor:", data.sellerAddress || "________________________________________"],
        ["COMPRADOR (Nombre completo):", data.buyerName || "________________________________________"],
        ["RFC del Comprador:", data.buyerRfc || "______________________"],
        ["Domicilio del Comprador:", data.buyerAddress || "________________________________________"],
    ];
    pr.forEach(([l, v], i) => { y = row(doc, l, v, y, m, i % 2 === 0); });
    y += 4;

    // Section III: Clausulas
    if (y > 185) { doc.addPage(); pageBorder(doc); y = 18; }
    y = sectionBar(doc, "III.  CLAUSULAS", y, m, [79, 70, 229]);

    const clauses = [
        ["PRIMERA. OBJETO Y CONSENTIMIENTO.",
            `Las partes celebran el presente contrato de compraventa de buena fe y a titulo oneroso, sobre el vehiculo descrito en el apartado I. Ambas partes manifiestan su consentimiento libre de vicios, sin presion ni engano, conforme al Codigo Civil Federal.`],
        ["SEGUNDA. PRECIO Y FORMA DE PAGO.",
            `El precio libremente pactado es de $${data.carPrice.toLocaleString("es-MX")} MXN (${amountWords(data.carPrice)} Pesos 00/100 M.N.), el cual ha sido liquidado directamente entre las partes mediante transferencia electronica (SPEI). StarterKar actua como plataforma de verificacion y acompanamiento del proceso, sin ser en ningun momento custodia ni intermediaria de los fondos. El VENDEDOR declara haber recibido el monto pactado a su entera conformidad.`],
        ["TERCERA. DECLARACION DE PROPIEDAD Y AUSENCIA DE GRAVAMENES.",
            `El VENDEDOR declara, bajo protesta de decir verdad, ser el legitimo propietario del vehiculo; que este no cuenta con reporte de robo en el REPUVE; que se encuentra libre de gravamenes, hipotecas, prendas, adeudos de multas, tenencias o verificaciones a la fecha de firma. Ante cualquier vicio oculto o reclamacion de tercero sobre la propiedad previa a esta fecha, el VENDEDOR respondera de la eviccion conforme a la Ley.`],
        ["CUARTA. ESTADO FISICO Y MECANICO.",
            `El COMPRADOR declara conocer el estado actual del vehiculo, haberlo inspeccionado o renunciar expresamente a dicha inspeccion. El vehiculo se transmite en las condiciones actuales. El VENDEDOR no asume responsabilidad por defectos aparentes o conocidos por el COMPRADOR al momento de la firma, salvo por vicios ocultos que el VENDEDOR conociera y omitiera declarar.`],
        ["QUINTA. ENTREGA DE LA UNIDAD Y DOCUMENTACION.",
            `La entrega fisica del vehiculo se realizara el ${data.date} a las ${time} en ${city}. El VENDEDOR entregara simultaneamente: (a) Factura o Carta Factura original con endoso; (b) Tarjeta de circulacion vigente; (c) Comprobantes de verificacion y tenencias al corriente; (d) Llaves. La no entrega de cualquiera de estos documentos podra ser causa de nulidad del presente contrato.`],
        ["SEXTA. TRANSFERENCIA DE PROPIEDAD Y RESPONSABILIDAD.",
            `La propiedad del vehiculo se transmite al COMPRADOR en el momento de la entrega fisica y firma del presente instrumento. A partir de ese instante, el COMPRADOR asume toda responsabilidad civil, penal, fiscal y administrativa derivada de la posesion y uso del vehiculo, obligandose a tramitar el cambio de propietario ante la autoridad vehicular competente en un plazo no mayor a 30 dias habiles.`],
        ["SEPTIMA. OBLIGACIONES FISCALES Y ANTILAVADO.",
            `Las partes manifiestan que los recursos utilizados en la presente operacion son de origen licito, conforme a la Ley Federal para la Prevencion e Identificacion de Operaciones con Recursos de Procedencia Ilicita. El COMPRADOR se obliga a realizar la declaracion patrimonial correspondiente si la operacion lo requiere conforme a la normativa fiscal vigente.`],
        ["OCTAVA. JURISDICCION Y SOLUCION DE CONTROVERSIAS.",
            `Para cualquier controversia derivada del presente contrato, las partes se someten a la jurisdiccion de los tribunales del domicilio del COMPRADOR o, a eleccion de este, ante la Procuraduria Federal del Consumidor (PROFECO), renunciando a cualquier otro fuero. El presente instrumento tiene plena fuerza probatoria como documento privado.`],
    ];

    doc.setFontSize(8.8);
    clauses.forEach(([title, body]) => {
        if (y > 255) { doc.addPage(); pageBorder(doc); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 120);
        const tl = doc.splitTextToSize(title, 167);
        doc.text(tl, m + 1, y); y += tl.length * 4.8;
        doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
        const bl = doc.splitTextToSize(body, 167);
        doc.text(bl, m + 1, y); y += bl.length * 4.8 + 5;
    });

    // Section IV: Firmas
    if (y > 225) { doc.addPage(); pageBorder(doc); y = 20; }
    y = sectionBar(doc, "IV.  DECLARACION FINAL Y FIRMAS", y, m, [79, 70, 229]);
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
    const decl = `Leido y aceptado el presente instrumento en todas y cada una de sus partes, en ${city}, a las ${time} horas del dia ${data.date}. Las partes lo firman en dos ejemplares originales de igual valor y validez.`;
    const dl = doc.splitTextToSize(decl, 167); doc.text(dl, m + 1, y); y += dl.length * 5 + 12;

    const sy2 = y + 14;
    [[m, "EL VENDEDOR"], [120, "EL COMPRADOR"]].forEach(([sx, lbl]) => {
        const nx = Number(sx);
        doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5);
        doc.line(nx, sy2, nx + 65, sy2);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
        doc.text(String(lbl), nx + 32.5, sy2 + 4.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Nombre completo y firma", nx + 32.5, sy2 + 8.5, { align: "center" });
        doc.line(nx, sy2 + 18, nx + 65, sy2 + 18);
        doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
        doc.text("TESTIGO", nx + 32.5, sy2 + 22, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Nombre completo y firma", nx + 32.5, sy2 + 26.5, { align: "center" });
    });

    y = sy2 + 38;
    doc.setFillColor(242, 242, 255); doc.setDrawColor(180, 180, 230); doc.setLineWidth(0.3);
    doc.roundedRect(m, y, 170, 11, 2, 2, "FD");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 150);
    doc.text("Documento generado por StarterKar S.A.P.I. de C.V. como constancia del proceso Trato Seguro.", 105, y + 4, { align: "center" });
    doc.text(`Folio: ${data.transactionId}  |  ${data.date} ${time}  |  app.starterkar.com/verify`, 105, y + 8.5, { align: "center" });

    doc.save(`Contrato_Compraventa_StarterKar_${data.transactionId}.pdf`);
}

// ── CARTA RESPONSIVA ──────────────────────────────────────────────────
export async function downloadResponsivaClient(data: DocData) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const m = 15;
    let y = 15;
    const city = data.city || "Ciudad de México";
    const time = data.time || "12:00 hrs";
    const G: [number, number, number] = [5, 150, 105];

    pageBorder(doc);
    drawShieldLogo(doc, m, y);
    y += 24;

    // Title
    doc.setFillColor(G[0], G[1], G[2]);
    doc.rect(m, y, 170, 16, "F");
    doc.setFontSize(12.5); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("CARTA RESPONSIVA DE ENTREGA VEHICULAR", 105, y + 7, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(200, 255, 230);
    doc.text("Instrumento legal de deslinde de responsabilidades y acuse de recibo", 105, y + 12.5, { align: "center" });
    y += 20;

    // Folio strip
    doc.setFillColor(G[0], G[1], G[2]); doc.roundedRect(m, y, 170, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${data.transactionId}   |   FECHA: ${data.date}   |   HORA: ${time}   |   LUGAR: ${city}`, 105, y + 5, { align: "center" });
    y += 12;

    // Section I
    y = sectionBar(doc, "I.  IDENTIFICACION DE LAS PARTES Y DEL VEHICULO", y, m, G);
    const ir: [string, string][] = [
        ["QUIEN ENTREGA (Vendedor):", data.sellerName || "________________________________________"],
        ["QUIEN RECIBE (Comprador):", data.buyerName || "________________________________________"],
        ["Vehiculo:", `${data.carDetails.make} ${data.carDetails.model} ${data.carDetails.year}`],
        ["Color:", data.carDetails.color || "Ver Factura"],
        ["No. de Serie (VIN):", data.carDetails.vin || "Ver Factura Original"],
        ["Numero de Motor:", data.carDetails.motor || "Ver Factura Original"],
        ["Placas:", data.carDetails.plates || "Ver Tarjeta de Circulacion"],
        ["Folio de Transaccion:", data.transactionId],
        ["Monto de Operacion:", `$${data.carPrice.toLocaleString("es-MX")} MXN`],
    ];
    ir.forEach(([l, v], i) => { y = row(doc, l, v, y, m, i % 2 === 0); });
    y += 5;

    // Section II
    y = sectionBar(doc, "II.  CLAUSULAS DE DESLINDE Y TRANSFERENCIA DE RESPONSABILIDAD", y, m, G);

    const rc = [
        ["PRIMERA. ENTREGA VOLUNTARIA Y CONFORMIDAD.",
            `EL VENDEDOR entrega en este acto a EL COMPRADOR la posesion fisica del vehiculo descrito en el apartado I, en el estado en que se encuentra. EL COMPRADOR lo recibe de plena conformidad, habiendo tenido oportunidad de revisarlo, y renuncia a cualquier reclamacion por defectos aparentes.`],
        ["SEGUNDA. RESPONSABILIDAD DEL VENDEDOR HASTA ESTE ACTO.",
            `EL VENDEDOR asume la responsabilidad de cualquier infraccion de transito, responsabilidad civil, penal o administrativa que se hubiera originado con fecha y hora ANTERIOR a las ${time} del dia ${data.date}, momento exacto en que se firma la presente carta.`],
        ["TERCERA. TRANSFERENCIA TOTAL DE RESPONSABILIDAD AL COMPRADOR.",
            `A partir de las ${time} horas del ${data.date}, EL COMPRADOR asume de manera integral y exclusiva toda responsabilidad civil, penal y administrativa derivada del uso, manejo, posesion y disposicion del vehiculo. EL VENDEDOR queda completamente deslindado de cualquier accidente, multa, infraccion o hecho ilicito que ocurra con posterioridad a este momento.`],
        ["CUARTA. OBLIGACION DE CAMBIO DE PROPIETARIO.",
            `EL COMPRADOR se obliga a iniciar el tramite de cambio de propietario ante la autoridad vehicular competente dentro de los 30 dias habiles siguientes a la firma del presente instrumento, presentando la factura debidamente endosada. El incumplimiento es responsabilidad exclusiva del COMPRADOR.`],
        ["QUINTA. AUSENCIA DE ADEUDOS Y SITUACION LEGAL.",
            `EL VENDEDOR manifiesta bajo protesta de decir verdad que a la fecha de firma, el vehiculo no tiene reporte de robo en el REPUVE, no adeuda multas, tenencias ni verificaciones, y no es objeto de embargo o medida cautelar alguna.`],
        ["SEXTA. ROL DE STARTERKAR.",
            `StarterKar actua exclusivamente como plataforma tecnologica de verificacion y acompanamiento del proceso. La operacion economica se realizo directamente entre las partes. StarterKar no asume responsabilidad sobre el estado del vehiculo, el cumplimiento de tramites registrales ni los actos de las partes con posterioridad a la operacion.`],
    ];

    doc.setFontSize(8.8);
    rc.forEach(([title, body]) => {
        if (y > 252) { doc.addPage(); pageBorder(doc); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setTextColor(5, 100, 70);
        const tl = doc.splitTextToSize(title, 167); doc.text(tl, m + 1, y); y += tl.length * 4.8;
        doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
        const bl = doc.splitTextToSize(body, 167); doc.text(bl, m + 1, y); y += bl.length * 4.8 + 5;
    });

    // Section III: Checklist
    if (y > 215) { doc.addPage(); pageBorder(doc); y = 20; }
    y = sectionBar(doc, "III.  ACUSE DE ENTREGA - DOCUMENTACION E INVENTARIO RECIBIDO", y, m, G);
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);

    const items = [
        "Factura o Carta Factura original con endoso",
        "Llave principal del vehiculo",
        "Llave de repuesto",
        "Tarjeta de circulacion vigente",
        "Comprobante de verificacion vigente",
        "Comprobantes de tenencias al corriente",
        "Manual del propietario",
        "Llanta de refaccion y herramientas",
    ];

    for (let i = 0; i < items.length; i++) {
        const col = i < 4 ? m + 3 : m + 90;
        const ry = y + (i < 4 ? i : i - 4) * 7;
        doc.setDrawColor(G[0], G[1], G[2]); doc.setLineWidth(0.4);
        doc.rect(col, ry - 3.8, 4.5, 4.5);
        doc.setTextColor(30, 30, 30);
        doc.text(items[i], col + 7, ry);
    }
    y += 4 * 7 + 8;

    // Section IV: Firmas
    if (y > 220) { doc.addPage(); pageBorder(doc); y = 20; }
    y = sectionBar(doc, "IV.  FIRMAS DE CONFORMIDAD", y, m, G);
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
    const cf = `Leido, entendido y aceptado en ${city}, a las ${time} horas del dia ${data.date}. Las partes firman la presente como constancia de la entrega fisica y legal del vehiculo.`;
    const cl2 = doc.splitTextToSize(cf, 167); doc.text(cl2, m + 1, y); y += cl2.length * 5 + 14;

    const sy3 = y + 12;
    [[m, "QUIEN ENTREGA (VENDEDOR)"], [120, "QUIEN RECIBE (COMPRADOR)"]].forEach(([sx, lbl]) => {
        const nx = Number(sx);
        doc.setDrawColor(G[0], G[1], G[2]); doc.setLineWidth(0.5);
        doc.line(nx, sy3, nx + 65, sy3);
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(G[0], G[1], G[2]);
        doc.text(String(lbl), nx + 32.5, sy3 + 4.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text("Nombre completo y firma", nx + 32.5, sy3 + 8.5, { align: "center" });
        doc.text("INE / Pasaporte No: ___________________", nx + 32.5, sy3 + 13, { align: "center" });
    });

    y = sy3 + 28;
    doc.setFillColor(235, 255, 245); doc.setDrawColor(G[0], G[1], G[2]); doc.setLineWidth(0.3);
    doc.roundedRect(m, y, 170, 14, 2, 2, "FD");
    doc.setFontSize(7.2); doc.setFont("helvetica", "bold"); doc.setTextColor(G[0], 100, 70);
    doc.text("AVISO IMPORTANTE: Este documento no sustituye el tramite de cambio de propietario", 105, y + 5, { align: "center" });
    doc.text("ante la autoridad vehicular correspondiente. Dicho tramite es obligacion del COMPRADOR.", 105, y + 9.5, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setTextColor(120, 120, 120);
    doc.text(`Folio: ${data.transactionId}  |  ${data.date} ${time}  |  StarterKar S.A.P.I. de C.V.`, 105, y + 13, { align: "center" });

    doc.save(`Carta_Responsiva_StarterKar_${data.transactionId}.pdf`);
}
