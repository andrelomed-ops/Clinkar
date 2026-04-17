"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
    return <AuthCallbackContent />;
}

function AuthCallbackContent() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState<string>("");
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    useEffect(() => {
        async function handleCallback() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    setStatus("error");
                    setMessage("No se pudo obtener la sesión");
                    return;
                }

                const user = session.user;
                const email = user.email;
                const fullName = user.user_metadata.full_name || user.user_metadata.name || "";

                const { data: existingProfile } = await supabase
                    .from("profiles")
                    .select("id, role")
                    .eq("id", user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await supabase
                        .from("profiles")
                        .insert({
                            id: user.id,
                            email: email,
                            full_name: fullName,
                            role: "user",
                        });

                    if (profileError) {
                        console.error("Error creating profile:", profileError);
                    }
                }

                const verified = searchParams.get("verified");
                const redirectUrl = verified === "true" 
                    ? "/dashboard?verified=true" 
                    : "/dashboard";

                window.location.href = redirectUrl;
            } catch (err) {
                console.error("Callback error:", err);
                setStatus("error");
                setMessage("Error al procesar la autenticación");
            }
        }

        handleCallback();
    }, [supabase, searchParams]);

    if (status === "error") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-destructive">Error de autenticación</h2>
                    <p className="mt-2 text-muted-foreground">{message || "Por favor intenta de nuevo."}</p>
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