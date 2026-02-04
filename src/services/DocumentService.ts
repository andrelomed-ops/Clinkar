import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { BaseService } from './BaseService';
import { z } from 'zod';

const DocumentSchema = z.object({
    id: z.string(),
    transaction_id: z.string(),
    uploader_id: z.string(),
    name: z.string(),
    file_url: z.string(),
    created_at: z.string().nullable(),
});

export type Document = z.infer<typeof DocumentSchema>;

export class DocumentService extends BaseService {
    private static BUCKET_NAME = 'transaction-docs';

    /**
     * Uploads a file to Supabase Storage and records it in the documents table.
     */
    static async uploadDocument(
        supabase: SupabaseClient<Database>,
        transactionId: string,
        file: File,
        fileName: string
    ) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Debes estar autenticado para subir documentos.");

        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const path = `${transactionId}/${Date.now()}_${fileName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(path, file);

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw uploadError;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(path);

        // 3. Record in Database
        const { data, error: dbError } = await supabase
            .from('documents')
            .insert({
                transaction_id: transactionId,
                uploader_id: user.id,
                name: fileName,
                file_url: publicUrl
            } as any)
            .select()
            .single();

        if (dbError) {
            console.error("Database record error:", dbError);
            throw dbError;
        }

        return data;
    }

    /**
     * Fetches all documents for a specific transaction.
     */
    static async getTransactionDocuments(supabase: SupabaseClient<Database>, transactionId: string) {
        const query = supabase
            .from('documents')
            .select('*')
            .eq('transaction_id', transactionId);

        return this.validateAndHandle(query as any, z.array(DocumentSchema));
    }
}
