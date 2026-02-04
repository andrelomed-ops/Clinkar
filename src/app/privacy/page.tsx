import { Shield, Lock, Eye, FileText, Share2, ClipboardCheck } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                <header className="border-b pb-8">
                    <h1 className="text-4xl font-black tracking-tight mb-4">Aviso de Privacidad Integral</h1>
                    <p className="text-muted-foreground text-lg italic">Última actualización: 29 de Enero de 2026</p>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Clinkar S.A. de C.V. (en lo sucesivo &quot;CLINKAR&quot;), con domicilio en la Ciudad de México, es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
                    </p>
                </header>

                <section className="grid gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Eye className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">1. Datos Personales Recabados</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Para las finalidades señaladas en el presente aviso, recabaremos:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-secondary/20 p-6 rounded-2xl">
                            <li className="flex items-center gap-2">
                                <CheckCircleIcon /> Datos de Identificación (INE, RFC, CURP)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircleIcon /> Datos de Contacto (Email, Teléfono)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircleIcon /> Datos Financieros (CLABE, Cuentas de Destino)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircleIcon /> Datos Biométricos (Huella de voz, reconocimiento facial y Video-verificación)
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <ClipboardCheck className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">2. Finalidades Primarias</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades que son <strong>necesarias para el servicio que solicita</strong>:
                        </p>
                        <ul className="space-y-3 pl-4 border-l-2 border-primary/20">
                            <li>• Verificar y validar su identidad mediante protocolos KYC (Know Your Customer).</li>
                            <li>• Cumplimiento de normativa de Prevención de Lavado de Dinero (PLD/FT), incluyendo consultas en listas de riesgo.</li>
                            <li>• Procesar la custodia y dispersión de fondos en Escrow (Bóveda Digital).</li>
                            <li>• Generación de contratos electrónicos de compraventa de activos motorizados.</li>
                            <li>• Coordinación de servicios auxiliares (Inspección, Logística, Seguros).</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Share2 className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">3. Transferencias a Terceros</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Le informamos que sus datos personales podrán ser compartidos con las siguientes personas, empresas, organizaciones o autoridades distintas a nosotros, para los siguientes fines:
                        </p>
                        <div className="overflow-hidden border rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Destinatario</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Finalidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="p-4 font-medium">Instituciones Fintech (ITF)</td>
                                        <td className="p-4 text-muted-foreground">Custodia y dispersión de fondos bajo supervisión de CNBV.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Aliados de Inspección</td>
                                        <td className="p-4 text-muted-foreground">Ejecución de auditorías técnicas y legales del activo.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Autoridades Fiscales (SAT/UIF)</td>
                                        <td className="p-4 text-muted-foreground">Cumplimiento de obligaciones de PLD y reportes de actividades vulnerables.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Registros Vehiculares (REPUVE/OCRA)</td>
                                        <td className="p-4 text-muted-foreground">Validación del estatus legal y reporte de robo de los activos.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Shield className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">4. Derechos ARCO</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Usted tiene derecho a conocer qué datos personales tenemos de usted (Acceso), solicitar la corrección de su información personal (Rectificación), oponerse al uso de sus datos para fines específicos (Oposición), o solicitar la eliminación de sus datos (Cancelación).
                        </p>
                        <p className="text-sm font-bold bg-primary/5 p-4 rounded-lg border border-primary/10">
                            Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del correo electrónico: <a href="mailto:privacidad@clinkar.com" className="text-primary underline">privacidad@clinkar.com</a>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <HistoryIcon className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">5. Periodo de Resguardo Obligatorio</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            De conformidad con el <strong>Artículo 30 del Código Fiscal de la Federación (CFF)</strong>, CLINKAR tiene la obligación legal de conservar la documentación y contabilidad de las transacciones por un <strong>periodo mínimo de 5 años</strong>. Por lo anterior, el ejercicio del derecho de Cancelación de datos personales estará supeditado a que transcurra dicho plazo legal.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <Lock className="h-6 w-6" />
                            <h2 className="text-2xl font-bold">6. Seguridad de la Información</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales. El resguardo de sus documentos sensibles se realiza mediante <strong>encriptación AES-256</strong> y protocolos de seguridad de grado bancario en nuestra Bóveda Digital.
                        </p>
                    </div>
                </section>

                <footer className="pt-12 border-t text-center">
                    <p className="text-sm text-muted-foreground italic">
                        El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos o de cambios en nuestro modelo de negocio.
                    </p>
                </footer>
            </main>
        </div>
    );
}

function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}

function CheckCircleIcon() {
    return <Lock className="h-4 w-4 text-primary shrink-0" />;
}
