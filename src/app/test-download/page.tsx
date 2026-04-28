"use client";

import { useState } from "react";

export default function TestDownloadPage() {
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const testData = {
        transactionId: "TEST-001",
        carPrice: 350000,
        carDetails: { make: "BMW", model: "M3", year: 2022 },
        date: new Date().toLocaleDateString("es-MX"),
        time: "15:30 hrs",
        city: "Ciudad de México",
    };

    const handleContract = async () => {
        setStatus("Generando contrato...");
        setError("");
        try {
            const mod = await import("@/lib/documents/clientGenerator");
            await mod.downloadContractClient(testData);
            setStatus("Contrato generado exitosamente.");
        } catch (e: any) {
            setError("ERROR CONTRATO: " + (e?.message || String(e)));
            setStatus("");
            console.error(e);
        }
    };

    const handleResponsiva = async () => {
        setStatus("Generando carta responsiva...");
        setError("");
        try {
            const mod = await import("@/lib/documents/clientGenerator");
            await mod.downloadResponsivaClient(testData);
            setStatus("Carta responsiva generada exitosamente.");
        } catch (e: any) {
            setError("ERROR RESPONSIVA: " + (e?.message || String(e)));
            setStatus("");
            console.error(e);
        }
    };

    return (
        <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 640 }}>
            <h1 style={{ marginBottom: 8 }}>Test de Descarga de Documentos</h1>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
                Presiona los botones para generar los documentos legales.
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

            {status && (
                <div style={{ marginTop: 20, padding: 12, background: "#d1fae5", borderRadius: 8, color: "#065f46", fontWeight: "bold" }}>
                    {status}
                </div>
            )}

            {error && (
                <div style={{ marginTop: 20, padding: 12, background: "#fee2e2", borderRadius: 8, color: "#991b1b", fontFamily: "monospace", fontSize: 13, wordBreak: "break-all" }}>
                    {error}
                </div>
            )}
        </div>
    );
}
