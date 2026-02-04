"use client";

import { useEffect, useState } from 'react';

// Simple IndexedDB wrapper for inspection drafts
const DB_NAME = 'clinkar_offline_v1';
const STORE_NAME = 'drafts';

export const useInspectionDraft = (carId: string) => {
    const [db, setDb] = useState<IDBDatabase | null>(null);

    useEffect(() => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'carId' });
            }
        };
        request.onsuccess = (e: any) => setDb(e.target.result);
    }, []);

    const saveDraft = async (data: any) => {
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ carId, data, updatedAt: Date.now() });
    };

    const getDraft = (): Promise<any> => {
        return new Promise((resolve) => {
            if (!db) return resolve(null);
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(carId);
            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = () => resolve(null);
        });
    };

    const deleteDraft = async () => {
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(carId);
    };

    return { saveDraft, getDraft, deleteDraft };
};
