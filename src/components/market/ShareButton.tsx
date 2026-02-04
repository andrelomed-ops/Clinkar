"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: `${text} | Vía Clinkar`,
                    url: shareUrl,
                });
            } catch (err) {
                console.log("Share failed:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={cn(
                "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold transition-all mt-4",
                copied
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            )}
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4" /> Enlace Copiado
                </>
            ) : (
                <>
                    <Share2 className="h-4 w-4" /> Compartir con un amigo
                </>
            )}
        </button>
    );
}
