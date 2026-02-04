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
                            1. Naturaleza del Servicio y Orquestación
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Clinkar S.A. de C.V. (&quot;CLINKAR&quot;) opera como un <strong>Intermediario Tecnológico y Facilitador de Pagos</strong> que orquesta la compraventa de activos motorizados. CLINKAR cobra una <strong>Tarifa por Servicio (Success Fee)</strong> por el uso de su infraestructura de seguridad, inspección y dispersión financiera, sin que esto lo constituya como propietario o revendedor del activo. CLINKAR no capta recursos del público, actuando únicamente bajo mandato de pago irrevocable (Split Payment).
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            1.1. Cumplimiento Normativo (PLD/AML)
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            En cumplimiento con la <strong>Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI)</strong>, Clinkar se reserva el derecho de:

                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Realizar verificaciones automáticas de identidad contra listas de personas bloqueadas y PEPs.</li>
                            <li>Solicitar documentación adicional (KYC Reforzado) para transacciones superiores a los umbrales establecidos por la ley.</li>
                            <li>Cancelar unilateralmente cualquier operación que presente indicadores de alto riesgo, notificando a las autoridades competentes.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <QrCode className="h-6 w-6 text-primary" />
                            2. Firma Electrónica y Validez del Código QR
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Conforme a los artículos 89 al 114 del Código de Comercio vigente en México, las partes aceptan que el escaneo del <strong>Código QR de Validación de Entrega</strong> constituye una <strong>Firma Electrónica Simple</strong> con plenos efectos legales.

                        </p>
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 italic text-sm text-primary-900 leading-relaxed">
                            &quot;Al escanear el código QR, el Comprador manifiesta su conformidad absoluta con el estado físico y legal del activo, instruyendo irrevocablemente a la plataforma para la liberación definitiva de los fondos al Vendedor.&quot;
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            3. Bóveda Digital (Escrow) y Aliados Financieros
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Los fondos son custodiados por Instituciones de Tecnología Financiera (ITF) autorizadas por la CNBV. CLINKAR no capta ni administra recursos del público directamente.

                        </p>
                        <ul className="bg-secondary/30 p-6 rounded-2xl space-y-3 text-sm font-medium">
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                La liberación de fondos es instantánea pero está sujeta a los tiempos de procesamiento del Sistema de Pagos Electrónicos Interbancarios (SPEI).
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                CLINKAR no se responsabiliza por demoras técnicas ajenas a su plataforma derivadas de la red bancaria nacional.
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            3.1. Modelo de Dispersión Automática (STP)
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            El usuario acepta que los fondos recibidos en la cuenta CLABE virtual asignada a la transacción serán dispersados de manera automática e irrevocable conforme a las instrucciones de pago preacordadas (Precio al Vendedor, Comisiones y Servicios). Clinkar actúa bajo mandato de pago sin tocar los fondos directamente.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-primary" />
                            4. Limitación de Responsabilidad (Inspección)
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            La inspección técnica es una auditoría del estado actual del activo en el momento de la revisión. Debido a la naturaleza de los activos usados, CLINKAR no garantiza fallas mecánicas futuras fuera de la garantía obligatoria (NOM-122) que recae sobre el Vendedor. CLINKAR responde únicamente por la veracidad del reporte frente a lo observado por el inspector en la fecha de la diligencia.

                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                            4.1. Verificación de Activos (OCRA/REPUVE)
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Clinkar ejecuta validaciones automatizadas ante el Registro Público Vehicular (REPUVE) y la Oficina Coordinadora de Riesgos Asegurados (OCRA). Si bien la plataforma bloquea intentos de venta de vehículos con reporte de robo vigente en estas bases, <strong>no garantiza</strong> la inexistencia de reportes en bases de datos estatales no conectadas o procesos judiciales en curso no reflejados digitalmente.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            5. Jurisdicción y Competencia
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-justify">
                            Para cualquier controversia derivada del uso de la plataforma, las partes se someten a la legislación federal de México y a la jurisdicción de los tribunales competentes en la <strong>Ciudad de México</strong>, renunciando a cualquier otro fuero.
                        </p>
                    </div>
                </section>

                <footer className="pt-12 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2026 Clinkar S.A. de C.V. Todos los derechos reservados. El uso de la plataforma implica la aceptación de estos términos.
                    </p>
                </footer>
            </main>
        </div>
    );
}
