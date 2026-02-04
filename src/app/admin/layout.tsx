import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-mono antialiased selection:bg-red-500/30">
            {/* Admin Navbar - High Contrast, Technical Look */}
            <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 h-14 flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="font-bold tracking-tight uppercase">Clinkar Ops</span>
                    </Link>
                    <div className="h-4 w-px bg-zinc-800" />
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                        <Link href="/admin" className="hover:text-zinc-300">Torre de Control</Link>
                        <Link href="/admin/inspector" className="hover:text-zinc-300">Inspector</Link>
                        <Link href="/admin/logistics" className="hover:text-zinc-300">Logística</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 animate-pulse">
                        SISTEMA ACTIVO
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="p-6">
                {children}
            </main>
        </div>
    );
}
