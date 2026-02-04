"use client";

import { ShieldCheck } from "lucide-react";

export type TransactionStep = 'NEGOTIATION' | 'SERVICES_SELECTION' | 'DOCUMENT_UPLOAD' | 'AWAITING_PAYMENT' | 'FUNDS_SECURED' | 'IN_TRANSIT' | 'VALIDATION' | 'DELIVERED';

interface StatusHeaderProps {
    step: TransactionStep;
    trxId: string | null;
}

export const StatusHeader = ({ step, trxId }: StatusHeaderProps) => {
    return (
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <ShieldCheck size={200} />
            </div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[10px] font-black uppercase mb-4 tracking-widest">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    ID: {trxId ? `#${trxId.slice(0, 8)}` : "Nueva Operación"}
                </div>

                <h1 className="text-4xl font-black mb-2 tracking-tighter">
                    {step === 'NEGOTIATION' && "Precio Justo Clinkar"}
                    {step === 'SERVICES_SELECTION' && "Servicios de Confianza"}
                    {step === 'DOCUMENT_UPLOAD' && "Validación de Identidad"}
                    {step === 'AWAITING_PAYMENT' && "Pago en Bóveda Digital"}
                    {step === 'FUNDS_SECURED' && "Fondos Protegidos"}
                    {step === 'IN_TRANSIT' && "Logística de Entrega"}
                    {step === 'VALIDATION' && "Validación de Entrega"}
                    {step === 'DELIVERED' && "¡Propietario Clinkar!"}
                </h1>
                <p className="text-slate-400 max-w-xl text-sm italic">
                    {step === 'NEGOTIATION' && "Analiza los datos técnicos para ofertar un precio basado en la condición real."}
                    {step === 'SERVICES_SELECTION' && "Personaliza tu experiencia con seguros y transporte certificado."}
                    {step === 'DOCUMENT_UPLOAD' && "Sube tu documentación oficial para cumplir con las regulaciones de seguridad."}
                    {step === 'AWAITING_PAYMENT' && "Tus fondos serán retenidos en Escrow (STP) hasta que recibas la unidad."}
                    {step === 'FUNDS_SECURED' && "Tranquilidad total. El dinero está seguro en la nube."}
                    {step === 'IN_TRANSIT' && "Tu próximo activo viaja con seguro total hacia tu ubicación."}
                    {step === 'VALIDATION' && "Inspecciona la unidad físicamente. Solo si estás satisfecho, escanea el QR."}
                    {step === 'DELIVERED' && "Felicidades. La transferencia se ha liberado al vendedor."}
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 mt-10">
                {['Negociación', 'Servicios', 'Legales', 'Pago', 'Entrega'].map((label, i) => {
                    const states: TransactionStep[][] = [
                        ['NEGOTIATION'],
                        ['SERVICES_SELECTION'],
                        ['DOCUMENT_UPLOAD'],
                        ['AWAITING_PAYMENT', 'FUNDS_SECURED', 'IN_TRANSIT'],
                        ['VALIDATION', 'DELIVERED']
                    ];
                    const isActive = states.slice(0, i + 1).some(group => group.includes(step));
                    return (
                        <div key={label} className="flex-1">
                            <div className={`h-1.5 rounded-full transition-all duration-700 ${isActive ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
                            <span className={`text-[9px] uppercase font-black tracking-widest mt-2 block ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
