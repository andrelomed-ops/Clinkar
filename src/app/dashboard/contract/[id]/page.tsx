import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ContractView } from "@/components/dashboard/ContractView";
import { getLegalProfile } from "@/lib/legal-compliance";

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
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
        console.error("Contract failed: Transaction not found", id);
        notFound();
    }

    const car = transaction.cars as any;
    const buyerProfile = transaction.buyer as any;
    const sellerProfile = transaction.seller as any;

    const legalProfile = getLegalProfile(car.location);

    const contract = {
        folio: `CLK-${id.slice(0, 8).toUpperCase()}-${new Date(transaction.created_at).getFullYear()}`,
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
            location: car.location
        },
        legal: legalProfile
    };

    return <ContractView contract={contract} id={id} />;
}
