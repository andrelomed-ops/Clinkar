"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    carId?: string;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const supabase = createBrowserClient();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);

        const uploadPromises = files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            const { error } = await supabase.storage
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
        // Reset input
        e.target.value = '';
    };

    return (
        <label className="flex flex-col items-center justify-center aspect-video w-full h-full rounded-[2rem] border-2 border-dashed border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/5 cursor-pointer transition-all group overflow-hidden">
            {uploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subiendo...</span>
                </div>
            ) : (
                <>
                    <Upload className="h-8 w-8 text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest mt-3 transition-colors">Subir fotos</span>
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
    );
}
