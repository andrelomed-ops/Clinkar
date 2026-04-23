"use client";
import { Navbar } from "@/components/ui/navbar";

export default function SimpleStats() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
            <Navbar variant="market" />
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">Stats Route Active</h1>
            <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest">Si ves esto, la ruta funciona. Procediendo a restaurar el diseño.</p>
        </div>
    );
}
