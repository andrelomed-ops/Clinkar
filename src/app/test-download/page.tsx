"use client";

export default function TestDownloadPage() {
    const testData = {
        transactionId: "TEST-001",
        carPrice: 350000,
        carDetails: { make: "BMW", model: "M3", year: 2022 },
        date: new Date().toLocaleDateString("es-MX"),
        time: "15:30 hrs",
        city: "Ciudad de México",
    };

    const handleContract = async () => {
        const { downloadContractClient } = await import("@/lib/documents/clientGenerator");
        await downloadContractClient(testData);
    };

    const handleResponsiva = async () => {
        const { downloadResponsivaClient } = await import("@/lib/documents/clientGenerator");
        await downloadResponsivaClient(testData);
    };

    return (
        <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 600 }}>
            <h1 style={{ marginBottom: 8 }}>Test de Descarga de Documentos</h1>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
                Presiona los botones para generar y descargar los documentos legales de StarterKar.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button
                    onClick={handleContract}
                    style={{ padding: "14px 28px", background: "#4f46e5", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: "bold" }}
                >
                    Descargar Contrato PROFECO
                </button>
                <button
                    onClick={handleResponsiva}
                    style={{ padding: "14px 28px", background: "#059669", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: "bold" }}
                >
                    Descargar Carta Responsiva
                </button>
            </div>
        </div>
    );
}
