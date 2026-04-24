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
            .select("*, cars(*)")
            .eq("id", transactionId)
            .single();

        if (error || !tx) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        data = {
            transactionId: tx.id,
            carPrice: tx.car_price,
            carDetails: {
                make: tx.cars.make,
                model: tx.cars.model,
                year: tx.cars.year,
                vin: tx.cars.vin,
                plates: tx.cars.plates
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
    } catch (e) {
        console.error("PDF Generation error:", e);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
