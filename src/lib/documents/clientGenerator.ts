import { jsPDF } from "jspdf";

export async function downloadContractClient(data: any) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(18);
    doc.text("CONTRATO DE COMPRAVENTA", 105, y, { align: "center" });
    y += 20;
    
    doc.setFontSize(10);
    const text = `Contrato de compraventa del vehículo ${data.carDetails.make} ${data.carDetails.model} ${data.carDetails.year} con folio ${data.transactionId}. 
    Monto liquidado: $${data.carPrice.toLocaleString()} MXN.
    
    Este documento es una constancia de la operación realizada a través de la plataforma StarterKar.`;
    
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    
    doc.save(`Contrato_${data.transactionId}.pdf`);
}

export async function downloadResponsivaClient(data: any) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(18);
    doc.text("CARTA RESPONSIVA", 105, y, { align: "center" });
    y += 20;
    
    doc.setFontSize(10);
    const text = `Se confirma la entrega física y legal del vehículo con folio ${data.transactionId}.
    El comprador asume toda responsabilidad civil y penal sobre la unidad a partir de esta fecha: ${data.date}.`;
    
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    
    doc.save(`Responsiva_${data.transactionId}.pdf`);
}
