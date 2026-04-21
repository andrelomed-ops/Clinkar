
"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Plus, LayoutDashboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AgentModeBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createBrowserClient();

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email === 'admin@starterkar.mx' || (user as any)?.role === 'admin') {
                setIsAdmin(true);
            }
        }
        checkAdmin();
    }, [supabase]);

    if (!isAdmin) return null;

    // Don't show in the dashboard/admin itself to avoid redundancy, but show in the public portal
    const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

    return (
        <div className={cn(
            "fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-4xl transition-all duration-500 animate-in slide-in-from-top-4",
            isDashboard ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
        )}>
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-2 pl-6 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-100">
                            Modo Agente Activo <span className="text-zinc-500 ml-1">• StarterKar Master</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push('/sell')}
                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors"
                    >
                        <Plus className="h-3 w-3 mr-2" /> Agregar Vehículo
                    </Button>
                    <div className="h-6 w-px bg-zinc-800" />
                    <Button 
                        size="sm"
                        onClick={() => router.push('/admin')}
                        className="h-9 px-4 rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest"
                    >
                        <LayoutDashboard className="h-3 w-3 mr-2" /> Panel de Control
                    </Button>
                </div>
            </div>
        </div>
    );
}
