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
    console.log("Server PDF generation is disabled. Use client-side generation.");
    return Buffer.from("PDF Disabled");
}

export async function generateResponsivaPDF(data: DocumentData) {
    console.log("Server PDF generation is disabled. Use client-side generation.");
    return Buffer.from("PDF Disabled");
}

export async function generateCertificatePDF(data: DocumentData) {
    console.log("Server PDF generation is disabled. Use client-side generation.");
    return Buffer.from("PDF Disabled");
}
