"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    carId?: string;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const supabase = createClient();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);

        const uploadPromises = files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            const { data, error } = await supabase.storage
                .from('car-images')
                .upload(filePath, file);

            if (error) {
                console.error('Error uploading image:', error);
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('car-images')
                .getPublicUrl(filePath);

            return publicUrl;
        });

        const urls = await Promise.all(uploadPromises);
        const successfulUrls = urls.filter((url): url is string => url !== null);
        onUpload(successfulUrls);
        setUploading(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm"
                            onClick={() => setPreviews(prev => prev.filter((_, index) => index !== i))}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                    {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground mt-2">Subir fotos</span>
                        </>
                    )}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    );
}
