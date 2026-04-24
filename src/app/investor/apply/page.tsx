"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { ShieldCheck, ArrowRight, CreditCard, FileText, Smartphone, CheckCircle2, Loader2, Upload } from "lucide-react";
import { StarterKarLogo } from "@/components/ui/StarterKarLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 2500,
    limit: "Hasta 3 autos",
    description: "Ideal para inversionistas individuales comenzando su garage digital.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100"
  },
  {
    id: "pro",
    name: "Pro",
    price: 8000,
    limit: "Hasta 12 autos",
    description: "Para perfiles que buscan una rotación constante de inventario certificado.",
    color: "bg-amber-50 text-amber-700 border-amber-100"
  },
  {
    id: "elite",
    name: "Elite",
    price: 15000,
    limit: "Sin límite de compra",
    description: "Acceso total a la bóveda StarterKar con beneficios de volumen exclusivos.",
    color: "bg-zinc-900 text-white border-zinc-800"
  }
];

export default function InvestorApplyPage() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [rfc, setRfc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [telefono, setTelefono] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"spei" | "conekta">("spei");
  
  const supabase = createBrowserClient();
  const router = useRouter();

  const handleApply = async () => {
    if (!selectedTier || !rfc || !razonSocial || !telefono || !file) {
      toast.error("Por favor completa todos los campos y sube tu Constancia Fiscal.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Upload File
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('investor-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Create Application
      const { error: appError } = await supabase
        .from('investor_applications')
        .insert({
          user_id: user.id,
          tier_id: selectedTier,
          rfc,
          razon_social: razonSocial,
          telefono,
          constancia_fiscal_url: fileName,
          payment_method: paymentMethod,
          status: 'pending'
        });

      if (appError) throw appError;

      toast.success("Solicitud enviada correctamente.");
      setStep(4); // Success step
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-12">
        <StarterKarLogo size="md" href="/" />
      </div>

      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 max-w-xs mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "h-3 w-3 rounded-full transition-all duration-500",
                step >= s ? "bg-indigo-600 scale-125 shadow-lg shadow-indigo-500/50" : "bg-zinc-200"
              )} />
              {s < 3 && <div className={cn("h-0.5 w-16 mx-2 rounded-full", step > s ? "bg-indigo-600" : "bg-zinc-100")} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic">SELECCIONA TU NIVEL</h1>
              <p className="text-muted-foreground font-medium">Elige el plan que mejor se adapte a tu volumen de inversión.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={cn(
                    "relative overflow-hidden rounded-[2.5rem] p-8 border-2 transition-all text-left flex flex-col h-full active:scale-[0.98]",
                    selectedTier === tier.id 
                      ? "border-indigo-600 shadow-2xl shadow-indigo-500/10 scale-[1.02]" 
                      : "border-border hover:border-indigo-200"
                  )}
                >
                  <div className={cn("inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4", tier.color)}>
                    {tier.name}
                  </div>
                  <div className="mb-6">
                    <p className="text-4xl font-black tracking-tighter italic">${tier.price.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">IVA INCLUIDO</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-black italic">{tier.limit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {tier.description}
                    </p>
                  </div>
                  {selectedTier === tier.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <Button 
                disabled={!selectedTier} 
                onClick={() => setStep(2)}
                className="h-14 px-12 rounded-2xl bg-zinc-950 text-white font-black hover:bg-zinc-800 transition-all shadow-xl"
              >
                Continuar a Datos Fiscales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Información Fiscal</h1>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                Nuestros proveedores de autos requieren tu Constancia de Situación Fiscal (CSF) para validar tu perfil de inversionista.
              </p>
            </div>

            <div className="glass-card p-8 md:p-10 rounded-[3rem] space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">RFC / Tax ID</label>
                  <Input 
                    placeholder="ABCD900101XYZ" 
                    value={rfc} 
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl font-bold border-zinc-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Teléfono Directo</label>
                  <Input 
                    placeholder="55 2212 0249" 
                    value={telefono} 
                    onChange={(e) => setTelefono(e.target.value)}
                    className="h-12 rounded-xl font-bold border-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Razón Social / Nombre Fiscal</label>
                <Input 
                  placeholder="Juan Pérez S.A. de C.V." 
                  value={razonSocial} 
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="h-12 rounded-xl font-bold border-zinc-200"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Constancia de Situación Fiscal (PDF/JPG)</label>
                <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all hover:bg-zinc-50",
                    file ? "border-emerald-500 bg-emerald-50/20" : "border-zinc-200"
                  )}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-10 w-10 text-emerald-600" />
                      <p className="text-sm font-bold text-emerald-700">{file.name}</p>
                      <p className="text-[10px] text-emerald-600/60 uppercase">Click para cambiar archivo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-10 w-10 text-zinc-300" />
                      <p className="text-sm font-bold text-zinc-500">Subir Constancia Fiscal</p>
                      <p className="text-[10px] text-zinc-400 uppercase">PDF o Imagen (Máx 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} className="font-bold">Atrás</Button>
              <Button 
                disabled={!rfc || !razonSocial || !telefono || !file} 
                onClick={() => setStep(3)}
                className="h-14 px-12 rounded-2xl bg-zinc-950 text-white font-black hover:bg-zinc-800 transition-all shadow-xl"
              >
                Continuar al Pago
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Método de Pago</h1>
              <p className="text-muted-foreground font-medium text-sm">Selecciona cómo deseas realizar tu pago de membresía.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("spei")}
                className={cn(
                  "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                  paymentMethod === "spei" ? "border-indigo-600 bg-indigo-50/30" : "border-zinc-100 hover:border-zinc-200"
                )}
              >
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest italic">SPEI / Transferencia</span>
              </button>
              <button
                onClick={() => setPaymentMethod("conekta")}
                className={cn(
                  "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                  paymentMethod === "conekta" ? "border-indigo-600 bg-indigo-50/30" : "border-zinc-100 hover:border-zinc-200"
                )}
              >
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest italic">Conekta (Tarjeta/Efectivo)</span>
              </button>
            </div>

            <div className="glass-card p-10 rounded-[3rem] space-y-8">
              {paymentMethod === "spei" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-dashed border-zinc-200">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Datos para Transferencia Directa</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground font-bold uppercase">Banco</span>
                      <span className="text-sm font-black">STP / StarterKar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground font-bold uppercase">CLABE</span>
                      <span className="text-sm font-black tracking-widest">0123 4567 8901 2345 67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground font-bold uppercase">Monto</span>
                      <span className="text-lg font-black text-indigo-600">
                        ${TIERS.find(t => t.id === selectedTier)?.price.toLocaleString()} MXN
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-zinc-400 font-medium leading-relaxed italic">
                    Una vez realizado el SPEI, nuestro equipo validará tu Constancia Fiscal y el depósito en un plazo máximo de 24 horas hábiles.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-6 py-10">
                  <Loader2 className="h-12 w-12 text-zinc-200 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-zinc-500 uppercase italic tracking-widest">Conectando con pasarela Conekta...</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={() => setStep(2)} className="font-bold">Atrás</Button>
              <Button 
                onClick={handleApply}
                disabled={loading}
                className="h-14 px-12 rounded-2xl bg-zinc-950 text-white font-black hover:bg-zinc-800 transition-all shadow-xl min-w-[240px]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Solicitud"}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-xl mx-auto text-center space-y-10 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter italic">¡SOLICITUD RECIBIDA!</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Estamos procesando tu información fiscal y el pago de membresía. Te notificaremos vía correo electrónico en cuanto tu acceso de inversionista esté activo.
              </p>
            </div>
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-zinc-950 text-white font-black shadow-xl active:scale-95 transition-all">
              <Link href="/dashboard">Regresar al Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
