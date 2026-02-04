"use client";

import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Check, X, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

import { createBrowserClient } from "@/lib/supabase/client";

interface CameraUploadProps {
    onUpload: (url: string) => void;
    label?: string;
    description?: string;
    category?: 'PHOTO' | 'DOCUMENT';
    className?: string;
    transactionId?: string; // Optional for generic use
}

export function CameraUpload({ onUpload, label = "Capturar", description, category = 'PHOTO', className, transactionId }: CameraUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createBrowserClient();

    const [compressionRate, setCompressionRate] = useState<number | null>(null);

    // Helper: Client-side compression
    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Good balance for documents
                const scaleSize = MAX_WIDTH / img.width;

                // Only resize if width > MAX_WIDTH
                if (scaleSize < 1) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Compress to JPEG at 80% quality
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Compression failed'));
                    }
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset previous states
        setCompressionRate(null);

        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setIsUploading(true);

        try {
            // 1. Compress
            const compressedBlob = await compressImage(file);
            const originalSize = file.size / 1024 / 1024; // MB
            const compressedSize = compressedBlob.size / 1024 / 1024; // MB
            const reduction = Math.round((1 - (compressedSize / originalSize)) * 100);
            setCompressionRate(reduction > 0 ? reduction : 0);

            // 2. Size Validation (Max 5MB)
            if (compressedBlob.size > 5 * 1024 * 1024) {
                alert("La imagen es demasiado grande incluso después de comprimir. Intenta con otra.");
                setPreview(null);
                setIsUploading(false);
                return;
            }

            // 3. Upload
            const fileName = label.replace(/\s+/g, '_').toLowerCase();
            const fileExt = 'jpg'; // We force JPEG
            const path = `uploads/${transactionId || 'anonymous'}/${Date.now()}_${fileName}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('transaction-docs')
                .upload(path, compressedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('transaction-docs')
                .getPublicUrl(path);

            onUpload(publicUrl);
        } catch (error) {
            // console.error("Upload failed:", error);
            // alert("Error al subir la imagen. Inténtalo de nuevo."); // Remove alert for cleaner UI or handle differently
            setPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const clearPreview = () => {
        setPreview(null);
        setCompressionRate(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={cn("space-y-4", className)}>
            {label && (
                <label className="text-sm font-bold text-foreground/80 block">
                    {label}
                </label>
            )}

            <div
                className={cn(
                    "relative min-h-[180px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center overflow-hidden",
                    preview
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                )}
            >
                {preview ? (
                    <div className="absolute inset-0 z-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover opacity-40 blur-[2px]"
                        />
                    </div>
                ) : null}

                <div className="relative z-10 flex flex-col items-center gap-3">
                    {isUploading ? (
                        <>
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            </div>
                            <p className="text-sm font-bold text-primary animate-pulse">Subiendo...</p>
                        </>
                    ) : preview ? (
                        <>
                            <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">Imagen Capturada</p>
                                <button
                                    onClick={clearPreview}
                                    className="text-xs text-red-500 font-bold hover:underline"
                                >
                                    Cambiar / Eliminar
                                </button>
                                {compressionRate !== null && compressionRate > 0 && (
                                    <p className="text-[10px] text-green-600 font-medium animate-in fade-in">
                                        Generando versión web... (-{compressionRate}%)
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="h-14 w-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {category === 'PHOTO' ? (
                                    <Camera className="h-7 w-7 text-muted-foreground" />
                                ) : (
                                    <UploadCloud className="h-7 w-7 text-muted-foreground" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">
                                    {category === 'PHOTO' ? "Tomar Foto o Subir" : "Escanear Documento"}
                                </p>
                                {description && (
                                    <p className="text-xs text-muted-foreground max-w-[200px]">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Hidden File Input with native capture */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture={category === 'PHOTO' ? "environment" : undefined}
                    onChange={handleCapture}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    disabled={isUploading}
                />
            </div>

            {!preview && !isUploading && (
                <div className="flex justify-center gap-4">
                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                        Soporta: JPG, PNG, HEIC
                    </p>
                </div>
            )}
        </div>
    );
}
