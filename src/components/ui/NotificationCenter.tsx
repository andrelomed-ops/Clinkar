"use client";

import { useState, useRef, useEffect } from "react";
import {
    Bell,
    CheckCircle2,
    FileText,
    ShieldCheck,
    Banknote,
    X,
    Circle,
    BellOff,
    Settings,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { Notification, NotificationService } from "@/services/NotificationService";

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserClient();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setLoading(false);
                    return;
                }

                const data = await NotificationService.getNotifications(supabase);
                setNotifications(data || []);

                subscription = NotificationService.subscribeToNotifications(
                    supabase,
                    session.user.id,
                    (newNotif) => {
                        setNotifications(prev => [newNotif, ...prev]);
                    }
                );
            } catch (err) {
                console.error("Error loading notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            init();
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [isOpen, supabase]);

    const markAllRead = async () => {
        const success = await NotificationService.markAllAsRead(supabase);
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.is_read) {
            const success = await NotificationService.markAsRead(supabase, notif.id);
            if (success) {
                setNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
                );
            }
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "FINANCIAL": return <Banknote className="h-4 w-4 text-emerald-500" />;
            case "SUCCESS": return <ShieldCheck className="h-4 w-4 text-blue-500" />;
            case "WARNING": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default: return <Bell className="h-4 w-4 text-zinc-500" />;
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
            if (diff < 60) return 'Ahora';
            if (diff < 3600) return `${Math.floor(diff / 60)} min`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
            return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
        } catch (e) {
            return 'Reciente';
        }
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group active:scale-95"
            >
                <Bell className={cn(
                    "h-5 w-5 transition-colors",
                    unreadCount > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                )} />
                {unreadCount > 0 && (
                    <>
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center z-10">
                            {unreadCount}
                        </span>
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-indigo-400 rounded-full animate-ping opacity-75" />
                    </>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-over Panel */}
            <div className={cn(
                "fixed top-0 right-0 h-screen w-full sm:max-w-md bg-white dark:bg-zinc-950 z-[101] shadow-2xl transition-transform duration-500 ease-in-out border-l border-zinc-200 dark:border-zinc-800 flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            Notificaciones
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Alertas en Tiempo Real</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-50 dark:border-zinc-900/50 mb-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {unreadCount} Nuevas Mensajes
                        </span>
                        <button
                            onClick={markAllRead}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                        >
                            Leer Todo
                        </button>
                    </div>

                    <div className="space-y-1">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "group p-4 rounded-2xl transition-all border border-transparent cursor-pointer",
                                        notification.is_read
                                            ? "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                            : "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/10"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            notification.is_read ? "bg-zinc-100 dark:bg-zinc-800" : "bg-white dark:bg-zinc-900 shadow-sm"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{notification.title}</h4>
                                                {!notification.is_read && <Circle className="h-2 w-2 fill-indigo-600 text-indigo-600" />}
                                            </div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] font-bold text-zinc-400 block pt-1 uppercase tracking-tighter">{formatTime(notification.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                                <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 mb-4">
                                    <BellOff className="h-8 w-8" />
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">Buzón Vacío</h4>
                                <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">Te avisaremos cuando ocurra algo importante en tu Bóveda.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
                    <button className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configurar Canales
                    </button>
                    <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest">
                        Seguridad Clinkar Protegida
                    </p>
                </div>
            </div>
        </div>
    );
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}
