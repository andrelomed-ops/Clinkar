"use client";

import { PartnersView } from "@/components/dashboard/partners/PartnersView";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock Data Generators
const generateTickets = (role: string) => {
    const baseTicket = {
        id: "ticket-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scheduled_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        payout_amount: 1200,
        payout_status: "PENDING",
        total_amount: 1500,
        currency: "MXN",
        partner_id: "demo-partner",
        notes: "Demo Ticket"
    };

    const car = {
        id: "car-demo",
        make: "Toyota",
        model: "Camry Hybrid",
        year: 2023,
        location: "Polanco, CDMX",
        images: []
    };

    if (role === 'LOGISTICS') {
        return [
            {
                ...baseTicket,
                id: "log-001",
                type: "TOWING",
                status: "ASSIGNED",
                notes: "Traslado en plataforma solicitado",
                cars: { ...car, model: "BMW X5", location: "Santa Fe -> Interlomas" },
                payout_amount: 2500
            },
            {
                ...baseTicket,
                id: "log-002",
                type: "TOWING",
                status: "IN_PROGRESS",
                notes: "Unidad en camino al centro de inspección",
                cars: { ...car, make: "Mazda", model: "CX-5", location: "Del Valle" },
                payout_amount: 1800
            }
        ];
    }

    if (role === 'LEGAL') {
        return [
            {
                ...baseTicket,
                id: "leg-001",
                type: "LEGAL",
                status: "IN_PROGRESS",
                notes: "Validación de factura de origen y tenencias",
                cars: { ...car, make: "Mercedes-Benz", model: "C-200" },
                payout_amount: 3500
            },
            {
                ...baseTicket,
                id: "leg-002",
                type: "LEGAL",
                status: "COMPLETED",
                payout_status: "PAID_TO_PARTNER",
                notes: "Certificación de no robo completada",
                cars: { ...car, make: "Audi", model: "Q5" },
                payout_amount: 1200
            }
        ];
    }

    // Default: Inspection / Credit
    return [
        {
            ...baseTicket,
            id: "insp-001",
            type: "INSPECTION",
            status: "SCHEDULED",
            notes: "Inspección de 150 puntos estándar",
            cars: car,
            payout_amount: 850
        }
    ];
};

export default function PartnerDashboardPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Read cookie
        const match = document.cookie.match(new RegExp('(^| )clinkar_partner_role=([^;]+)'));
        const roleValue = match ? match[2] : null;

        if (!roleValue) {
            router.push("/partner");
            return;
        }

        setRole(roleValue);

        // Simulate API delay
        setTimeout(() => {
            setTickets(generateTickets(roleValue));
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black p-6 md:p-12">
            <PartnersView
                initialTickets={tickets}
                feeConfig={{}} // Not used in demo
                currentRole={role || 'INSPECTION'}
            />
        </div>
    );
}
