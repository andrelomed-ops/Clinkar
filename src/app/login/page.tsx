"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AuthForm initialMode="login" />
        </Suspense>
    );
}
