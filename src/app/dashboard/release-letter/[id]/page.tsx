import { LiabilityReleaseLetter } from "@/components/dashboard/LiabilityReleaseLetter";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getLegalProfile } from "@/lib/legal-compliance";

export default async function LiabilityReleasePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Transaction with related data
    const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .select(`
            *,
            cars (*),
            buyer:buyer_id (full_name, rfc, email),
            seller:seller_id (full_name, rfc, email)
        `)
        .eq('id', id)
        .single();

    if (transError || !transaction) {
        // Fallback for demo ID if needed for UI testing without DB
        if (id === 'demo-transaction' || id === 'demo' || id.startsWith('demo')) {
            return <LiabilityReleaseLetter transactionId={id} contract={getMockContract(id)} />;
        }
        console.error("Release Letter failed: Transaction not found", id);
        notFound();
    }

    const car = transaction.cars as any;
    const buyerProfile = transaction.buyer as any;
    const sellerProfile = transaction.seller as any;

    const legalProfile = getLegalProfile(car.location);

    const contract = {
        folio: `RESP-${id.slice(0, 8).toUpperCase()}-${new Date(transaction.created_at).getFullYear()}`,
        date: new Date(transaction.created_at).toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' }),
        seller: {
            name: sellerProfile?.full_name || "Vendedor Clinkar",
            rfc: sellerProfile?.rfc || "N/A",
            address: "Registrado en Plataforma"
        },
        buyer: {
            name: buyerProfile?.full_name || "Comprador Clinkar",
            rfc: buyerProfile?.rfc || "N/A",
            address: "Registrado en Plataforma"
        },
        vehicle: {
            make: car.make,
            model: car.model,
            year: car.year,
            vin: car.vin,
            color: car.color || "N/A",
            price: transaction.car_price,
            category: car.category,
            location: car.location,
            plates: car.plates,     // Assuming these fields exist or will be added
            engineNum: car.engine_number
        },
        legal: legalProfile
    };

    return (
        <LiabilityReleaseLetter transactionId={id} contract={contract} />
    );
}

function getMockContract(id: string) {
    return {
        folio: `RESP-DEMO-${new Date().getFullYear()}`,
        date: new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' }),
        seller: {
            name: "Vendedor Demo",
            rfc: "XAXX010101000",
            address: "Calle Demo 123"
        },
        buyer: {
            name: "Comprador Demo",
            rfc: "XAXX010101000",
            address: "Calle Demo 456"
        },
        vehicle: {
            make: "Toyota",
            model: "Rav4",
            year: 2020,
            vin: "3T1xxxxxxxxx",
            color: "Plata",
            price: 350000,
            category: "Car",
            location: "CDMX",
            plates: "ABC-123-D",
            engineNum: "2AZ-FE-123456"
        },
        legal: getLegalProfile('CDMX')
    };
}
