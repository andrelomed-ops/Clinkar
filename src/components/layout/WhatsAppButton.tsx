"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/525512345678?text=Hola%20Clinkar,%20necesito%20ayuda%20con%20una%20compra."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 bg-[#25D366] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
        >
            <MessageCircle className="h-8 w-8 fill-current" />
            <span className="absolute right-full mr-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Ayuda WhatsApp
            </span>
        </a>
    );
}
