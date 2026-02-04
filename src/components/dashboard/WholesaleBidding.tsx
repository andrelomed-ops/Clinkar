"use client";

import { useState, useEffect } from "react";
import { Gavel, Clock, ShieldAlert, TrendingUp, Users, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Bid {
    id: string;
    amount: number;
    bidder: string;
    timestamp: string;
}

interface WholesaleBiddingProps {
    car: any;
    startingPrice: number;
    endTime: string;
}

export function WholesaleBidding({ car, startingPrice, endTime }: WholesaleBiddingProps) {
    const [bids, setBids] = useState<Bid[]>([
        { id: '1', amount: startingPrice + 5000, bidder: 'Autopartes El Rayo', timestamp: 'Hace 2 min' },
        { id: '2', amount: startingPrice + 2000, bidder: 'Refaccionaria del Norte', timestamp: 'Hace 15 min' },
    ]);
    const [myBid, setMyBid] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState("47:12:05");

    const currentPrice = bids.length > 0 ? bids[0].amount : startingPrice;

    const handlePlaceBid = () => {
        const amount = Number(myBid);
        if (amount <= currentPrice) return;

        const newBid: Bid = {
            id: Date.now().toString(),
            amount,
            bidder: "Tu Negocio (Postor)",
            timestamp: "Ahora mismo"
        };
        setBids([newBid, ...bids]);
        setMyBid("");
    };

    return (
        <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl text-white">
            <div className="p-8 border-b border-zinc-800 bg-gradient-to-br from-indigo-900/40 to-black">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                            <Gavel className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Wholesale Bidding</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Subasta Activa PRO</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-indigo-300 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xl font-mono font-black">{timeLeft}</span>
                        </div>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Cierra el: {endTime}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/10">
                    <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Precio Actual</span>
                        <div className="text-4xl font-black text-white flex items-baseline gap-2">
                            ${currentPrice.toLocaleString()}
                            <span className="text-[10px] text-zinc-500 font-mono">MXN</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Ofertas Totales</span>
                        <div className="text-4xl font-black text-indigo-400 flex items-center justify-end gap-2">
                            <Users className="h-6 w-6" />
                            {bids.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-8">
                {/* Bid Action */}
                <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm">Tu Puja Máxima</h4>
                            <span className="text-[10px] font-mono text-zinc-500">Mínimo sugerido: ${(currentPrice + 1500).toLocaleString()}</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-500">$</span>
                            <input
                                type="number"
                                value={myBid}
                                onChange={(e) => setMyBid(e.target.value)}
                                placeholder={(currentPrice + 1500).toString()}
                                className="w-full bg-black/50 border border-white/20 rounded-xl h-14 pl-8 pr-4 font-black text-xl focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <Button
                            onClick={handlePlaceBid}
                            disabled={!myBid || Number(myBid) <= currentPrice}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Confirmar Puja <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <ShieldAlert className="h-4 w-4 text-indigo-400 shrink-0" />
                            <p className="text-[9px] text-indigo-200/70 font-bold leading-tight uppercase">
                                Al pujar, te comprometes legalmente a adquirir el activo en las condiciones descritas (Salvage/As-is).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bid History */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" /> Historial Reciente
                    </h4>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {bids.map((bid, i) => (
                            <div key={bid.id} className={cn(
                                "flex justify-between items-center p-4 rounded-2xl border transition-all",
                                i === 0 ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/5 border-white/5"
                            )}>
                                <div>
                                    <p className={cn("text-xs font-black", i === 0 ? "text-indigo-400" : "text-zinc-300")}>{bid.bidder}</p>
                                    <p className="text-[9px] text-zinc-500 font-bold">{bid.timestamp}</p>
                                </div>
                                <div className="text-right">
                                    <p className={cn("font-black", i === 0 ? "text-white" : "text-zinc-400")}>${bid.amount.toLocaleString()}</p>
                                    {i === 0 && <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Postor Líder</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-8 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Solo Usuarios Verificados Clinkar PRO</span>
                </div>
                <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Contrato Digital Blindado</span>
                </div>
            </div>
        </div>
    );
}
