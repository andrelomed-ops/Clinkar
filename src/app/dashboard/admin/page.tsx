import { TransactionService } from "@/services/TransactionService";
import { AdminDashboardView } from "@/components/dashboard/admin/AdminDashboardView";
import { MasterTransactionTable } from "@/components/dashboard/admin/MasterTransactionTable";
import { AdminDocumentManager } from "@/components/dashboard/admin/AdminDocumentManager";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // 1. Fetch Stats & Transactions in parallel
    const [stats, transactions, authRes] = await Promise.all([
        TransactionService.getGlobalStats(supabase),
        TransactionService.getAllTransactions(supabase),
        supabase.auth.getUser()
    ]);

    const user = authRes.data?.user;

    const mockDocs = [
        {
            id: "DOC-2024-001",
            type: "Identificación" as const,
            status: "PENDING" as const,
            url: "https://images.unsplash.com/photo-1548316259-7d0460d3fc89?auto=format&fit=crop&q=80&w=1000",
            updatedAt: new Date().toLocaleDateString(),
            userId: user?.id || ""
        },
        {
            id: "DOC-2024-002",
            type: "Factura" as const,
            status: "PENDING" as const,
            url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000",
            updatedAt: new Date().toLocaleDateString(),
            userId: user?.id || ""
        },
        {
            id: "DOC-2024-003",
            type: "Tenencia" as const,
            status: "APPROVED" as const,
            url: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=1000",
            updatedAt: new Date().toLocaleDateString(),
            userId: user?.id || ""
        }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
            {/* Security Banner */}
            <div className="bg-zinc-900 text-zinc-400 px-6 py-3 rounded-2xl flex items-center justify-between border border-zinc-800">
                <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-bold text-zinc-100">Sesión de Super Admin Activa</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-600 border border-zinc-700 px-2 py-0.5 rounded">Clinkar Internal</span>
                </div>
                <div className="text-[10px] font-mono">
                    Node: clk-control-01-mx
                </div>
            </div>

            <AdminDashboardView stats={stats} />

            <MasterTransactionTable transactions={transactions} />

            <div className="border-t border-border pt-12">
                <AdminDocumentManager initialDocuments={mockDocs} />
            </div>

            <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground font-medium italic">
                <p>© 2026 Clinkar S.A. de C.V. - Plataforma de Control Interno</p>
                <p>Las acciones administrativas quedan registradas en el log de auditoría global.</p>
            </footer>
        </div>
    );
}
