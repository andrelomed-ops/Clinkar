import { VerificationWizard } from "@/components/verification/VerificationWizard";

export default function VerificationPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 md:px-8">
            <header className="max-w-3xl mx-auto mb-8 text-center md:text-left">
                <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Centro de Confianza</h1>
                {/* <p className="text-zinc-400 text-sm">Paso 1 de 1</p> */}
            </header>

            <VerificationWizard />

            <footer className="mt-12 text-center text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Clinkar cumple con todas las disposiciones de la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI). Tu privacidad es nuestra prioridad #1.
            </footer>
        </div>
    );
}
