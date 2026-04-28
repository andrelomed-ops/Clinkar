import { NextRequest, NextResponse } from "next/server";
import { generateContractPDF, generateResponsivaPDF, generateCertificatePDF, DocumentData } from "@/lib/documents/generator";
import { createClient } from "@supabase/supabase-js";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;
    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get("id");

    if (!transactionId) {
        return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    // Mock data for demo/mock IDs
    let data: DocumentData;

    if (transactionId.startsWith("mock-")) {
        data = {
            transactionId,
            carPrice: 385000,
            carDetails: {
                make: "BMW",
                model: "M3 Sedan",
                year: 2021,
                vin: "WBA1234567890X",
                plates: "ST-KAR-01",
                color: "Midnight Blue"
            },
            date: new Date().toLocaleDateString("es-MX")
        };
    } else {
        // Fetch from Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: tx, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("id", transactionId)
            .single();

        if (error || !tx) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Manual fetch of car to handle missing FKs
        const { data: carData } = await supabase
            .from("cars")
            .select("*")
            .eq("id", tx.car_id)
            .single();

        data = {
            transactionId: tx.id,
            carPrice: tx.car_price,
            carDetails: {
                make: carData?.make || "Desconocido",
                model: carData?.model || "Desconocido",
                year: carData?.year || 0,
                vin: carData?.vin || "SIN-VIN",
                plates: carData?.plates || "SIN-PLACAS",
                color: carData?.color || "N/A"
            },
            date: new Date().toLocaleDateString("es-MX")
        };
    }

    let pdfBuffer: ArrayBuffer;

    try {
        switch (type) {
            case "contract":
                pdfBuffer = await generateContractPDF(data);
                break;
            case "responsiva":
                pdfBuffer = await generateResponsivaPDF(data);
                break;
            case "certificate":
                pdfBuffer = await generateCertificatePDF(data);
                break;
            default:
                return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
        }

        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${type}_${transactionId}.pdf"`,
            },
        });
    } catch (e: any) {
        console.error("PDF Generation error:", e);
        return NextResponse.json({ 
            error: "Failed to generate PDF", 
            details: e.message,
            stack: e.stack,
            type: type,
            id: transactionId
        }, { status: 500 });
    }
}
