"use client";

import { downloadContractClient, downloadResponsivaClient } from "@/lib/documents/clientGenerator";

export default function TestDownloadPage() {
    const testData = {
        transactionId: "TEST-001",
        carPrice: 350000,
        carDetails: { make: "BMW", model: "M3", year: 2022 },
        date: new Date().toLocaleDateString("es-MX")
    };

    return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
            <h1>Test de Descarga de PDFs</h1>
            <p>Esta página verifica que la descarga de documentos funciona correctamente.</p>
            
            <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
                <button
                    onClick={() => downloadContractClient(testData)}
                    style={{ padding: "12px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold" }}
                >
                    📄 Descargar Contrato Test
                </button>
                
                <button
                    onClick={() => downloadResponsivaClient(testData)}
                    style={{ padding: "12px 24px", background: "#059669", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold" }}
                >
                    📋 Descargar Responsiva Test
                </button>
            </div>
            
            <p style={{ marginTop: 20, color: "#6b7280" }}>
                Si presionas los botones y aparece un archivo PDF en tus descargas, el sistema funciona correctamente.
            </p>
        </div>
    );
}
