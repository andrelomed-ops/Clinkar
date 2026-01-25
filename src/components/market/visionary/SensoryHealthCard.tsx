import { Zap, Wind, ShieldCheck, Activity } from 'lucide-react';

interface SensoryData {
    engineSound: {
        healthScore: number;
        spectrogramData: number[];
        analysis: string;
    };
    cabinAtmosphere: {
        smellType: string;
        particulateCount: number;
        humidity: number;
        history: string;
    };
}

export const SensoryHealthCard = ({ data }: { data: SensoryData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Engine Audio Vault */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Activity size={80} />
                </div>

                <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" /> Auditoría Acústica IA
                </h3>

                <div className="flex items-end gap-1 h-16 mb-4 w-full justify-center">
                    {data.engineSound.spectrogramData.map((val, i) => (
                        <div
                            key={i}
                            className="w-2 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-sm animate-pulse"
                            style={{
                                height: `${val}%`,
                                animationDelay: `${i * 0.05}s`
                            }}
                        />
                    ))}
                </div>

                <div className="flex justify-between items-end border-t border-slate-700 pt-4">
                    <div>
                        <div className="text-4xl font-bold text-white">{data.engineSound.healthScore}%</div>
                        <div className="text-xs text-emerald-400">Salud de Motor</div>
                    </div>
                    <div className="text-right max-w-[60%]">
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            &quot;{data.engineSound.analysis}&quot;
                        </p>
                    </div>
                </div>
            </div>

            {/* Cabin Atmosphere Vault */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Wind size={80} />
                </div>

                <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-400" /> Certificación Olfativa
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Aroma Detectado</div>
                        <div className="text-lg font-medium text-white">{data.cabinAtmosphere.smellType}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Partículas (PM2.5)</div>
                        <div className="text-lg font-medium text-emerald-400">{data.cabinAtmosphere.particulateCount} PPM</div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs text-slate-300 font-medium">
                        {data.cabinAtmosphere.history}
                    </span>
                </div>
            </div>
        </div>
    );
};
