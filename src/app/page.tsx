import { ShieldCheck, ArrowRight, Lock, FileCheck, Wrench, CheckCircle2 } from "lucide-react";
import { StarterKarSeal } from "@/components/market/StarterKarSeal";
import Link from "next/link";
import { HeroTrackerDemo } from "@/components/landing/HeroTrackerDemo";
import { Navbar } from "@/components/ui/navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";

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
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Bóveda Digital Activa</span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000">
                CONFIANZA<br />
                <span className="text-indigo-600 italic">TRANSPARENTE</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                La plataforma de compra-venta diseñada para la seguridad total. <br className="hidden md:block" />
                <span className="text-foreground font-bold">0% Comisión Comprador</span> y revisión mecánica certificada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Link href="/buy" className="h-16 px-12 rounded-2xl bg-zinc-950 text-white font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-500/20">
                  Explorar Inventario
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/sell" className="h-16 px-12 rounded-2xl border-2 border-border bg-background text-foreground font-black text-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-[0.98]">
                  Vender mi Auto
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border w-full max-w-4xl animate-in fade-in duration-1000 delay-500">
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

        {/* --- THE 3 PILLARS: Clean & Professional --- */}
        <section id="security" className="py-32 bg-secondary/30">
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
