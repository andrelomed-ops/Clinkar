
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, Mail, Phone, MapPin, Send, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
            <ContactContent />
        </Suspense>
    );
}

function ContactContent() {
    const searchParams = useSearchParams();
    const subjectParam = searchParams.get("subject");
    const idParam = searchParams.get("id");

    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: subjectParam ? "sales" : "",
        message: subjectParam ? `Interés en: ${subjectParam}${idParam ? ` (ID: ${idParam})` : ''}\n\nHola, me gustaría recibir más información sobre esto.` : ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/5 to-transparent blur-3xl -z-10" />
                <div className="max-w-4xl mx-auto text-center space-y-6 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-black uppercase tracking-widest">
                        <MessageSquare className="h-4 w-4" /> Estamos para ayudarte
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                        Ponte en <span className="text-indigo-600">Contacto</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                        ¿Tienes dudas sobre una transacción o necesitas soporte técnico? Nuestro equipo responde en menos de 2 horas.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-32">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Info Column */}
                    <div className="lg:col-span-1 space-y-8 animate-reveal stagger-1">
                        <div className="glass-card rounded-[2rem] p-8 space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Correo Electrónico</h3>
                                    <p className="text-muted-foreground font-medium">soporte@clinkar.com</p>
                                    <p className="text-xs text-indigo-500 font-bold mt-1 uppercase tracking-tighter">Respuesta rápida</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">WhatsApp Business</h3>
                                    <p className="text-muted-foreground font-medium">+52 55 1234 5678</p>
                                    <p className="text-xs text-green-500 font-bold mt-1 uppercase tracking-tighter">Lunes a Viernes 9am - 6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Oficinas Centrales</h3>
                                    <p className="text-muted-foreground font-medium">Av. Paseo de la Reforma, CDMX</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-indigo-600 text-white space-y-4 shadow-xl shadow-indigo-500/20">
                            <Shield className="h-8 w-8 opacity-50" />
                            <h3 className="text-xl font-bold">Seguridad Garantizada</h3>
                            <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                                Toda la comunicación a través de nuestra plataforma está cifrada para proteger tu privacidad y datos financieros.
                            </p>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-2 animate-reveal stagger-2">
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="glass-card rounded-[3rem] p-10 md:p-14 border border-indigo-500/10 shadow-2xl shadow-indigo-500/5 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Nombre Completo</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Tu nombre..."
                                            className="w-full h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Correo Electrónico</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="tu@email.com"
                                            className="w-full h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Asunto</label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-secondary/50 border-none px-6 font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                                    >
                                        <option value="">Selecciona una opción</option>
                                        <option value="support">Soporte Técnico</option>
                                        <option value="sales">Ventas / Publicar Auto</option>
                                        <option value="legal">Temas Legales / Contratos</option>
                                        <option value="business">Alianzas Comerciales</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Mensaje</label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="¿En qué podemos ayudarte?"
                                        rows={5}
                                        className="w-full rounded-3xl bg-secondary/50 border-none p-6 font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>Enviar Mensaje <Send className="h-6 w-6" /></>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="glass-card rounded-[3rem] p-16 text-center space-y-8 animate-in zoom-in duration-500 border-green-500/20 shadow-2xl shadow-green-500/5">
                                <div className="h-24 w-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                    <Send className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight">¡Mensaje Enviado!</h2>
                                    <p className="text-muted-foreground font-medium">Gracias por contactarnos. Un experto de Clinkar revisará tu solicitud y te contactará a la brevedad.</p>
                                </div>
                                <button
                                    onClick={() => setSent(false)}
                                    className="px-8 py-4 rounded-full bg-secondary font-bold hover:bg-secondary/80 transition-all"
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
