import Link from "next/link";
import { Shield, AlertTriangle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-secondary animate-pulse-slow">
                <Shield className="h-12 w-12 text-primary opacity-50" />
            </div>
            <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-600">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Error 404
                </div>
                <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Ruta extraviada</h1>
                <p className="mx-auto max-w-lg text-muted-foreground text-lg">
                    Parece que esta página no existe en nuestra Bóveda Digital. Es posible que el enlace esté roto o haya sido eliminado.
                </p>
            </div>
            <div className="mt-10 flex gap-4">
                <Link
                    href="/"
                    className="rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
}
