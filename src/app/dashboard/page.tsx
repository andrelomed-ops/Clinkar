"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CreditCard, Clock, CheckCircle2, QrCode, ArrowRight, MapPin, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { VaultStatus } from "@/components/dashboard/VaultStatus";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { UnifiedVehicleStatusView } from "@/components/dashboard/UnifiedVehicleStatusView";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ActiveOperationView } from "@/components/dashboard/ActiveOperationView";
import { SidebarPromo } from "@/components/dashboard/SidebarPromo";

// ... existing imports ...

// ... inside the component ...
// ... inside the component ...

export default function DashboardPage() {
    // Mock Data for Multiple Transactions (Fleet/Garage scenario)
    const [transactions, setTransactions] = useState([
        {
            id: "tx-001",
            carName: "Mazda 3 Sport",
            year: 2021,
            price: 320000,
            status: "PENDING",
            legalStatus: "VERIFIED",
            mechanicalStatus: "VERIFIED",
            contractStatus: "SIGNED",
            role: "buyer",
            location: "CDMX"
        },
        {
            id: "tx-002",
            carName: "Volkswagen Jetta",
            year: 2023,
            price: 450000,
            status: "PENDING",
            legalStatus: "PENDING",
            mechanicalStatus: "PENDING",
            contractStatus: "PENDING",
            role: "seller",
            location: "Sonora"
        },

        {
            id: "tx-003",
            carName: "Toyota Rav4 Hybrid",
            year: 2020,
            price: 580000,
            status: "RELEASED",
            legalStatus: "VERIFIED",
            mechanicalStatus: "VERIFIED",
            contractStatus: "SIGNED",
            role: "buyer"
        },
        {
            id: "tx-004", // NEW IMMOBILIZED SCENARIO
            carName: "Ford Lobo Raptor",
            year: 2019,
            price: 1150000,
            status: "BLOCKED",
            legalStatus: "VERIFIED",
            mechanicalStatus: "IMMOBILIZED", // Critical Status
            contractStatus: "DRAFT",
            role: "seller",
            location: "Jalisco"
        }
    ]);

    const [selectedId, setSelectedId] = useState<string>("tx-001");
    const [role, setRole] = useState<string>("buyer"); // Global role context (user identity)
    const [mounted, setMounted] = useState(false);

    // Derived selected transaction
    const selectedTransaction = transactions.find(t => t.id === selectedId) || transactions[0];

    // Client-side role check (Simulated Auth)
    useEffect(() => {
        console.log("Dashboard: Component mounted, checking role...");
        const match = document.cookie.match(/clinkar_role=([^;]+)/);
        if (match) {
            console.log("Dashboard: Role found:", match[1]);
            setRole(match[1]);
        } else {
            console.log("Dashboard: No role found in cookies, defaulting to buyer");
        }
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground animate-pulse">Cargando tu cuenta segura...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-secondary/30 overflow-hidden">
            {/* ... Navbar ... */}
            <nav className="border-b bg-background px-6 h-16 shrink-0 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <Link href="/login" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowRight className="h-5 w-5 rotate-180" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold">Mi Clinkar ({role === 'seller' ? 'Vendedor' : 'Comprador'})</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Location Context Picker (Mock) */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>CDMX</span>
                    </div>

                    <NotificationBell />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">JD</div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR: GARAGE LIST - Full Height, Scrollable */}
                <div className="w-full lg:w-80 shrink-0 border-r border-border/50 bg-white/50 flex flex-col h-full overflow-hidden">
                    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
                        <div className="lg:hidden mb-4">
                            {/* Mobile Header Inside Sidebar */}
                            <h1 className="text-xl font-bold tracking-tight">Tu Cuenta</h1>
                        </div>

                        <TransactionList
                            transactions={transactions as any}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />

                        <SidebarPromo role={role} />
                    </div>
                </div>

                {/* MAIN CONTENT: ACTIVE OPERATION MONITOR - Full Height, Scrollable */}
                <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-12">
                    <div className="max-w-5xl mx-auto w-full">
                        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Tu Cuenta Segura</h1>
                                <p className="text-muted-foreground mt-2">Gestiona tu flotilla y operaciones activas.</p>
                            </div>

                            {/* SECONDARY QUICK ACTIONS */}
                            <div className="flex gap-3">
                                {role === 'buyer' ? (
                                    <a href="/market" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Nueva Compra
                                    </a>
                                ) : (
                                    <a href="/dashboard/sell" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                                        <CreditCard className="h-4 w-4" />
                                        Vender Otro Auto
                                    </a>
                                )}
                            </div>
                        </header>

                        <ActiveOperationView
                            transaction={selectedTransaction}
                            role={role}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}


