import { Shield, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 h-16 flex items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <Shield className="h-6 w-6 text-primary" />
                    Clinkar
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                <header>
                    <h1 className="text-4xl font-black tracking-tight mb-4">Términos y Condiciones</h1>
                    <p className="text-muted-foreground text-lg">Última actualización: 23 de Enero de 2026</p>
                </header>

                <section className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Scale className="h-6 w-6 text-primary" />
                            1. Naturaleza del Servicio
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Clinkar actúa exclusivamente como una plataforma de intermediación digital y custodia de fondos ("Escrow"). <strong>No somos propietarios de los vehículos</strong> listados ni garantizamos el estado mecánico más allá del reporte técnico emitido por los inspectores certificados independientes. El contrato de compra-venta final se celebra directamente entre el Vendedor y el Comprador.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                            2. Bóveda Digital y Liberación de Fondos
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Al utilizar el servicio de Bóveda Digital:
                        </p>
                        <ul className="bg-secondary/30 p-6 rounded-2xl space-y-3 text-sm font-medium">
                            <li className="flex gap-2">
                                <span className="text-primary">•</span>
                                El Comprador deposita el monto total en una cuenta custodiada antes de la entrega.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span>
                                El Vendedor acepta no entregar las llaves hasta recibir la confirmación de "Fondos en Bóveda".
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span>
                                La liberación de los fondos al Vendedor es IRREVERSIBLE una vez que el Comprador escanea el Código QR de entrega.
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-primary" />
                            3. Limitación de Responsabilidad
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Clinkar no se hace responsable por vicios ocultos no detectables en una inspección visual estándar. El Comprador tiene el derecho de rechazar la compra durante la inspección física si el vehículo no coincide con la descripción digital. En caso de cancelación antes de la entrega (escaneo de QR), los fondos serán devueltos al Comprador menos los gastos administrativos y de inspección ya incurridos.
                        </p>
                    </div>
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Al usar nuestra plataforma, aceptas estos términos incondicionalmente. Dudas legales: <a href="mailto:legal@clinkar.com" className="text-primary hover:underline">legal@clinkar.com</a>.
                    </p>
                </footer>
            </main>
        </div>
    );
}
