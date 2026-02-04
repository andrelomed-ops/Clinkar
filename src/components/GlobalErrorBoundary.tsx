"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[Crtitical Application Error]", {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full relative">
                        {/* Glow Effect */}
                        <div className="absolute -inset-10 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 text-center shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                            <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-red-500/5">
                                <ShieldAlert className="h-10 w-10 text-red-500" />
                            </div>

                            <h1 className="text-3xl font-black text-white tracking-tight mb-4">Protección Activa</h1>
                            <p className="text-zinc-400 font-medium leading-relaxed mb-10">
                                Hemos interceptado una anomalía para proteger tus datos. No te preocupes, tu sesión está segura.
                            </p>

                            <div className="space-y-4">
                                <Button
                                    onClick={this.handleReset}
                                    className="w-full h-14 rounded-full bg-white text-zinc-900 font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw className="h-5 w-5" /> Reintentar Cargar
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => window.location.href = '/'}
                                    className="w-full h-14 rounded-full font-bold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800"
                                >
                                    <Home className="mr-2 h-5 w-5" /> Volver al Inicio
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-800">
                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                                    Resilience Mode Enabled
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

