"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, Info, AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const supabase = createClient();

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (data) setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        setIsMounted(true);
        fetchNotifications();

        // Subscribe to real-time notifications
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async (id: string) => {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'FINANCIAL': return <CreditCard className="h-4 w-4 text-green-500" />;
            case 'SUCCESS': return <Check className="h-4 w-4 text-primary" />;
            case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default: return <Info className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-10 w-10 rounded-full bg-secondary flex items-center justify-center transition-all hover:bg-secondary/80 active:scale-90"
            >
                <Bell className="h-5 w-5 text-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce-subtle">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-4 w-80 max-h-[480px] bg-background border border-border rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <header className="px-6 py-4 border-b flex justify-between items-center bg-secondary/20">
                            <h3 className="font-bold text-sm">Notificaciones</h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{unreadCount} nuevas</span>
                        </header>

                        <div className="overflow-y-auto max-h-[380px]">
                            {loading ? (
                                <div className="p-8 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={n.link || "#"}
                                        onClick={() => {
                                            markAsRead(n.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex gap-4 p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors relative",
                                            !n.is_read && "bg-primary/5"
                                        )}
                                    >
                                        {!n.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />}
                                        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center shrink-0 border border-border">
                                            {getTypeIcon(n.type)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold leading-tight">{n.title}</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                                            <p className="text-[9px] text-muted-foreground font-medium uppercase mt-1">
                                                {isMounted && new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-12 text-center text-muted-foreground">
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-medium">No hay notificaciones aún</p>
                                </div>
                            )}
                        </div>

                        <footer className="p-4 bg-secondary/10 text-center border-t">
                            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                                Marcar todas como leídas
                            </button>
                        </footer>
                    </div>
                </>
            )}
        </div>
    );
}
