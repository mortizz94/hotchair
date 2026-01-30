import { Flame, LogOut } from 'lucide-react';

interface CheckInGroupProps {
    isPresent: boolean;
    onCheckIn: (present: boolean) => void;
    isLoading: boolean;
}

export function CheckInGroup({ isPresent, onCheckIn, isLoading }: CheckInGroupProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                onClick={() => onCheckIn(true)}
                disabled={isPresent || isLoading}
                className={`p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${isPresent
                    ? 'bg-zinc-900/50 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20 hover:scale-[1.02] shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                    }`}
            >
                <div className="text-left">
                    <p className={`text-lg font-black uppercase ${isPresent ? 'text-zinc-500' : 'text-green-400'}`}>Entrar</p>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Marcar asistencia</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPresent ? 'bg-zinc-800 text-zinc-600' : 'bg-green-500 text-black'
                    }`}>
                    <Flame size={20} fill="currentColor" />
                </div>
            </button>

            <button
                onClick={() => onCheckIn(false)}
                disabled={!isPresent || isLoading}
                className={`p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${!isPresent
                    ? 'bg-zinc-900/50 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20 hover:scale-[1.02] shadow-[0_0_30px_rgba(249,115,22,0.1)]'
                    }`}
            >
                <div className="text-left">
                    <p className={`text-lg font-black uppercase ${!isPresent ? 'text-zinc-500' : 'text-orange-400'}`}>Salir</p>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Finalizar jornada</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!isPresent ? 'bg-zinc-800 text-zinc-600' : 'bg-orange-500 text-black'
                    }`}>
                    <LogOut size={20} />
                </div>
            </button>
        </div>
    );
}
