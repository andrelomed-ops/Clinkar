import { TransactionDashboard } from "@/components/transaction/TransactionDashboard";
import { ALL_CARS } from "@/data/cars";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import Link from "next/link";

export default async function TransactionPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const car = ALL_CARS.find(c => c.id === id);

    if (!car) {
        notFound();
    }

    // Calculo de total (Mock)
    const operationFee = 3448;
    const total = car.price + operationFee;

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-border/40">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/market" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight">Clinkar Secure</span>
                    </Link>
                    <div className="text-xs font-mono text-muted-foreground">
                        ENCRYPTED CONNECTION
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                <TransactionDashboard car={car} totalPrice={total} />
            </main>
        </div>
    );
}
