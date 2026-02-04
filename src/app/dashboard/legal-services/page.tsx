"use client";

import { LegalServicesView } from "@/components/dashboard/LegalServicesView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalServicesPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Volver al Dashboard
                </Link>

                <div className="animate-in slide-in-from-left-4">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Servicios Legales y Compliance</h1>
                    <p className="text-muted-foreground">Gestiona tus obligaciones vehiculares y verifica el cumplimiento normativo.</p>
                </div>

                <div className="animate-in fade-in zoom-in-95 duration-500 delay-100">
                    <LegalServicesView />
                </div>
            </div>
        </div>
    );
}
