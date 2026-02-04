
"use client";

import { Shield, BookOpen, UserCheck, CreditCard, Key, FilePlus, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";

const HELP_CATEGORIES = [
    {
        title: "Para Compradores",
        icon: <UserCheck className="h-6 w-6 text-indigo-600" />,
        articles: [
            "Cómo comprar tu primer auto en Clinkar",
            "Entendiendo el reporte de 150 puntos",
            "El proceso de pago y resguardo en Bóveda",
            "Trámites legales y cambio de propietario"
        ]
    },
    {
        title: "Para Vendedores",
        icon: <FilePlus className="h-6 w-6 text-green-600" />,
        articles: [
            "Guía para publicar tu auto con éxito",
            "Preparando tu auto para la inspección",
            "Cómo funciona el pago garantizado",
            "Documentación necesaria para la venta"
        ]
    },
    {
        title: "Pagos y Bóveda",
        icon: <CreditCard className="h-6 w-6 text-amber-600" />,
        articles: [
            "Métodos de pago aceptados",
            "Tiempos de liberación de fondos",
            "Comisiones y costos de servicio",
            "Seguridad de los datos financieros"
        ]
    },
    {
        title: "Cuenta y Seguridad",
        icon: <Key className="h-6 w-6 text-purple-600" />,
        articles: [
            "Verificación de identidad (KYC)",
            "Recuperar acceso a mi cuenta",
            "Privacidad y protección de datos",
            "Reportar actividades sospechosas"
        ]
    }
];

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            {/* Search Header */}
            <section className="relative py-24 px-6 overflow-hidden bg-secondary/30">
                <div className="max-w-4xl mx-auto text-center space-y-8 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-black uppercase tracking-widest">
                        <BookOpen className="h-4 w-4" /> Centro de Ayuda
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                        ¿Cómo podemos <span className="text-indigo-600">ayudarte?</span>
                    </h1>

                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-x-0 -bottom-2 h-full bg-indigo-500/10 blur-2xl rounded-3xl group-hover:bg-indigo-500/20 transition-all opacity-0 group-hover:opacity-100" />
                        <div className="relative flex items-center bg-background rounded-[2rem] border-2 border-border p-2 focus-within:border-indigo-500/50 shadow-xl shadow-indigo-500/5 transition-all">
                            <Search className="h-6 w-6 ml-6 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Busca guías, procesos o dudas..."
                                className="flex-1 bg-transparent border-none px-6 py-4 font-bold focus:ring-0 text-lg"
                            />
                            <button className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-bold hover:scale-[1.02] active:scale-95 transition-all">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {HELP_CATEGORIES.map((cat, idx) => (
                        <div key={idx} className="space-y-6 animate-reveal" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-secondary">{cat.icon}</div>
                                <h2 className="font-extrabold text-lg uppercase tracking-tight">{cat.title}</h2>
                            </div>
                            <ul className="space-y-3">
                                {cat.articles.map((art, artIdx) => (
                                    <li key={artIdx}>
                                        <button className="w-full text-left text-sm font-bold text-muted-foreground hover:text-indigo-600 flex items-center justify-between group py-2 border-b border-border/50">
                                            <span className="flex-1 pr-4">{art}</span>
                                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Guide */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="bg-indigo-600 rounded-[4rem] p-12 md:p-20 text-white overflow-hidden relative shadow-2xl shadow-indigo-500/30">
                    <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-white/10 to-transparent blur-3xl" />
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em]">Guía Destacada</div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                                La Bóveda <br /> <span className="text-indigo-200">Explicada</span>
                            </h2>
                            <p className="text-lg text-indigo-500 text-indigo-100 font-medium leading-relaxed">
                                Descubre por qué Clinkar es el método más seguro para transferir la propiedad de un vehículo en Latinoamérica.
                            </p>
                            <button className="h-16 px-10 rounded-2xl bg-white text-indigo-600 font-black text-lg hover:scale-105 active:scale-95 shadow-xl shadow-black/20 transition-all">
                                Leer Guía Completa
                            </button>
                        </div>
                        <div className="hidden md:flex justify-center">
                            <div className="h-80 w-80 rounded-[3rem] border-8 border-white/10 flex items-center justify-center rotate-12 bg-white/5 backdrop-blur-sm">
                                <Shield className="h-40 w-40 text-white/40" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Still No Luck? footer */}
            <footer className="max-w-4xl mx-auto px-6 pb-32 text-center space-y-8">
                <div className="h-px w-full bg-border" />
                <h3 className="text-2xl font-black">¿No encontraste lo que buscabas?</h3>
                <p className="text-muted-foreground font-medium">Nuestro equipo de expertos humanos está a un click de distancia.</p>
                <div className="flex justify-center gap-4">
                    <Link href="/contact" className="px-10 h-14 rounded-2xl bg-secondary text-foreground font-bold flex items-center hover:bg-secondary/70 transition-all">
                        Contactar Soporte
                    </Link>
                    <Link href="/login" className="px-10 h-14 rounded-2xl bg-indigo-600 text-white font-bold flex items-center hover:scale-105 transition-all shadow-lg shadow-indigo-500/20">
                        Ir a mi Cuenta
                    </Link>
                </div>
            </footer>
        </div>
    );
}
