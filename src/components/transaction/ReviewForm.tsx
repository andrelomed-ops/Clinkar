"use client";

import { useState } from "react";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReviewService } from "@/services/ReviewService";
import { createBrowserClient } from "@/lib/supabase/client";

interface ReviewFormProps {
    transactionId: string;
    carId: string;
    onSuccess?: () => void;
}

export function ReviewForm({ transactionId, carId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Por favor selecciona una calificación.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = createBrowserClient();
            await ReviewService.createReview(supabase, {
                transaction_id: transactionId,
                car_id: carId,
                rating,
                comment
            });
            setSubmitted(true);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al enviar la reseña.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 text-center animate-in zoom-in duration-500">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-emerald-500 h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-emerald-400 mb-2 tracking-tight">¡Gracias por tu reseña!</h3>
                <p className="text-sm text-emerald-400/60 leading-relaxed">Tu feedback nos ayuda a construir un mercado más transparente.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-2xl font-black mb-2 tracking-tight">Califica tu Experiencia</h3>
            <p className="text-sm text-muted-foreground mb-8">Ayuda a otros usuarios compartiendo cómo fue tu proceso con Clinkar.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block">Calificación</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-all hover:scale-110 active:scale-90"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        (hover || rating) >= star
                                            ? "fill-amber-400 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                            : "text-zinc-200 dark:text-zinc-800"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block">Comentario</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Cuéntanos más detalles..."
                        className="w-full min-h-[120px] bg-slate-50 dark:bg-zinc-800/50 border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-zinc-400"
                    />
                </div>

                {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 font-bold">{error}</div>}

                <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20"
                    disabled={loading || rating === 0}
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            Enviar Valoración <Send className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </form>
        </div>
    );
}
