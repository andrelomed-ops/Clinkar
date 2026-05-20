"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, Info, AlertTriangle, ChevronRight, Loader2, RefreshCcw } from "lucide-react";
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
    const [mounted, setMounted] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, width: 340 });
    const supabase = createBrowserClient();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            setDebugInfo("Iniciando...");
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setDebugInfo("No session");
                    setLoading(false);
                    return;
                }

                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    setDebugInfo(userError.name !== 'AuthSessionMissingError' ? `Error: ${userError.message}` : "No auth session");
                    setLoading(false);
                    return;
                }
                if (!user) {
                    setDebugInfo("No user");
                    setLoading(false);
                    return;
                }

                setDebugInfo(`User: ${user.email}`);
                const data = await NotificationService.getNotifications(supabase);
                setNotifications(data || []);
                setUnreadCount((data || []).filter(n => !n.is_read).length);

                subscription = NotificationService.subscribeToNotifications(
                    supabase,
                    user.id,
                    (newNotif) => {
                        setNotifications(prev => [newNotif, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    }
                );
                setDebugInfo("Listo");
            } catch (err) {
                setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        };

        init();

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const vw = window.innerWidth;
            const w = Math.min(360, vw - 16);
            const rightFromViewportEdge = vw - rect.right;
            setDropdownPos({
                top: rect.bottom + 8,
                right: Math.max(8, rightFromViewportEdge),
                width: w,
            });
        }
        setIsOpen(prev => !prev);
    };

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await NotificationService.markAsRead(supabase, id);
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'SUCCESS': return <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0"><Check className="h-4 w-4" /></div>;
            case 'WARNING': return <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0"><AlertTriangle className="h-4 w-4" /></div>;
            case 'FINANCIAL': return <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0"><Info className="h-4 w-4" /></div>;
            default: return <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0"><Info className="h-4 w-4" /></div>;
        }
    };

    const formatDistanceCustom = (dateStr: string) => {
        try {
            const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
            if (diff < 60) return 'hace un momento';
            if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
            if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
            return new Date(dateStr).toLocaleDateString('es-MX');
        } catch { return 'Recientemente'; }
    };

    return (
        <div className="relative">
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full hover:bg-secondary/80 transition-all border border-border/50"
                onClick={handleToggle}
            >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 border-2 border-background text-[10px] font-black text-white items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </Button>

            {/* 
                CRITICAL: Render dropdown via createPortal into document.body.
                This ensures the 360px wide dropdown is NEVER part of the page layout tree
                and cannot contribute to horizontal overflow on iOS Safari.
            */}
            {isOpen && mounted && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[999] rounded-[2rem] p-4 shadow-2xl border bg-card border-indigo-500/10 space-y-2 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: `${dropdownPos.top}px`,
                        right: `${dropdownPos.right}px`,
                        width: `${dropdownPos.width}px`,
                        maxWidth: 'calc(100vw - 1rem)',
                    }}
                >
                    <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-border/40">
                        <div>
                            <h3 className="font-black text-lg tracking-tight italic">Notificaciones</h3>
                            <p className="text-[10px] text-muted-foreground opacity-50 uppercase tracking-widest">{debugInfo}</p>
                        </div>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 font-bold border-none shrink-0">
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
                                    <div className="flex items-start gap-3 min-w-0">
                                        {getTypeIcon(notification.type)}
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-black leading-snug truncate flex-1">{notification.title}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter shrink-0">
                                                    {formatDistanceCustom(notification.created_at || '')}
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-600" />
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
                </div>,
                document.body
            )}
        </div>
    );
}
