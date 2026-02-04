import { VerificationService } from '@/services/VerificationService';
import { BadgeCheck, ShieldCheck, Calendar, Car, XCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface Props {
    params: Promise<{ id: string }>;
}

import { PrintButton } from '@/components/verify/PrintButton';

export default async function VerifyPage({ params }: Props) {
    const supabase = await createClient();
    const { id } = await params;
    const audit = await VerificationService.verifyAsset(supabase, id);

    if (!audit) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Comprobante No Válido</h1>
                    <p className="text-slate-600 mb-6">
                        No pudimos verificar este activo. El código podría ser incorrecto o el registro no existe en nuestra base de datos segura.
                    </p>
                    <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-900 hover:underline">
                        Ir al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center print:mt-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4 animate-in zoom-in duration-500 print:bg-emerald-50 print:border-2 print:border-emerald-200">
                        <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">Activo Verificado</h2>
                    <p className="mt-2 text-sm text-slate-600 font-bold uppercase tracking-widest">
                        Certificado de Autenticidad Digital Clinkar
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    {/* Hero Image / Placeholder */}
                    <div className="aspect-video bg-slate-100 relative items-center justify-center flex overflow-hidden">
                        {audit.car.image ? (
                            <img src={audit.car.image} alt="Vehicle" className="w-full h-full object-cover" />
                        ) : (
                            <Car className="text-slate-300 w-16 h-16" />
                        )}

                        {/* Dynamic verification timestamp */}
                        <div className="absolute top-4 right-4 translate-x-0">
                            <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" />
                                Validado Ahora
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Vehicle Info */}
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{audit.car.make} {audit.car.model}</h3>
                            <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium">
                                <span>{audit.car.year}</span>
                                <span>•</span>
                                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">VIN: {audit.car.vin_masked}</span>
                            </div>
                        </div>

                        {/* Verification Points */}
                        <div className="space-y-3">
                            <VerificationItem
                                icon={<BadgeCheck className="w-5 h-5 text-emerald-500" />}
                                label="Identidad del Vehículo"
                                status="Confirmada"
                                sub="Coincidencia exacta con registros oficiales"
                            />
                            <VerificationItem
                                icon={<Car className="w-5 h-5 text-emerald-500" />}
                                label="Inspección 150 Puntos"
                                status={audit.inspection ? "Aprobada" : "No Disponible"}
                                sub={audit.inspection ? `Revisado el ${new Date(audit.inspection.date).toLocaleDateString()}` : "Este vehículo no cuenta con inspección registrada"}
                                isSuccess={!!audit.inspection}
                            />
                            <VerificationItem
                                icon={<Calendar className="w-5 h-5 text-emerald-500" />}
                                label="Transacción Segura"
                                status={audit.transaction ? "Completada" : "Sin Registro de Venta"}
                                sub={audit.transaction ? `Procesada vía Clinkar Vault` : "No se ha registrado venta en plataforma"}
                                isSuccess={!!audit.transaction}
                            />
                        </div>

                        <div className="pt-6 border-t border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Auditado por Clinkar Engine</p>
                            <p className="text-xs text-slate-500">
                                ID de Auditoría: <span className="font-mono">{id.split('-')[0]}...</span>
                                <br />
                                {new Date(audit.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions (No Print) */}
                <div className="flex flex-col gap-4 no-print">
                    <PrintButton />
                    <Link href="/" className="text-center text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                        ¿Qué es Clinkar?
                    </Link>
                </div>
            </div>
        </div>
    );
}

function VerificationItem({ icon, label, status, sub, isSuccess = true }: { icon: any, label: string, status: string, sub: string, isSuccess?: boolean }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className={`mt-1 ${!isSuccess ? 'grayscale opacity-50' : ''}`}>
                {icon}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{label}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {status}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {sub}
                </p>
            </div>
        </div>
    );
}
