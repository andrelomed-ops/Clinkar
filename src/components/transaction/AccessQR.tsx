
"use client";

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessQRProps {
    transactionId: string;
    className?: string;
}

export default function AccessQR({ transactionId, className }: AccessQRProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await fetch(`/api/transaction/${transactionId}/qr`);
                const data = await res.json();

                if (data.url) {
                    setUrl(data.url);
                } else {
                    setError(data.error || 'No se pudo generar el código');
                }
            } catch (err) {
                setError('Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        if (revealed && !url) {
            fetchQR();
        }
    }, [transactionId, revealed, url]);

    if (!revealed) {
        return (
            <div className={cn("p-6 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-center space-y-4", className)}>
                <ShieldCheck className="h-12 w-12 text-slate-400" />
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-700">Código de Entrega Seguro</h3>
                    <p className="text-xs text-slate-500 max-w-[200px]">
                        Muestra este código al vendedor SOLO cuando hayas recibido el vehículo satisfactoriamente.
                    </p>
                </div>
                <button
                    onClick={() => setRevealed(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                    <Eye className="h-4 w-4" />
                    Revelar Código
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-8 space-y-3 bg-white border-2 border-slate-100 rounded-xl", className)}>
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400">Generando Token Seguro...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("p-4 bg-red-50 text-red-600 rounded-xl text-xs text-center", className)}>
                {error}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center space-y-4 p-6 bg-white border-2 border-indigo-100 rounded-xl shadow-sm", className)}>
            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-inner">
                {url && (
                    <QRCodeSVG
                        value={url}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                )}
            </div>
            <div className="text-center space-y-1">
                <p className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    Token de Liberación
                </p>
                <p className="text-[10px] text-slate-400">
                    Escanear para liberar fondos al vendedor
                </p>

                {/* Dev Helper */}
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-2 text-[10px] text-blue-500 underline decoration-dotted"
                    >
                        [DEV] Simular Escaneo
                    </a>
                )}
            </div>
            <button
                onClick={() => setRevealed(false)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
                <EyeOff className="h-3 w-3" />
                Ocultar
            </button>
        </div>
    );
}
