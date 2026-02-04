
"use client";

import { updateUserRole } from "@/app/actions/admin";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function RoleSwitcher({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as any;
        if (!confirm(`¿Seguro que quieres cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) {
            e.target.value = currentRole; // Reset
            return;
        }

        setLoading(true);
        try {
            await updateUserRole(userId, newRole);
            alert("Rol actualizado correctamente");
        } catch (error) {
            console.error(error);
            alert("Error al actualizar rol");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
            <select
                disabled={loading}
                defaultValue={currentRole}
                onChange={handleChange}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
                <option value="inspector">Inspector</option>
                <option value="admin">Administrador 👑</option>
            </select>
        </div>
    );
}
