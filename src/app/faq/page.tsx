
"use client";

import { useState } from "react";
import { Shield, ChevronDown, HelpCircle, Car, DollarSign, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";

const FAQS = [
    {
        category: "General",
        icon: <HelpCircle className="h-5 w-5" />,
        items: [
            {
                q: "¿Qué es Clinkar?",
                a: "Clinkar es la primera bóveda digital para la compraventa de autos seminuevos en México. Actuamos como un intermediario de confianza que protege tu dinero y garantiza que el vehículo esté en las condiciones prometidas mediante una certificación de 150 puntos."
            },
            {
                q: "¿Es seguro usar Clinkar?",
                a: "Absolutamente. Utilizamos tecnología de vanguardia para proteger las transacciones. El dinero del comprador se mantiene resguardado en nuestra bóveda digital y solo se libera al vendedor cuando ambas partes han confirmado la entrega satisfactoria."
            }
        ]
    },
    {
        category: "Comprar",
        icon: <Car className="h-5 w-5" />,
        items: [
            {
                q: "¿Cómo sé que el auto está en buen estado?",
                a: "Todos los autos con el 'Sello Clinkar' han pasado por una rigurosa inspección mecánica y legal de 150 puntos realizada por expertos certificados."
            },
            {
                q: "¿Puedo ver el auto antes de comprar?",
                a: "Clinkar facilita la inspección técnica. Una vez que demuestras interés serio a través de la plataforma, coordinamos la revisión para que compres con total transparencia."
            }
        ]
    },
    {
        category: "Pagos y Seguridad",
        icon: <Lock className="h-5 w-5" />,
        items: [
            {
                q: "¿Cuándo recibe el vendedor el dinero?",
                a: "El dinero se libera instantáneamente una vez que el comprador escanea el código QR de entrega y confirma que el vehículo coincide con el reporte de inspección."
            },
            {
                q: "¿Qué pasa si el auto no coincide con la descripción?",
                a: "Si durante la entrega detectas una discrepancia grave no reportada, puedes cancelar la transacción antes de liberar los fondos. Clinkar protege tu inversión en todo momento."
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>("0-0");

    const toggleFaq = (idx: string) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl -z-10" />
                <div className="max-w-4xl mx-auto text-center space-y-6 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-black uppercase tracking-widest">
                        <Shield className="h-4 w-4" /> Centro de Soporte
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                        Preguntas <span className="text-indigo-600">Frecuentes</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                        Todo lo que necesitas saber sobre la nueva era de la compraventa de autos.
                    </p>
                </div>
            </section>

            {/* FAQ Accordion */}
            < section className="max-w-3xl mx-auto px-6 pb-32" >
                <div className="space-y-12">
                    {FAQS.map((category, catIdx) => (
                        <div key={catIdx} className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <div className="p-2 rounded-xl bg-secondary">{category.icon}</div>
                                <h2 className="text-xl font-black tracking-tight uppercase">{category.category}</h2>
                            </div>
                            <div className="space-y-4">
                                {category.items.map((item, itemIdx) => {
                                    const id = `${catIdx}-${itemIdx}`;
                                    const isOpen = openIndex === id;
                                    return (
                                        <div
                                            key={id}
                                            className={cn(
                                                "group rounded-3xl border transition-all duration-300",
                                                isOpen ? "bg-white dark:bg-zinc-900 border-indigo-200 shadow-xl shadow-indigo-500/5 scale-[1.02]" : "bg-secondary/20 border-transparent hover:border-border"
                                            )}
                                        >
                                            <button
                                                onClick={() => toggleFaq(id)}
                                                className="w-full text-left p-6 flex items-center justify-between gap-4"
                                            >
                                                <span className="font-bold text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {item.q}
                                                </span>
                                                <div className={cn(
                                                    "p-2 rounded-full bg-secondary transition-transform duration-300",
                                                    isOpen ? "rotate-180 bg-indigo-500 text-white" : ""
                                                )}>
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </button>
                                            <div className={cn(
                                                "overflow-hidden transition-all duration-300 ease-in-out",
                                                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                            )}>
                                                <div className="px-6 pb-8 text-muted-foreground font-medium leading-relaxed">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 p-12 rounded-[3rem] bg-indigo-600 text-white text-center space-y-6 shadow-2xl shadow-indigo-500/20">
                    <HelpCircle className="h-12 w-12 mx-auto opacity-50" />
                    <h3 className="text-3xl font-black">¿Aún tienes dudas?</h3>
                    <p className="text-indigo-100 font-medium">Nuestro equipo de soporte está listo para ayudarte en cada paso.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button asChild variant="secondary" size="lg" className="rounded-2xl font-bold h-14 px-8 bg-white text-indigo-600 hover:bg-indigo-50">
                            <Link href="/contact">Hablar con Soporte</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-2xl font-bold h-14 px-8 border-white/20 hover:bg-white/10">
                            <Link href="/help">Explorar Guías</Link>
                        </Button>
                    </div>
                </div>
            </section >
        </div >
    );
}

function Button({ children, className, variant, size, asChild, ...props }: any) {
    const Comp = asChild ? "div" : "button";
    return (
        <Comp
            className={cn(
                "inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-50",
                size === "lg" ? "h-14 px-8 text-base" : "h-10 px-4 text-sm",
                variant === "secondary" ? "" : "border",
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    );
}
