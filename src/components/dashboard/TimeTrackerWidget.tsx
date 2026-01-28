import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface TimeTrackerWidgetProps {
    totalMinutesToday?: number;
}

export function TimeTrackerWidget({ totalMinutesToday = 0 }: TimeTrackerWidgetProps) {
    const { user } = useAuth();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const { playSuccess } = useSoundEffects();

    useEffect(() => {
        if (user) checkActiveEntry();
    }, [user]);

    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const checkActiveEntry = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/time-entries?userId=${user?.id}&date=${today}`);
            if (res.ok) {
                const data = await res.json() as any[];
                const active = data.find((e: any) => !e.endTime);
                if (active) {
                    setActiveEntryId(active.id);
                    setIsActive(true);
                    const start = active.startTime;
                    const now = Date.now();
                    setElapsedTime(Math.floor((now - start) / 1000));
                } else {
                    setIsActive(false);
                    setElapsedTime(0);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        if (!user) return;

        try {
            if (!isActive) {
                // Clock In
                const res = await fetch('/api/time-entries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        description: 'Trabajo General'
                    })
                });

                if (res.ok) {
                    const newEntry = await res.json() as any;
                    setActiveEntryId(newEntry.id);
                    setIsActive(true);
                    setElapsedTime(0);
                    playSuccess();
                }
            } else {
                // Clock Out
                if (!activeEntryId) return;
                const now = Date.now();
                const res = await fetch('/api/time-entries', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: activeEntryId,
                        endTime: now
                    })
                });

                if (res.ok) {
                    setIsActive(false);
                    setActiveEntryId(null);
                    setElapsedTime(0);
                    playSuccess();
                }
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

    // Calculate display total: totalMinutesToday (from API) is effectively a snapshot.
    // Ideally we should sum separate completed sessions + current session.
    // The API totalMinutesToday includes the CURRENT session up to fetch time.
    // This might result in a "jump" or be slightly out of sync with the live timer.
    // For simplicity, let's just display what the API gave us as "Previous" and maybe add live time to it?
    // Actually simplicity: Just show "Total Hoy: Xh Ym" based on API prop.

    const formatTotal = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded-2xl" />;

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play size={40} />
            </div>

            <div className="flex justify-between items-start">
                <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Registro Horario</h3>
                {totalMinutesToday > 0 && (
                    <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-mono text-zinc-400">
                        Total 24h: <span className="text-white font-bold">{formatTotal(totalMinutesToday)}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className={`text-3xl font-mono font-bold tracking-tighter ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {formatTime(elapsedTime)}
                </div>

                <button
                    onClick={handleToggle}
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isActive
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                        }`}
                >
                    {isActive ? <Square size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-zinc-500">
                    {isActive ? 'Turno en curso' : 'Detenido'}
                </span>
            </div>
        </div>
    );
}
