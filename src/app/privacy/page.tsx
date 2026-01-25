import { Shield, Lock, Eye, FileText } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
                    <h1 className="text-4xl font-black tracking-tight mb-4">Aviso de Privacidad</h1>
                    <p className="text-muted-foreground text-lg">Última actualización: 23 de Enero de 2026</p>
                </header>

                <section className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">1. Protección de Datos Financieros</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                En Clinkar, la seguridad de tu información financiera es nuestra prioridad. No almacenamos tus datos bancarios ni de tarjetas de crédito directamente en nuestros servidores. Todas las transacciones son procesadas y encriptadas a través de nuestro socio de pagos <strong>Stripe Connect</strong>, cumpliendo con los estándares PCI-DSS de nivel bancario.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Eye className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">2. Información que Recopilamos</h2>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                                <li><strong>Datos de Identificación:</strong> Nombre completo, identificación oficial (INE/Pasaporte) para cumplimiento de normativas KYC (Conoce a tu Cliente).</li>
                                <li><strong>Datos del Vehículo:</strong> Número de Identificación Vehicular (VIN), historial de servicios y evidencia fotográfica para los reportes de inspección.</li>
                                <li><strong>Datos de Ubicación:</strong> Utilizados únicamente para coordinar las inspecciones mecánicas y la entrega segura del vehículo.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">3. Uso de la Información</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Tu información se utiliza exclusivamente para:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                                <li>Verificar la propiedad legal del vehículo.</li>
                                <li>Generar los contratos digitales de compra-venta.</li>
                                <li>Ejecutar la liberación de fondos de la Bóveda Digital mediante códigos QR seguros.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Para ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), por favor contáctanos en <a href="mailto:privacidad@clinkar.com" className="text-primary hover:underline">privacidad@clinkar.com</a>.
                    </p>
                </footer>
            </main>
        </div>
    );
}
