import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Admin Layout Fallback
if (typeof window !== 'undefined') {
    (window as any).AlertCircle = (window as any).AlertCircle || (() => null);
}


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-mono antialiased selection:bg-red-500/30">
            {/* Admin Navbar - High Contrast, Technical Look */}
            <nav className="border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 z-[100] h-16 flex items-center px-8 justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="flex items-center gap-3 text-indigo-500 hover:text-indigo-400 transition-colors">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldAlert className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black tracking-tighter uppercase italic text-zinc-100">StarterKar <span className="text-indigo-500">Ops</span></span>
                    </Link>
                    <div className="h-4 w-px bg-zinc-800" />
                    <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <Link href="/admin" className="hover:text-white transition-colors">Torre de Control</Link>
                        <Link href="/admin/inspector" className="hover:text-white transition-colors text-zinc-600">Mecánicos</Link>
                        <Link href="/admin/legal" className="hover:text-white transition-colors text-zinc-600">Legal</Link>
                        <Link href="/admin/partners" className="hover:text-white transition-colors text-zinc-600">Talleres</Link>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black border border-emerald-500/20 uppercase tracking-[0.2em]">
                        Sistema Activo • v6.0.2
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            <main>
                {children}
            </main>
        </div>
    );
}
