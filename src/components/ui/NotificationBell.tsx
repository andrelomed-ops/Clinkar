"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, ChevronRight, Loader2, RefreshCcw } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Notification, NotificationService } from "@/services/NotificationService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState<string>("");
    const supabase = createBrowserClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            console.log("[NotificationBell] Initializing...");
            setDebugInfo("Iniciando...");
            try {
                console.log("[NotificationBell] Checking session...");
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.log("[NotificationBell] No session, skipping notification fetch.");
                    setDebugInfo("No session");
                    setLoading(false);
                    return;
                }

                console.log("[NotificationBell] Fetching user...");
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    // Silence AuthSessionMissingError as it's expected when not logged in
                    if (userError.name !== 'AuthSessionMissingError') {
                        console.error("[NotificationBell] User fetch error:", userError);
                        setDebugInfo(`Error user: ${userError.message}`);
                    } else {
                        setDebugInfo("No auth session");
                    }
                    setLoading(false);
                    return;
                }

                if (!user) {
                    console.log("[NotificationBell] No user found, stopping.");
                    setDebugInfo("No user");
                    setLoading(false);
                    return;
                }

                console.log("[NotificationBell] User found:", user.id);
                setDebugInfo(`User: ${user.email}`);

                // Initial Fetch
                console.log("[NotificationBell] Fetching notifications...");
                const data = await NotificationService.getNotifications(supabase);
                console.log("[NotificationBell] Notifications fetched:", data?.length || 0);

                setNotifications(data || []);
                setUnreadCount((data || []).filter(n => !n.is_read).length);

                // Realtime subscription
                console.log("[NotificationBell] Subscribing to realtime...");
                subscription = NotificationService.subscribeToNotifications(
                    supabase,
                    user.id,
                    (newNotif) => {
                        console.log("[NotificationBell] New realtime notification:", newNotif);
                        setNotifications(prev => [newNotif, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    }
                );

                setDebugInfo("Listo");
            } catch (err) {
                console.error("[NotificationBell] Critical init error:", err);
                setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        };

        init();

        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await NotificationService.markAsRead(supabase, id);
        if (success) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'SUCCESS': return <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Check className="h-4 w-4" /></div>;
            case 'WARNING': return <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600"><AlertTriangle className="h-4 w-4" /></div>;
            case 'FINANCIAL': return <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600"><Info className="h-4 w-4" /></div>;
            default: return <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Info className="h-4 w-4" /></div>;
        }
    };

    const formatDistanceCustom = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diff < 60) return 'hace un momento';
            if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
            if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
            return date.toLocaleDateString('es-MX');
        } catch (e) {
            return 'Recientemente';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full hover:bg-secondary/80 transition-all border border-border/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 border-2 border-background text-[10px] font-black text-white items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 w-[380px] rounded-[2rem] p-4 shadow-2xl border bg-card border-indigo-500/10 space-y-2 mt-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 pb-4 mb-4">
                        <div className="flex flex-col">
                            <h3 className="font-black text-lg tracking-tight italic">Notificaciones</h3>
                            <p className="text-[10px] text-muted-foreground opacity-50 uppercase tracking-widest">{debugInfo}</p>
                        </div>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 font-bold border-none">
                                {unreadCount} nuevas
                            </Badge>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="py-12 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-600/50" />
                                Obteniendo actualizaciones...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground italic space-y-2">
                                <div className="h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <RefreshCcw className="h-6 w-6" />
                                </div>
                                <p className="font-medium">Todo al día por aquí</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-indigo-500/10 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/20 group relative mb-2",
                                        !notification.is_read && "bg-indigo-500/5"
                                    )}
                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                >
                                    <div className="flex items-start gap-3">
                                        {getTypeIcon(notification.type)}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-black leading-none">{notification.title}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                    {formatDistanceCustom(notification.created_at)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-600" />
                                    )}
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="mt-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all p-2 bg-indigo-500/5 rounded-full w-fit"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Ver detalles <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-border/40 text-center">
                        <Button variant="ghost" size="sm" className="w-full rounded-2xl font-bold text-xs text-muted-foreground hover:text-foreground">
                            Configuración de alertas
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
