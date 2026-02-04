"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, ChevronDown, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WarrantyExplanation() {
    const [openItem, setOpenItem] = useState<string | null>("item-1");

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-black text-lg">Garantía y Protección Clinkar</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Transparencia y Seguridad P2P</p>
                </div>
            </div>

            <div className="space-y-2">
                <AccordionItem
                    id="item-1"
                    isOpen={openItem === "item-1"}
                    onToggle={() => toggleItem("item-1")}
                    icon="📋"
                    title="Nivel 1: Transparencia (Incluido)"
                >
                    Clinkar garantiza la **veracidad del reporte de inspección**. Si el reporte declara un fallo, tú compras sabiendo la condición exacta ("As-Is"). Nuestra responsabilidad es que no haya sorpresas omitidas por negligencia del inspector.
                </AccordionItem>

                <AccordionItem
                    id="item-2"
                    isOpen={openItem === "item-2"}
                    onToggle={() => toggleItem("item-2")}
                    icon="🛡️"
                    title="Nivel 2: Seguro de Protección (Opcional)"
                >
                    Puedes contratar planes de **30, 60 o 90 días** de cobertura mecánica. Este es un seguro que Clinkar gestiona con terceros para cubrir averías imprevistas en motor y transmisión que NO estaban presentes el día de la venta. Es una excelente forma de monetizar y dar paz mental.
                </AccordionItem>

                <AccordionItem
                    id="item-3"
                    isOpen={openItem === "item-3"}
                    onToggle={() => toggleItem("item-3")}
                    icon={<ShieldAlert className="h-4 w-4 text-amber-500" />}
                    title="Limitaciones y Fallos Conocidos"
                >
                    **IMPORTANTE:** Ningún seguro o garantía de Clinkar cubre fallos ya reportados en la inspección inicial que el comprador aceptó al firmar. Si el auto tiene un fallo declarado, el costo de reparación corre por cuenta del comprador.
                </AccordionItem>

                <AccordionItem
                    id="item-4"
                    isOpen={openItem === "item-4"}
                    onToggle={() => toggleItem("item-4")}
                    icon={<HelpCircle className="h-4 w-4 text-indigo-500" />}
                    title="¿Quién responde ante la ley?"
                >
                    En ventas P2P, la responsabilidad por vicios ocultos (mala fe) recae en el **Vendedor Particular**. Clinkar actúa como mediador tecnológico y garantiza únicamente la precisión de su diagnóstico técnico profesional realizado por expertos.
                </AccordionItem>
            </div>

            <div className="mt-6 pt-6 border-t border-dashed border-border flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-muted-foreground font-medium italic">
                    Protección basada en inspección mecánica certificada de 180 puntos.
                </p>
            </div>
        </div>
    );
}

function AccordionItem({
    id,
    isOpen,
    onToggle,
    icon,
    title,
    children
}: {
    id: string,
    isOpen: boolean,
    onToggle: () => void,
    icon: React.ReactNode,
    title: string,
    children: React.ReactNode
}) {
    return (
        <div className="border-b border-border/50 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left hover:opacity-70 transition-opacity"
            >
                <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-5 flex justify-center">{icon}</span>
                    <span className="text-sm font-bold">{title}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden text-xs text-muted-foreground leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
