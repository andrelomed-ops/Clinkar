"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, Shield, Check, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function NotificationPreferenceCenter() {
    const [prefs, setPrefs] = useState({
        email_welcome: true,
        email_offers: true,
        email_payments: true,
        push_updates: false,
        push_marketing: false
    });

    const toggle = (key: keyof typeof prefs) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 border-indigo-500/10 shadow-2xl shadow-indigo-500/5">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <Bell className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight">Preferencias de Comunicación</h3>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Control de la Bóveda</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Email Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Correo Electrónico
                    </h4>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <p className="text-sm font-bold">Ofertas y Negociaciones</p>
                            <p className="text-xs text-muted-foreground">Recibe alertas inmediatas cuando alguien se interese en tu auto.</p>
                        </div>
                        <Switch checked={prefs.email_offers} onCheckedChange={() => toggle('email_offers')} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <p className="text-sm font-bold">Actualizaciones de Bóveda</p>
                            <p className="text-xs text-muted-foreground">Confirmaciones de pago y estados de liberación de fondos.</p>
                        </div>
                        <Switch checked={prefs.email_payments} onCheckedChange={() => toggle('email_payments')} />
                    </div>
                </div>

                {/* Push Section */}
                <div className="space-y-4 pt-4">
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone className="h-3 w-3" /> Notificaciones Push
                    </h4>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <p className="text-sm font-bold">Alertas en Tiempo Real</p>
                            <p className="text-xs text-muted-foreground">Notificaciones instantáneas en tu navegador o móvil.</p>
                        </div>
                        <Switch checked={prefs.push_updates} onCheckedChange={() => toggle('push_updates')} />
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                    <Shield className="h-3 w-3" /> Encriptación AES-256 Activa
                </div>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-lg shadow-indigo-500/20">
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
