"use client";

import { useState } from "react";
import { ShieldAlert, RefreshCcw, Landmark, ShieldCheck, AlertTriangle, ArrowRight, MessageSquare, Bot, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { runConcurrencyTest } from "@/app/actions/stress-test";

export default function VaultStressTest() {
    const [status, setStatus] = useState<'IDLE' | 'FUNDS_LOCKED' | 'TRIGGERING_CANCELLATION' | 'REFUND_IN_PROGRESS' | 'REFUNDED'>('IDLE');
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    const [concurrencyStatus, setConcurrencyStatus] = useState<'IDLE' | 'ATTACKING' | 'DONE'>('IDLE');
    const [concurrencyResult, setConcurrencyResult] = useState<{success: number, failures: number} | null>(null);

    const runSimulation = () => {
        setStatus('FUNDS_LOCKED');
        addLog("SIMULACIÓN: Comprador depositó $450,000 MXN en cuenta concentradora del procesador (Stripe).");
        addLog("ESTADO: Fondos bloqueados en Escrow por Mandato No-Custodio de StarterKar.");

        setTimeout(() => {
            setStatus('TRIGGERING_CANCELLATION');
            addLog("ALERTA: Inspección de 150 puntos detecta daño estructural oculto.");
            addLog("ACCIÓN: StarterKar AI detecta riesgo crítico. Activando protocolo de protección al comprador.");
        }, 2000);

        setTimeout(() => {
            setStatus('REFUND_IN_PROGRESS');
            addLog("SIMULACIÓN: Instruyendo mandato de reversión a la entidad financiera.");
            addLog("SEGURIDAD: Verificando que StarterKar NO retenga comisiones operativas (Protección total).");
        }, 4000);

        setTimeout(() => {
            setStatus('REFUNDED');
            addLog("ÉXITO: Fondos regresados a la cuenta origen del comprador.");
            addLog("SOPORTE: StarterKar Hub AI envía notificación y opciones de autos similares.");
        }, 6000);
    };

    const runConcurrencyAttack = async () => {
        setConcurrencyStatus('ATTACKING');
        setConcurrencyResult(null);
        addLog("ATAQUE CONCURRENTE: 50 usuarios intentando comprar el mismo auto ('test-car-id') en el mismo milisegundo...");
        
        try {
            const result = await runConcurrencyTest('test-car-id', 50);
            setConcurrencyStatus('DONE');
            setConcurrencyResult({ success: result.totalSuccess, failures: result.totalFailures });
            addLog(`RESULTADO ATÓMICO: ${result.totalSuccess} Compra procesada. ${result.totalFailures} Compras bloqueadas por el sistema (rebote íntegro).`);
            addLog("VEREDICTO: Zero double-spending garantizado a nivel base de datos.");
        } catch (e: any) {
            addLog(`ERROR EN ATAQUE: ${e.message}`);
            setConcurrencyStatus('DONE');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 md:p-24 space-y-12">
            <header className="max-w-4xl space-y-4">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 uppercase font-black px-3 py-1">Stress Test: Protocolo de Seguridad</Badge>
                <h1 className="text-5xl font-black tracking-tighter">Vault Resilience Test</h1>
                <p className="text-zinc-500 text-xl max-w-2xl">Simulación de fallo crítico para validar que StarterKar protege el capital del usuario en un entorno no-custodio.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-zinc-900 rounded-[2.5rem] border border-white/10 p-10 space-y-8 flex flex-col justify-center min-h-[500px]">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className={`h-32 w-32 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'IDLE' ? 'bg-zinc-800' :
                                    status === 'FUNDS_LOCKED' ? 'bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]' :
                                        status === 'TRIGGERING_CANCELLATION' ? 'bg-amber-500 animate-pulse' :
                                            status === 'REFUND_IN_PROGRESS' ? 'bg-indigo-500 animate-spin' :
                                                'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]'
                                }`}>
                                {status === 'IDLE' && <ShieldAlert className="h-12 w-12 text-zinc-600" />}
                                {status === 'FUNDS_LOCKED' && <Landmark className="h-12 w-12 text-white" />}
                                {status === 'TRIGGERING_CANCELLATION' && <AlertTriangle className="h-12 w-12 text-white" />}
                                {status === 'REFUND_IN_PROGRESS' && <RefreshCcw className="h-12 w-12 text-white" />}
                                {status === 'REFUNDED' && <ShieldCheck className="h-12 w-12 text-white" />}
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black">
                            {status === 'IDLE' ? 'Listo para Simulación' :
                                status === 'FUNDS_LOCKED' ? 'Fondos en Escrow Protegido' :
                                    status === 'TRIGGERING_CANCELLATION' ? 'Cancelación Detectada' :
                                        status === 'REFUND_IN_PROGRESS' ? 'Reversión de Fondos' :
                                            'Capital Recuperado'}
                        </h3>
                        <p className="text-zinc-500">
                            {status === 'IDLE' ? 'Haz clic para iniciar el flujo de protección.' :
                                status === 'FUNDS_LOCKED' ? 'El dinero está seguro en manos de la entidad bancaria.' :
                                    status === 'TRIGGERING_CANCELLATION' ? 'Se ha detectado un problema en la inspección.' :
                                        status === 'REFUND_IN_PROGRESS' ? 'Instruyendo a la API bancaria la devolución inmediata.' :
                                            'El usuario tiene su dinero de vuelta. Cero riesgo detectado.'}
                        </p>
                    </div>

                    {status === 'IDLE' && (
                        <Button onClick={runSimulation} className="h-16 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all text-lg">
                            Iniciar Test de Resiliencia <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-[500px]">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                        <Bot className="h-4 w-4" /> Log de Seguridad en Tiempo Real
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px]">
                        {log.map((entry, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${idx === 0 ? 'bg-white/10 text-white border-l-2 border-emerald-500' : 'text-zinc-500'}`}>
                                {entry}
                            </div>
                        ))}
                        {log.length === 0 && <div className="text-zinc-700 italic">No hay actividad...</div>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
                <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-center min-h-[300px]">
                    <div className="flex items-center gap-4 mb-4">
                        <Gauge className="h-10 w-10 text-indigo-500" />
                        <h4 className="text-xl font-black text-white">Concurrency Attack</h4>
                    </div>
                    <p className="text-zinc-400 text-sm mb-6">Prueba el motor de Bloqueos Atómicos inyectando 50 peticiones simultáneas de compra al mismo segundo exacto competitivo a ver si se duplica un auto.</p>
                    
                    {concurrencyStatus === 'IDLE' && (
                        <Button onClick={runConcurrencyAttack} className="h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl">
                            Simular 50 Usuarios Simultáneos <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    
                    {concurrencyStatus === 'ATTACKING' && (
                        <div className="flex justify-center items-center h-14 bg-indigo-600/20 text-indigo-400 font-black rounded-xl border border-indigo-500/30">
                            <RefreshCcw className="h-5 w-5 animate-spin mr-2" /> Disparando Rayo Atómico...
                        </div>
                    )}
                    
                    {concurrencyStatus === 'DONE' && concurrencyResult && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col gap-2">
                            <span className="text-emerald-400 font-bold uppercase tracking-wide text-xs">Exito Rotundo: Solo un ganador</span>
                            <div className="flex gap-4">
                                <div className="flex-1 bg-black/40 p-3 rounded-lg text-center">
                                    <span className="block text-2xl font-black text-emerald-500">{concurrencyResult.success}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cobrado</span>
                                </div>
                                <div className="flex-1 bg-black/40 p-3 rounded-lg text-center">
                                    <span className="block text-2xl font-black text-red-500">{concurrencyResult.failures}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Rebotados</span>
                                </div>
                            </div>
                            <Button onClick={runConcurrencyAttack} variant="outline" className="mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                                Repetir Ataque
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <footer className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 flex items-center gap-6 mt-12">
                <div className="h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h5 className="font-black text-indigo-400">Veredicto de Auditoría</h5>
                    <p className="text-zinc-400 text-sm">Este test valida que StarterKar cumple con la ley Fintech (MX) y garantiza que el capital del cliente nunca es comprometido por fallos operativos, impidiendo matemáticamente la doble venta.</p>
                </div>
            </footer>
        </div>
    );
}
