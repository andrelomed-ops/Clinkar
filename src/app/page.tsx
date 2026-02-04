import { ShieldCheck, ArrowRight, Lock, FileCheck, Wrench, CheckCircle2 } from "lucide-react";
import { ClinkarSeal } from "@/components/market/ClinkarSeal";
import Link from "next/link";
import { HeroTrackerDemo } from "@/components/landing/HeroTrackerDemo";
import { Navbar } from "@/components/ui/navbar";
import { JsonLd } from "@/components/seo/JsonLd";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Clinkar",
        "url": "https://clinkar.com",
        "logo": "https://clinkar.com/icon-512.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+52-55-0000-0000",
          "contactType": "customer service",
          "areaServed": "MX",
          "availableLanguage": "Spanish"
        },
        "sameAs": [
          "https://facebook.com/clinkar",
          "https://twitter.com/clinkar",
          "https://instagram.com/clinkar"
        ]
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Clinkar",
        "url": "https://clinkar.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://clinkar.com/buy?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }} />

      <Navbar variant="home" />

      <main className="flex-1 pt-32">

        {/* --- HERO SECTION: Pure & Trust-Based --- */}
        <section className="px-6 pb-24 md:pb-32 border-b border-border">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-20 items-center">

            {/* Left: Manifesto Copy */}
            <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bóveda Digital Activa</span>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-[60px] opacity-50 animate-pulse pointer-events-none" />
                <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter leading-[0.95] text-foreground animate-reveal relative z-10">
                  Confianza <br />
                  <span className="text-gradient">Transparente.</span>
                </h1>
              </div>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium animate-reveal stagger-1">
                La plataforma de compra-venta automotriz diseñada para la seguridad total. <strong>0% Comisión para el comprador</strong> y revisión mecánica certificada por expertos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-reveal stagger-2 w-full sm:w-auto justify-center lg:justify-start">
                <Link href="/buy" className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/10 glow-on-hover px-10">
                  Explorar Inventario
                </Link>
                <Link href="/sell" className="h-14 px-8 rounded-full border border-border bg-background text-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-muted transition-all active:scale-95">
                  Vender Auto
                </Link>
              </div>
            </div>

            {/* Right: The Demo (Minimalist) */}
            <div className="relative animate-reveal animate-float stagger-3">
              <HeroTrackerDemo />
            </div>

          </div>
        </section>

        {/* --- THE 3 PILLARS (Security First) --- */}
        <section id="security" className="py-24 bg-background border-t border-border">
          <div id="how-it-works" className="scroll-mt-32" />
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight text-foreground">El Estándar de Seguridad Clinkar.</h2>
              <p className="text-muted-foreground text-lg">
                No somos solo un marketplace. Somos el árbitro imparcial que garantiza la integridad de cada transacción a través de 3 pilares inquebrantables.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {/* Pillar 1: Mechanical */}
              <div className="glass-card p-8 rounded-3xl animate-reveal stagger-1">
                <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3 text-foreground">1. Revisión Mecánica</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  150 puntos de inspección certificados por expertos. Si el auto no pasa la revisión física, no se publica. Tú ves exactamente lo que compras, sin filtros.
                </p>
              </div>

              {/* Pillar 2: Legal */}
              <div className="glass-card p-8 rounded-3xl animate-reveal stagger-2">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3 text-foreground">2. Validación Legal</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Conexión directa con bases de datos gubernamentales (REPUVE, Fiscalía). Garantizamos &quot;0 Adeudos&quot; y &quot;0 Reportes de Robo&quot; antes de firmar.
                </p>
              </div>

              {/* Pillar 3: Contract */}
              <div className="glass-card p-8 rounded-3xl animate-reveal stagger-3">
                <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3 text-foreground">3. Contrato Blindado</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Nuestra tecnología genera contratos con validez jurídica oficial. Firmas digitales con sellos de tiempo que protegen a ambas partes Legalmente.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* --- SECONDARY VALUES & CTA --- */}
        <section className="py-24 px-6 border-t border-border">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading mb-6">Más allá de la seguridad.</h2>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">AI</span>
                  <div>
                    <h4 className="font-bold text-foreground">Inteligencia de Datos</h4>
                    <p className="text-sm text-muted-foreground">Precios justos calculados algorítmicamente.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">0% Comisión Comprador</h4>
                    <p className="text-sm text-muted-foreground">En Clinkar, el comprador no paga comisiones de gestión. Directo y transparente.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-secondary rounded-[2rem] p-12 text-center">
              <h3 className="text-2xl font-bold font-heading mb-4 text-foreground">Experiencia Premium</h3>
              <p className="text-muted-foreground mb-8">
                Únete a la plataforma que prioriza la paz mental sobre la velocidad.
              </p>
              <Link href="/buy" className="inline-flex h-12 px-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold items-center hover:scale-105 transition-transform">
                Ver Autos Certificados <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>


    </div>
  );
}
