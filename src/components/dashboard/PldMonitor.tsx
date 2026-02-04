"use client";

import { useState } from "react";
import { ShieldCheck, AlertOctagon, Loader2, Search, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { PldService, PldScreeningResult } from "@/services/PldService";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";

export function PldMonitor() {
    const [nameQuery, setNameQuery] = useState("");
    const [result, setResult] = useState<PldScreeningResult | null>(null);
    const [loading, setLoading] = useState(false);

    const supabase = createBrowserClient();

    const handleCheck = async () => {
        if (!nameQuery) return;
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            // Use current user ID or a system ID for the audit log
            const userId = user?.id || 'admin-monitor-000';

            const data = await PldService.screenPerson(supabase, userId, nameQuery);
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Screening PLD (Listas Negras)
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Validación Anti-Lavado de Dinero (OFAC, UIF, 69-B)</p>
                </div>
                {result && (
                    <div className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border",
                        result.riskLevel === 'CLEAN' ? "bg-green-100 text-green-700 border-green-200" :
                            result.riskLevel === 'WARNING' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                "bg-red-100 text-red-700 border-red-200"
                    )}>
                        {result.riskLevel === 'CLEAN' && <CheckCircle2 className="h-4 w-4" />}
                        {result.riskLevel === 'WARNING' && <AlertTriangle className="h-4 w-4" />}
                        {result.riskLevel === 'BLOCKED' && <AlertOctagon className="h-4 w-4" />}
                        {result.riskLevel === 'CLEAN' ? 'Limpio / Aprobado' : result.riskLevel === 'WARNING' ? 'Revisión Manual' : 'BLOQUEADO'}
                    </div>
                )}
            </div>

            <div className="bg-muted/30 p-6 rounded-3xl border border-border flex gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Nombre Completo a Validar</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ej. Pablo Escobar, Empresa Fantasma..."
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
                            className="h-11 rounded-xl bg-background font-medium text-zinc-900 dark:text-zinc-100 border-zinc-200"
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                        />
                        <Button
                            onClick={handleCheck}
                            disabled={loading || !nameQuery}
                            className="h-11 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                            Consultar
                        </Button>
                    </div>
                </div>
            </div>

            {result && (
                <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
                    {/* Matches Detail */}
                    {result.matches.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-foreground">Coincidencias Encontradas:</h4>
                            {result.matches.map((match, idx) => (
                                <div key={idx} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-4">
                                    <AlertOctagon className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xs bg-red-600 text-white px-2 py-0.5 rounded uppercase">{match.list}</span>
                                            <span className="font-bold text-sm text-red-900 dark:text-red-200">{match.reason}</span>
                                        </div>
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">{match.details}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono mt-4">
                                <p>SCREENING_ID: {result.screeningId}</p>
                                <p>TIMESTAMP: {result.checkedAt}</p>
                                <p className="text-red-400 font-bold mt-2">ACCIÓN RECOMENDADA: DETENER OPERACIÓN INMEDIATAMENTE.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-6 rounded-2xl flex items-center justify-center flex-col text-center gap-3">
                            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-200">Sin Coincidencias en Listas Negras</h4>
                                <p className="text-xs text-green-700 dark:text-green-300 max-w-sm mx-auto mt-1">
                                    El sujeto no aparece en listas OFAC, SAT 69-B ni Personas Bloqueadas de la UIF al momento de la consulta.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2 text-green-700 border-green-200 hover:bg-green-100">
                                <FileText className="h-3 w-3 mr-2" /> Descargar Certificado Compliance
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
