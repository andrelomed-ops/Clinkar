import { Shield, Scale, AlertTriangle, CheckCircle2, QrCode, Building2 } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                <header className="border-b pb-8">
                    <h1 className="text-4xl font-black tracking-tight mb-4">Términos y Condiciones de Uso</h1>
                    <p className="text-muted-foreground text-lg">Última actualización: 29 de Enero de 2026</p>
                </header>

                <section className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Scale className="h-6 w-6 text-primary" />
                            1. Naturaleza del Servicio y Mediación
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            StarterKar S.A. de C.V. (&quot;StarterKar&quot;) opera como una <strong>Plataforma de Certificación y Mediación Operativa</strong>. StarterKar no actúa como depositario de los fondos del precio de compraventa (salvo en operaciones específicas de subasta institucional). El servicio consiste en la validación mecánica, legal y la orquestación presencial del cierre para garantizar la seguridad de ambas partes. StarterKar cobra una <strong>Tarifa de Gestión y Certificación</strong> que es independiente del precio del activo acordado entre particulares.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            2. Modelo de Pago Directo Protegido (P2P)
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            A diferencia de modelos de custodia digital, StarterKar facilita que el <strong>Pago se realice directamente del Comprador al Vendedor</strong> (vía SPEI, depósito bancario o efectivo escoltado) exclusivamente en el momento de la entrega física. 
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>Presencia de Marca:</strong> Personal de StarterKar estará presente para validar la realización de la transferencia y autenticar el movimiento de fondos antes de la entrega de llaves.</li>
                            <li><strong>Escolta Bancaria:</strong> En caso de operaciones que requieran manejo de efectivo, StarterKar proporcionará acompañamiento a sucursal bancaria para garantizar un entorno seguro, sin captar los recursos en sus propias cuentas.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            3. Entrega en Taller Aliado Obligatoria
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Para mitigar riesgos de seguridad y garantizar la integridad mecánica, <strong>toda entrega de vehículo entre particulares debe realizarse en un Taller Aliado StarterKar</strong> designado. 
                        </p>
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 italic text-sm text-primary-900 leading-relaxed">
                            &quot;En caso de discrepancias físicas no detectadas previamente, el personal de StarterKar actuará como mediador para negociar ajustes de precio o reparaciones inmediatas en sitio antes de proceder al cierre de la transacción.&quot;
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-primary" />
                            4. Seguro de Traslado Obligatorio
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            StarterKar prohíbe terminantemente el movimiento de cualquier activo que no cuente con una <strong>Póliza de Seguro vigente con cobertura de daños a terceros y robo</strong>. 
                        </p>
                        <ul className="bg-secondary/30 p-6 rounded-2xl space-y-3 text-sm font-medium">
                            <li className="flex gap-2 text-red-700">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                Ningún vehículo será trasladado por personal de StarterKar o logística aliada sin la certificación de seguro activo.
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                StarterKar ofrece la contratación inmediata de seguros de trayecto en caso de que la unidad carezca de protección propia.
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Scale className="h-6 w-6 text-primary" />
                            5. Jurisdicción y Resolución de Conflictos
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Para cualquier controversia, las partes se someten a la legislación federal de México y a la jurisdicción de los tribunales competentes en la Ciudad de México. Las partes reconocen la facultad de StarterKar de suspender el servicio si se detectan comportamientos que vulneren la seguridad física o financiera de los involucrados.
                        </p>
                    </div>
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2026 StarterKar S.A. de C.V. Todos los derechos reservados. El uso de la plataforma implica la aceptación de estos términos.
                    </p>
                </footer>
            </main>
        </div>
    );
}
