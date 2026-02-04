import Link from "next/link";
import { TransactionService } from "@/services/TransactionService";
import { CarService } from "@/services/CarService";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import { ALL_CARS } from "@/data/cars";
import { TransactionDashboard } from "@/components/transaction/TransactionDashboard";

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Transaction
    const transaction = await TransactionService.getTransactionById(supabase, id);
    if (!transaction) {
        notFound();
    }

    // 2. Fetch Car (Hybrid: DB or Mock)
    const dbCar = await CarService.getCarById(supabase, transaction.car_id);
    const car = dbCar || ALL_CARS.find(c => c.id === transaction.car_id);

    if (!car) {
        notFound();
    }

    // Calculo de total (Mock or DB)
    const operationFee = 3448;
    const initialPrice = transaction.car_price || car.price;

    // Deterministic Mock Data for Negotiation Logic (based on ID)
    const repairCosts = Math.floor(initialPrice * 0.12); // ~12% repairs
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const marketValue = initialPrice + repairCosts + (seed % 5000);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-500">
            <nav className="fixed top-0 z-50 w-full bg-white dark:bg-zinc-950 border-b border-border/40 dark:border-zinc-800">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    {/* Left: Back to Market */}
                    <Link href="/buy" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-colors">
                        <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                            <span className="block h-0 w-0 border-y-[3px] border-y-transparent border-r-[4px] border-r-current rotate-180" />
                        </div>
                        <span className="font-semibold text-sm">Cancelar</span>
                    </Link>

                    {/* Center: Brand Logo */}
                    <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 group">
                        <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold tracking-tight hidden sm:block">Clinkar Secure</span>
                    </Link>

                    {/* Right: Security Badge */}
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                        ENCRYPTED
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                <TransactionDashboard
                    car={car}
                    initialPrice={initialPrice}
                    marketValue={marketValue}
                    repairCosts={repairCosts}
                />
            </main>
        </div>
    );
}
