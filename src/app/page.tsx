import { ShieldCheck, ArrowRight, Lock, FileCheck, Wrench, CheckCircle2, TrendingUp, Zap, Settings, Users } from "lucide-react";
import Image from "next/image";
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

              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none md:leading-[0.85] text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 py-2">
                Pon tu auto a la venta.<br />
                <span className="text-indigo-600 italic uppercase">Y sigue usándolo.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                Cuidamos tu esfuerzo. Disfruta la tranquilidad de comprar o vender tu vehículo de forma segura; nosotros te acompañamos en cada paso para asegurar el mejor trato.
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

              {/* Trust Metrics */}
              <div className="pt-12 md:pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16 w-full max-w-4xl animate-in fade-in duration-1000 delay-500">
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
              {/* THE VERSUS SECTION */}
              <div className="w-full max-w-5xl pt-16 md:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                <style>{
                  Array.from({ length: 10 }).map((_, i) => `
                    @keyframes autoLight${i} {
                      0%, ${i * 8}% { transform: translateX(0); opacity: 0.5; color: #a5b4fc; } /* indigo-300 */
                      ${i * 8 + 4}%, 96% { transform: translateX(4px); opacity: 1; color: #ffffff; }
                      100% { transform: translateX(0); opacity: 0.5; color: #a5b4fc; }
                    }
                    @keyframes autoCheck${i} {
                      0%, ${i * 8}% { transform: scale(1); color: rgba(52, 211, 153, 0.3); }
                      ${i * 8 + 4}%, 96% { transform: scale(1.3); color: rgba(52, 211, 153, 1); filter: drop-shadow(0 0 4px rgba(52,211,153,0.5)); }
                      100% { transform: scale(1); color: rgba(52, 211, 153, 0.3); filter: none; }
                    }
                    @keyframes autoCrossOpacity${i} {
                      0%, ${i * 8}% { opacity: 0.15; }
                      ${i * 8 + 4}%, ${i * 8 + 6}% { opacity: 1; }
                      ${i * 8 + 10}%, 96% { opacity: 0.15; }
                      100% { opacity: 0.15; }
                    }
                    @keyframes autoCrossStrike${i} {
                      0%, ${i * 8}% { text-decoration: none; color: #a1a1aa; } /* zinc-400 */
                      ${i * 8 + 4}%, ${i * 8 + 6}% { text-decoration: line-through; text-decoration-color: rgba(239, 68, 68, 1); color: #52525b; } /* zinc-600 */
                      ${i * 8 + 10}%, 96% { text-decoration: line-through; text-decoration-color: rgba(239, 68, 68, 0.5); color: #a1a1aa; }
                      100% { text-decoration: none; color: #a1a1aa; }
                    }
                  `).join('\n')
                }</style>
                <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:gap-12 relative items-stretch">
                  {/* The Bad Guys */}
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                    <h3 className="text-sm sm:text-xl md:text-2xl font-black text-zinc-400 dark:text-zinc-600 tracking-tight mb-4 sm:mb-6 flex items-center gap-2">
                      El Modelo Tradicional
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {[
                        "Compran para revender",
                        "Auto inmovilizado",
                        "Operaciones inseguras",
                        "Revisión superficial",
                        "Precio por apreciación",
                        "Cheques sin fondos",
                        "Intermediarios dudosos",
                        "Inventario limitado",
                        "Búsqueda a ciegas",
                        "Costos ocultos sorpresa"
                      ].map((text, i) => (
                        <li 
                          key={i} 
                          className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-default"
                          style={{ animation: `autoCrossOpacity${i} 12s infinite` }}
                        >
                          <span className="font-bold text-[10px] sm:text-sm shrink-0 mt-0.5 sm:mt-0 text-red-500">
                            ✖
                          </span>
                          <span 
                            className="font-medium text-[9px] sm:text-[11px] md:text-sm leading-tight sm:leading-normal"
                            style={{ animation: `autoCrossStrike${i} 12s infinite` }}
                          >
                            {text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* The Good Guys */}
                  <div className="bg-indigo-600 dark:bg-indigo-900/40 border border-indigo-500/30 rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 relative overflow-hidden shadow-2xl shadow-indigo-500/20 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <h3 className="text-sm sm:text-xl md:text-2xl font-black text-white tracking-tight mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      La Revolución StarterKar
                    </h3>
                    <ul className="space-y-3 sm:space-y-4 relative z-10">
                      {[
                        { title: "Encontramos mejor oferta" },
                        { title: "Conserva tus llaves" },
                        { title: "Cero riesgo fraude" },
                        { title: "Inspección 150 puntos" },
                        { title: "Precio real" },
                        { title: "Pagos validados Banxico", sub: "(SPEI, QR)" },
                        { title: "Asesores 100% neutrales" },
                        { title: "Autos bajo pedido" },
                        { title: "Asistente IA predictivo" },
                        { title: "Costos transparentes" }
                      ].map((item, i) => (
                        <li key={i} className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-default">
                          <div className="relative flex items-center justify-center h-3 w-3 sm:h-5 sm:w-5 shrink-0 mt-0.5 sm:mt-0">
                            <CheckCircle2 
                              className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" 
                              style={{ animation: `autoCheck${i} 12s infinite` }}
                            />
                          </div>
                          <span 
                            className="font-bold text-[9px] sm:text-[11px] md:text-sm tracking-wide leading-tight sm:leading-normal inline-block"
                            style={{ animation: `autoLight${i} 12s infinite` }}
                          >
                            {item.title} {item.sub && <span className="opacity-70 font-medium ml-1 hidden sm:inline">{item.sub}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
