"use client";

import { 
    Zap, Settings, ShieldCheck, Camera as CameraIcon, Layers, 
    Wind, Sun, Tablet, Smartphone, Bluetooth, 
    Car as CarIcon, Users, Maximize, Fuel, Gauge, 
    Activity, Shield, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicalSpecsProps {
    specs: any;
    category?: string;
}

export function TechnicalSpecsSheet({ specs, category }: TechnicalSpecsProps) {
    if (!specs) return null;

    const { performance, architecture, features, security } = specs;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full max-w-full overflow-hidden min-w-0">
            {/* Highlights Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {features?.carPlay && <HighlightBadge icon={<Smartphone className="h-5 w-5" />} label="Apple CarPlay" />}
                {features?.sunroof && <HighlightBadge icon={<Sun className="h-5 w-5" />} label="Quemacocos" />}
                {security?.reverseCamera && <HighlightBadge icon={<CameraIcon className="h-5 w-5" />} label="Cámara Reversa" />}
                {security?.abs && <HighlightBadge icon={<ShieldCheck className="h-5 w-5" />} label="Frenos ABS" />}
            </div>

            <div className="grid lg:grid-cols-2 gap-x-2 gap-y-4 md:gap-8">
                {/* Performance & Mechanics */}
                <SpecCategory 
                    title={category === 'Air' || category === 'Marine' ? "Planta de Poder" : "Motor y Desempeño"} 
                    icon={<Zap className="h-5 w-5 text-indigo-500" />}
                    items={[
                        { label: category === 'Air' ? "Motores" : "Motor", value: performance?.engine },
                        { label: category === 'Air' ? "Ciclos / TBO" : "Potencia", value: performance?.horsepower },
                        { label: category === 'Air' || category === 'Marine' ? "Propulsión" : "Transmisión", value: performance?.transmission },
                        { label: "Combustible", value: performance?.fuelType },
                        { label: "Tracción", value: performance?.driveTrain },
                        { label: "Cilindros", value: performance?.cylinders }
                    ]}
                />

                {/* Architecture & Dimensions */}
                <SpecCategory 
                    title={category === 'Marine' ? "Arquitectura Naval" : category === 'Air' ? "Fuselaje" : "Arquitectura"} 
                    icon={<Maximize className="h-5 w-5 text-indigo-500" />}
                    items={[
                        { label: category === 'Marine' ? "Tipo de Casco" : category === 'Air' ? "Fuselaje" : "Carrocería", value: architecture?.bodyType },
                        { label: category === 'Marine' ? "Eslora" : category === 'Air' ? "Carga Útil" : "Puertas", value: architecture?.doors },
                        { label: "Pasajeros", value: architecture?.passengers },
                        { label: "Dimensiones", value: architecture?.dimensions },
                        { label: "Tanque", value: architecture?.tankCapacity },
                        { label: "Rines", value: architecture?.rims }
                    ]}
                />

                {/* Comfort & Tech */}
                <SpecCategory 
                    title="Equipamiento y Confort" 
                    icon={<Settings className="h-5 w-5 text-indigo-500" />}
                    items={[
                        { label: "Aire Acondicionado", value: features?.ac ? "Sí" : "No" },
                        { label: "Asientos de Piel", value: features?.leatherSeats ? "Sí" : "No" },
                        { label: "Pantalla Táctil", value: features?.touchScreen ? "Sí" : "No" },
                        { label: "Android Auto", value: features?.androidAuto ? "Sí" : "No" },
                        { label: "Bluetooth", value: features?.bluetooth ? "Sí" : "No" },
                        { label: "Botón Encendido", value: features?.startStopButton ? "Sí" : "No" }
                    ]}
                />

                {/* Security */}
                <SpecCategory 
                    title="Seguridad" 
                    icon={<Shield className="h-5 w-5 text-indigo-500" />}
                    items={[
                        { label: "Bolsas de Aire", value: security?.airbags },
                        { label: "Frenos ABS", value: security?.abs ? "Sí" : "No" },
                        { label: "Discos de Freno", value: security?.discBrakes },
                        { label: "Sensores", value: security?.parkingSensors ? "Sí" : "No" }
                    ]}
                />
            </div>
        </div>
    );
}

function HighlightBadge({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-3 md:p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all group overflow-hidden">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform shrink-0">
                {icon}
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-center leading-tight break-words w-full">{label}</span>
        </div>
    );
}

function SpecCategory({ title, icon, items }: { title: string, icon: React.ReactNode, items: { label: string, value: any }[] }) {
    const validItems = items.filter(item => item.value !== undefined && item.value !== "" && item.value !== null);
    if (validItems.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-[2rem] p-2 md:p-8 shadow-sm w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-xl shrink-0">
                    {icon}
                </div>
                <h4 className="text-[11px] md:text-sm font-black uppercase tracking-tight md:tracking-[0.2em] text-foreground flex-1 min-w-0 break-words leading-tight">{title}</h4>
            </div>
            <div className="space-y-1">
                {validItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-2 py-3 border-b border-border/50 last:border-0 gap-4 items-center min-w-0">
                        <span className="text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider break-words leading-tight min-w-0">{item.label}</span>
                        <span className="text-[10px] md:text-sm font-black text-foreground text-right break-words leading-tight min-w-0">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
