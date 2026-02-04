"use client";

import { Shield, CheckCircle2, QrCode, Building2, User, Car, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralCertificateProps {
    folio: string;
    customerName: string;
    targetCar: string;
    agency: string;
    onClose: () => void;
}

export function ReferralCertificate({ folio, customerName, targetCar, agency, onClose }: ReferralCertificateProps) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative w-full max-w-2xl bg-white text-zinc-950 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.3)] animate-in zoom-in-95 duration-500">

                {/* Certificate Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl translate-y-32 -translate-x-32" />

                <div className="relative z-10 p-12 space-y-10">
                    <header className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                <Shield className="h-6 w-6 fill-indigo-600/20" />
                                <span className="font-black uppercase tracking-[0.3em] text-xs">Clinkar Alliance</span>
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Certificado VIP<br />de Referido</h1>
                        </div>
                        <div className="text-right">
                            <div className="bg-zinc-900 text-white px-4 py-2 rounded-xl inline-block font-mono font-black text-xl tracking-widest shadow-lg">
                                {folio}
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Folio de Control</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 gap-12 border-y border-zinc-100 py-10">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <User className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Titular</span>
                                </div>
                                <p className="font-black text-lg italic">{customerName}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Car className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Unidad de Interés</span>
                                </div>
                                <p className="font-black text-lg italic">{targetCar}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Building2 className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Agencia Destino</span>
                                </div>
                                <p className="font-black text-lg italic">{agency}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Vigencia</span>
                                </div>
                                <p className="font-black text-lg italic">72 Horas Hábiles</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="h-32 w-32 bg-zinc-50 border-2 border-zinc-100 rounded-3xl flex items-center justify-center p-4">
                            <QrCode className="h-full w-full text-zinc-400" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Estatus: Verificado Clinkar</span>
                            </div>
                            <p className="text-xs font-medium text-zinc-500 leading-relaxed italic">
                                Este certificado garantiza que el titular es beneficiario del programa <strong>Puente de Capital Clinkar</strong>. La agencia recibirá el pago del enganche directamente tras la venta flash de la unidad usada.
                            </p>
                        </div>
                    </div>

                    <footer className="pt-6 border-t border-dashed border-zinc-200 flex justify-between items-start bg-zinc-50/50 -mx-12 -mb-12 p-12 gap-8">
                        <div className="space-y-4 max-w-sm">
                            <p className="text-[8px] text-zinc-400 font-medium leading-relaxed italic uppercase tracking-tighter">
                                * Este folio constituye una intención de compra vinculada al programa "Puente Financiero Clinkar". La validez del incentivo está sujeta a la ratificación de la venta de la unidad seminueva por parte del titular. Clinkar S.A. de C.V. actúa como intermediario certificado y garante del traslado de capital.
                            </p>
                            <div className="flex gap-4 opacity-30 grayscale">
                                <span className="text-[7px] font-black border border-zinc-400 px-1 rounded">PROFECO A-2026</span>
                                <span className="text-[7px] font-black border border-zinc-400 px-1 rounded">AMDA PARTNER</span>
                            </div>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="bg-zinc-950 text-white px-8 h-12 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl shrink-0"
                        >
                            Imprimir Certificado <Sparkles className="h-4 w-4" />
                        </button>
                    </footer>
                </div>

                {/* Decorative Seal */}
                <div className="absolute bottom-24 right-12 opacity-10">
                    <Shield className="h-32 w-32" />
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-10 right-10 text-white/50 hover:text-white font-black text-2xl transition-all"
            >
                ✕ CERRAR
            </button>
        </div>
    );
}
