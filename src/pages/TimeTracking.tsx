import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Play, Square, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

type TimeEntry = {
    id: number;
    userId: string;
    date: string;
    startTime: number;
    endTime?: number;
    description?: string;
    projectId?: string;
};

export default function TimeTracking() {
    const { user, logout } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds
    const { playSuccess } = useSoundEffects();

    useEffect(() => {
        if (user) {
            fetchEntries();
        }
    }, [user]);

    // Timer effect
    useEffect(() => {
        let interval: any;
        if (activeEntry) {
            // Calculate initial elapsed time
            const start = activeEntry.startTime;
            const now = Date.now();
            setElapsedTime(Math.floor((now - start) / 1000));

            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeEntry]);

    const fetchEntries = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/time-entries?userId=${user?.id}&date=${today}`); // Filter by today initially
            if (res.ok) {
                const data = (await res.json()) as TimeEntry[];
                setEntries(data);

                // Check if there is an active entry (endTime is null/undefined)
                // Note: The API should sort descending, so active entry likely first if exists
                const active = data.find((e: TimeEntry) => !e.endTime);
                setActiveEntry(active || null);
            }
        } catch (e) {
            console.error("Error fetching time entries", e);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/time-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    description: 'Trabajo General' // Could add input for this later
                })
            });

            if (res.ok) {
                const newEntry = (await res.json()) as TimeEntry;
                setActiveEntry(newEntry);
                setEntries([newEntry, ...entries]);
                playSuccess();
            } else {
                const err = (await res.json()) as { error: string };
                alert(err.error || 'Error al iniciar');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleClockOut = async () => {
        if (!activeEntry) return;
        try {
            const now = Date.now();
            const res = await fetch('/api/time-entries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: activeEntry.id,
                    endTime: now
                })
            });

            if (res.ok) {
                const updatedEntry = (await res.json()) as TimeEntry;
                setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
                setActiveEntry(null);
                playSuccess();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatTimeFromTimestamp = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (start: number, end?: number) => {
        const e = end || Date.now();
        const diff = Math.floor((e - start) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        return `${h}h ${m}m`;
    };

    // Calculate total for today
    const totalTodaySeconds = entries.reduce((acc, curr) => {
        const end = curr.endTime || Date.now();
        return acc + Math.floor((end - curr.startTime) / 1000);
    }, 0);
    const totalTodayFormatted = `${Math.floor(totalTodaySeconds / 3600)}h ${Math.floor((totalTodaySeconds % 3600) / 60)}m`;


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-purple-500/30">
            <Sidebar
                user={user}
                dashboardData={null} // Sidebar uses this for gamification, might need mock or fetch
                logout={logout}
                onOpenRoulette={() => { }}
                onOpenProfile={() => { }}
            />

            <main className="flex-1 p-6 md:p-10 relative overflow-hidden flex flex-col items-center">
                {/* Background Ambient Light */}
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                <div className="w-full max-w-4xl relative z-10 animate-fade-in">
                    <header className="mb-10">
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                            <Clock className="text-purple-400" size={36} /> Registro Horario
                        </h2>
                        <p className="text-zinc-400 font-medium">Controla tu tiempo de trabajo diario</p>
                    </header>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Timer Card */}
                            <div className="glass-card rounded-3xl p-8 mb-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-50" />

                                <div className="text-[6rem] font-black tabular-nums tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 mb-6 drop-shadow-2xl font-mono">
                                    {formatTime(elapsedTime)}
                                </div>

                                <div className="flex gap-6">
                                    {!activeEntry ? (
                                        <button
                                            onClick={handleClockIn}
                                            className="group relative px-8 py-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-2xl font-bold text-xl transition-all border border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-green-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <Play size={24} className="fill-current" />
                                            ENTRAR
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleClockOut}
                                            className="group relative px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold text-xl transition-all border border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <Square size={24} className="fill-current" />
                                            SALIR
                                        </button>
                                    )}
                                </div>

                                <div className="mt-8 text-zinc-500 font-medium flex items-center gap-2">
                                    {activeEntry ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Turno activo desde {formatTimeFromTimestamp(activeEntry.startTime)}
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                            Esperando inicio de jornada
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Today's Stats & Log */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Summary Card */}
                                <div className="glass p-6 rounded-2xl border border-white/5 md:col-span-1">
                                    <h3 className="text-zinc-400 font-medium mb-4 flex items-center gap-2">
                                        <CalendarIcon size={18} /> Resumen Diario
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-3xl font-bold text-white">{totalTodayFormatted}</div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Total Trabajado</div>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={18} className="text-yellow-500/50 mt-1" />
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                Recuerda registrar tus descansos pausando el contador.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Entries Log */}
                                <div className="glass p-6 rounded-2xl border border-white/5 md:col-span-2">
                                    <h3 className="text-zinc-400 font-medium mb-4">Actividad Reciente</h3>
                                    <div className="space-y-3">
                                        {entries.length === 0 ? (
                                            <div className="text-center py-10 text-zinc-600 italic">No hay registros hoy</div>
                                        ) : (
                                            entries.map(entry => (
                                                <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-2 h-10 rounded-full ${entry.endTime ? 'bg-purple-500/30' : 'bg-green-500'}`} />
                                                        <div>
                                                            <div className="font-bold text-white text-lg">{formatTimeFromTimestamp(entry.startTime)}</div>
                                                            <div className="text-xs text-zinc-500 font-mono">INICIO</div>
                                                        </div>
                                                        {entry.endTime && (
                                                            <>
                                                                <div className="w-8 h-px bg-white/10" />
                                                                <div>
                                                                    <div className="font-bold text-zinc-300 text-lg">{formatTimeFromTimestamp(entry.endTime)}</div>
                                                                    <div className="text-xs text-zinc-500 font-mono">FIN</div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-white text-lg font-mono">
                                                            {calculateDuration(entry.startTime, entry.endTime)}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">{entry.description || 'General'}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
