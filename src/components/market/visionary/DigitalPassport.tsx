import { Link, CheckCircle, Database } from 'lucide-react';

interface PassportEvent {
    date: string;
    type: string;
    verifiedBy: string;
    icon?: string;
}

interface PassportData {
    blockchainHash: string;
    events: PassportEvent[];
}

export const DigitalPassport = ({ data }: { data: PassportData }) => {
    return (
        <div className="bg-slate-950 border border-indigo-900/40 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-indigo-200 font-semibold flex items-center gap-2">
                    <Database size={18} className="text-indigo-500" />
                    Pasaporte Digital (Blockchain)
                </h3>
                <div className="text-xs font-mono text-indigo-400/60 bg-indigo-950/50 px-2 py-1 rounded truncate max-w-[150px] md:max-w-[300px]">
                    Hash: {data.blockchainHash}
                </div>
            </div>

            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-indigo-900/50">
                {data.events.map((event, i) => (
                    <div key={i} className="flex gap-4 relative">
                        <div className="relative z-10 w-10 h-10 rounded-full bg-slate-900 border border-indigo-700 flex items-center justify-center shrink-0">
                            <CheckCircle size={16} className="text-indigo-400" />
                        </div>
                        <div className="flex-1 pt-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-slate-200">{event.type}</span>
                                <span className="text-sm text-slate-500 font-mono">{event.date}</span>
                            </div>
                            <div className="text-sm text-indigo-300/60 flex items-center gap-1">
                                <Link size={12} />
                                Verificado por: {event.verifiedBy}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-900/30 text-center">
                <p className="text-xs text-slate-500">
                    Este historial es inmutable y está criptográficamente firmado por la red Clinkar.
                </p>
            </div>
        </div>
    );
};
