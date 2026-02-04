
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shield, UserCog, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { updateUserRole } from "@/app/actions/admin";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // 1. Gatekeeper
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Acceso Restringido</h1>
                <p>Solo los Administradores pueden ver esta sección.</p>
            </div>
        );
    }

    // 2. Fetch Users (In a real app, adding pagination is recommended)
    // We join with profiles to get roles. Note: auth.users is not directly accessible via client SDK normally,
    // so we rely on the public 'profiles' table which should sync with auth.
    const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <UserCog className="h-8 w-8 text-indigo-600" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Torre de Control de Accesos y Roles</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest">Usuario</th>
                                    <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest">Rol Actual</th>
                                    <th className="p-6 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users?.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-slate-900 dark:text-white">{u.email || u.id}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-1">{u.id}</div>
                                        </td>
                                        <td className="p-6">
                                            <BadgeRole role={u.role} />
                                        </td>
                                        <td className="p-6 text-right">
                                            <RoleSwitcher userId={u.id} currentRole={u.role} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function BadgeRole({ role }: { role: string }) {
    const styles = {
        admin: "bg-purple-100 text-purple-700 border-purple-200",
        inspector: "bg-blue-100 text-blue-700 border-blue-200",
        seller: "bg-emerald-100 text-emerald-700 border-emerald-200",
        buyer: "bg-slate-100 text-slate-600 border-slate-200"
    };

    // @ts-ignore
    const classes = styles[role] || styles.buyer;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${classes}`}>
            {role}
        </span>
    );
}

// Client Component for the Action
import { RoleSwitcher } from "./RoleSwitcher";
