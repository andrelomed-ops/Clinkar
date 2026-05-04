import { ShieldCheck, ArrowRight, Lock, FileCheck, Wrench, CheckCircle2 } from "lucide-react";
import { StarterKarSeal } from "@/components/market/StarterKarSeal";
import Link from "next/link";
import { HeroTrackerDemo } from "@/components/landing/HeroTrackerDemo";
import { Navbar } from "@/components/ui/navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";

import { InteractiveProcess } from "@/components/landing/InteractiveProcess";

// Production Deployment v4.5 - Stabilization
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "StarterKar",
        "url": "https://starterkar.com",
        "logo": "https://starterkar.com/icon-512.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+52-55-0000-0000",
          "contactType": "customer service",
          "areaServed": "MX",
          "availableLanguage": "Spanish"
        },
        "sameAs": [
          "https://facebook.com/starterkar",
          "https://twitter.com/starterkar",
          "https://instagram.com/starterkar"
        ]
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "StarterKar",
        "url": "https://starterkar.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://starterkar.com/buy?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }} />

      <Navbar variant="home" />

      <main className="flex-1">
        
        {/* --- HERO SECTION: Impactful & Minimalist --- */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-500 rounded-full blur-[100px] animate-pulse delay-700" />
          </div>

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">De particular a particular, sin riesgos</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000">
                Vende a precio real.<br />
                <span className="text-indigo-600 italic uppercase">Y síguelo manejando.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                No malbarates tu vehículo en lotes ni compres autos a ciegas. Te llevamos de la mano con <span className="text-foreground font-bold">acompañamiento personal</span> paso a paso para lograr un trato justo. Certificamos la mecánica, blindamos el pago y aseguramos la legalidad <span className="text-foreground font-bold">para ambas partes</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Link href="/sell" className="h-16 px-12 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-500/20">
                  Vender a Precio Justo
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/buy" className="h-16 px-12 rounded-2xl border-2 border-border bg-background text-foreground font-black text-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-[0.98]">
                  Comprar con 0% Comisión
                </Link>
              </div>

              {/* THE VERSUS SECTION */}
              <div className="w-full max-w-5xl pt-16 md:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  {/* The Bad Guys */}
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                    <h3 className="text-xl md:text-2xl font-black text-red-600 dark:text-red-500 tracking-tight mb-6 flex items-center gap-3">
                      El Mercado Tradicional
                      <span className="text-xs font-bold bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-md text-red-600 dark:text-red-400 tracking-widest">(Agencias, Lotes y Coyotes)</span>
                    </h3>
                    <ul className="space-y-6">
                      <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold mt-0.5">✖</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                          <strong className="text-red-600 dark:text-red-400">Abuso en el precio:</strong> Se aprovechan de la necesidad. Inventan fallas con mecánicos cómplices para tirarte el precio al suelo y revender carísimo.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold mt-0.5">✖</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                          <strong className="text-red-600 dark:text-red-400">Riesgo y Fraude Constante:</strong> Te expones a asaltos, cheques sin fondo y autos "remarcados" que hasta las grandes agencias y plataformas famosas terminan vendiendo.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold mt-0.5">✖</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                          <strong className="text-red-600 dark:text-red-400">Te dejan a pie:</strong> Te quitan tu auto y lo retienen en bodegas cerradas por meses mientras intentan venderlo. Pierdes el control de tu patrimonio.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* The Good Guys */}
                  <div className="bg-indigo-600 dark:bg-indigo-900/40 border border-indigo-500/30 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden text-white shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      La Revolución StarterKar
                    </h3>
                    <ul className="space-y-6 relative z-10">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-indigo-50 dark:text-indigo-100 font-medium leading-relaxed">
                          <strong className="text-white">Justicia Comercial (Ganas el 100%):</strong> El precio se fija por la realidad del mercado y las condiciones del auto, no por las ganas de ganar de una agencia.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-indigo-50 dark:text-indigo-100 font-medium leading-relaxed">
                          <strong className="text-white">Árbitros Imparciales (Cero Riesgos):</strong> Nuestros Asesores son guardianes de la seguridad. Evitamos fraudes mecánicos, legales y financieros para proteger a ambas partes.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-indigo-50 dark:text-indigo-100 font-medium leading-relaxed">
                          <strong className="text-white">Tu auto se queda contigo:</strong> Inviertes en certificar tu auto para avalar su calidad, y lo sigues manejando de forma normal hasta el momento exacto de la entrega.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Trust Metrics */}
              <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border w-full max-w-4xl animate-in fade-in duration-1000 delay-700">
                <div className="space-y-1">
                  <p className="text-2xl font-black tracking-tighter">150</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pts Inspección</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black tracking-tighter">0%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comisión</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black tracking-tighter">100%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pago Seguro</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black tracking-tighter">24/7</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Soporte IA</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- THE 3 PILLARS: Security Features --- */}
        <section id="security" className="py-32 bg-secondary/30 relative border-t border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tight italic">01. REVISIÓN TÉCNICA</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Inspección profunda de 150 puntos. Si el auto no es perfecto mecánicamente, no entra a nuestra bóveda. Transparencia absoluta.
                </p>
              </div>

              <div className="space-y-6">
                <div className="h-14 w-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tight italic">02. BLINDAJE LEGAL</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Validación directa con REPUVE y Fiscalía. Garantizamos que cada vehículo sea legalmente impecable antes de cualquier firma.
                </p>
              </div>

              <div className="space-y-6">
                <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tight italic">03. CONTRATO DIGITAL</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Tecnología de firma electrónica con validez jurídica. Protegemos tu inversión con contratos inteligentes y sellos de tiempo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS: The Interactive Process --- */}
        <InteractiveProcess />

        {/* --- FINAL CTA --- */}
        <section className="py-32 px-6">
          <div className="mx-auto max-w-5xl rounded-[3rem] bg-zinc-950 p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">EXPERIENCIA PREMIUM</h2>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                Únete a la plataforma que prioriza la paz mental sobre la velocidad. Compra y vende con la seguridad de una bóveda.
              </p>
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl bg-white text-zinc-950 font-black hover:bg-zinc-200 transition-all">
                <Link href="/buy">
                  Ver Autos Certificados
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>


    </div>
  );
}
