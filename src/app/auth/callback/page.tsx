"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
    return (
        <AuthCallbackContent />
    );
}

function AuthCallbackContent() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    useEffect(() => {
        async function handleCallback() {
            const { error } = await supabase.auth.getSession();

            if (error) {
                setStatus("error");
                return;
            }

            const next = searchParams.get("next");
            const verified = searchParams.get("verified");

            if (next) {
                window.location.href = `${next}${verified === "true" ? "?verified=true" : ""}`;
            } else {
                window.location.href = verified === "true" 
                    ? "/dashboard?verified=true" 
                    : "/dashboard";
            }
        }

        handleCallback();
    }, [supabase, searchParams]);

    if (status === "error") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-destructive">Error de autenticación</h2>
                    <p className="mt-2 text-muted-foreground">Por favor intenta de nuevo.</p>
                    <a href="/login" className="mt-4 inline-block text-primary hover:underline">
                        Volver a login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Completando autenticación...</p>
            </div>
        </div>
    );
}