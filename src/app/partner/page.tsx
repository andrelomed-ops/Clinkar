"use client";

import { Shield, Truck, Scale, Wrench, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PartnerLandingPage() {
    const router = useRouter();

    const selectRole = (role: string) => {
        // Set cookie for demo purposes
        document.cookie = `clinkar_partner_role=${role}; path=/`;
        router.push("/partner/dashboard");
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="border-b border-white/10 p-6 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-indigo-500" />
                    <span className="font-bold text-xl tracking-tight">Clinkar <span className="text-indigo-400">Partners</span></span>
                </div>
                <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    Portal Corporativo
                </Link>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center space-y-6 mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Building2 className="h-3 w-3" /> Ecosistema B2B
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                        Gestiona tus Operaciones.
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        La plataforma centralizada para nuestros aliados estratégicos. Selecciona tu perfil para acceder al entorno de demostración.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card: Logistics */}
                    <div
                        onClick={() => selectRole('LOGISTICS')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2rem] opacity-20 group-hover:opacity-100 transition duration-500 blur-xl group-hover:blur-2xl" />
                        <div className="relative bg-zinc-900 rounded-[2rem] p-8 h-full border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-400">
                                <Truck className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Logística y Grúas</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Gestión de traslados, recolección de unidades y seguimiento GPS en tiempo real.
                            </p>
                            <div className="flex items-center text-blue-400 text-sm font-bold group-hover:gap-2 transition-all">
                                Acceder al Panel <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Card: Legal */}
                    <div
                        onClick={() => selectRole('LEGAL')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] opacity-20 group-hover:opacity-100 transition duration-500 blur-xl group-hover:blur-2xl" />
                        <div className="relative bg-zinc-900 rounded-[2rem] p-8 h-full border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-400">
                                <Scale className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Legal y Trámites</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Validación de expedientes, gestoría vehicular y certificación de títulos de propiedad.
                            </p>
                            <div className="flex items-center text-indigo-400 text-sm font-bold group-hover:gap-2 transition-all">
                                Acceder al Panel <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Card: Inspection */}
                    <div
                        onClick={() => selectRole('INSPECTION')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] opacity-20 group-hover:opacity-100 transition duration-500 blur-xl group-hover:blur-2xl" />
                        <div className="relative bg-zinc-900 rounded-[2rem] p-8 h-full border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-400">
                                <Wrench className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Taller y Crédito</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Centros de inspección certificados y entidades financieras para pre-aprobación.
                            </p>
                            <div className="flex items-center text-amber-400 text-sm font-bold group-hover:gap-2 transition-all">
                                Acceder al Panel <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-32 text-center border-t border-white/5 pt-8">
                    <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest">
                        © 2024 Clinkar Network. Access Restricted to Authorized Partners.
                    </p>
                </footer>
            </main>
        </div>
    );
}
