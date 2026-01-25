import { Shield, Car, CheckCircle2, Smartphone, ArrowRight, Lock, Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Clinkar</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Cómo funciona</Link>
            <Link href="#roles" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Servicios</Link>
            <Link href="/login" className="text-sm font-bold text-foreground transition-colors hover:text-primary">Iniciar sesión</Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                El estandar de seguridad automotriz
              </div>

              {/* BRAND FIRST HERO */}
              <h1 className="text-6xl font-black tracking-tighter text-foreground md:text-8xl mb-6">
                Haz <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 italic">"Clink Clink"</span> <br />
                con Clinkar.
              </h1>

              <p className="mt-10 text-xl md:text-2xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Tu dinero no se mueve hasta que tienes las llaves y el contrato.
                <br className="hidden md:block" />
                <span className="text-sm md:text-base text-slate-500 font-normal mt-2 block">
                  La única plataforma que blinda tu compra con Bóveda Digital y Sellos de Certificación.
                </span>
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register" className="inline-flex h-14 items-center justify-center rounded-full bg-slate-900 px-8 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-slate-800 shadow-xl shadow-primary/20">
                  <Car className="mr-2 h-5 w-5" />
                  Quiero Vender
                </Link>
                <Link href="/market" className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-200 bg-white px-8 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-300">
                  Quiero Comprar
                </Link>
              </div>
            </div>
          </div>

          {/* Abstract Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-[100px]" />
        </section>

        {/* Value Props / How it works simplified */}
        <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black tracking-tight md:text-5xl mb-4">Así de simple. Así de seguro.</h2>
              <p className="text-lg text-slate-600">El ecosistema Clinkar en 3 pasos.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">1. Tu Dinero Protegido</h3>
                <p className="text-slate-500 leading-relaxed">
                  Transfieres el monto a una <strong>Cuenta Segura</strong>. El vendedor ve que el dinero está ahí, pero <strong>NO</strong> puede tocarlo todavía.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group relative">
                {/* Connector Line for Desktop */}
                <div className="hidden md:block absolute top-1/2 -left-6 w-12 h-0.5 bg-slate-200 -z-10" />

                <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">2. Triple Validación</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Clinkar certifica antes de entregar:
                  <br />
                  <span className="text-blue-600 font-bold block mt-1">✓ Mecánica (Sin fallas)</span>
                  <span className="text-purple-600 font-bold block">✓ Legal (Sin adeudos)</span>
                  <span className="text-slate-900 font-bold block">✓ Contrato (Firma Digital)</span>
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Connector Line for Desktop */}
                <div className="hidden md:block absolute top-1/2 -left-6 w-12 h-0.5 bg-slate-200 -z-10" />

                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md group-hover:rotate-12 transition-transform duration-300">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">3. ¡Haz Clink Clink!</h3>
                <p className="text-slate-300 leading-relaxed">
                  Si todo está en orden, autorizas la liberación con un clic. El vendedor cobra al instante y tú te llevas las llaves.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles / Features */}
        <section id="roles" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-black text-slate-900">
                  Tu copiloto transaccional.<br />
                  <span className="text-primary">Olvídate de la burocracia.</span>
                </h2>
                <p className="text-lg text-slate-600">
                  Clinkar es la única app que integra la parte legal, financiera y mecánica en un solo flujo.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900">100% Sin Sorpresas</h4>
                      <p className="text-slate-500">Si el auto tiene multas o fallas, te lo decimos ANTES de que pagues. Tú decides si negocias o cancelas.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900">Contrato Digital Blindado</h4>
                      <p className="text-slate-500">Generamos un contrato con validez legal firmado digitalmente por ambas partes. Cero papeleo.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side visual - Abstract Dashboard Representation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[3rem] blur-2xl opacity-20 transform rotate-3" />
                <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                  {/* Fake Dashboard UI Snippet */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="text-xs font-bold text-slate-300">CLINKAR SAFE MONITOR</div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-slate-900 text-sm">Certificado Mecánico</span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-slate-900 text-sm">Certificado Legal</span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    {/* NEW: Contract Line */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-slate-900 text-sm">Contrato Digital</span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="w-full h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold gap-2">
                      <Lock className="h-4 w-4" /> Liberar Fondos - "Clink Clink"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-white">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-slate-900">Clinkar</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; 2026 Clinkar. La plataforma más segura de LATAM.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm font-bold text-slate-600 hover:text-primary">Privacidad</Link>
            <Link href="/terms" className="text-sm font-bold text-slate-600 hover:text-primary">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
