import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { ACTIVITIES } from '../../constants';

interface TimeTrackerWidgetProps {
    totalMinutesToday?: number;
    onTimerStart?: () => void;
    onTimerStop?: () => void;
}

export function TimeTrackerWidget({ totalMinutesToday = 0, onTimerStart, onTimerStop }: TimeTrackerWidgetProps) {
    const { user } = useAuth();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
    const [activityType, setActivityType] = useState('work');
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
                    setActivityType(active.type || 'work');
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
                await startEntry(activityType);
            } else {
                // Clock Out
                await stopEntry();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const startEntry = async (type: string) => {
        if (!user) return;
        const res = await fetch('/api/time-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                description: 'Trabajo General', // We can make this dynamic later
                type
            })
        });

        if (res.ok) {
            const newEntry = await res.json() as any;
            setActiveEntryId(newEntry.id);
            setIsActive(true);
            setActivityType(type);
            setElapsedTime(0);
            playSuccess();
            if (onTimerStart) onTimerStart();
        }
    };

    const stopEntry = async () => {
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
            if (onTimerStop) onTimerStop();
        }
    };

    const handleSwitchActivity = async (newType: string) => {
        if (newType === activityType && isActive) return; // No change

        if (isActive) {
            // Stop current, start new
            // IMPORTANT: We do NOT want to trigger onTimerStop/Start here because that might toggle "Attendance".
            // However, the user is technically still "Present".
            // So we skip the callbacks for a seamless switch?
            // Actually, if we stop, onTimerStop sets "Absent". That's bad if we immediately start.
            // But we can't easily prevent the callback side effects if they are tailored for "Stop = Absent".
            // HACK: We'll just run the API calls directly here without the callbacks, OR update the callbacks to handle this?
            // "onTimerStop" essentially means "User Left". Switching activity means "User Changed Task".
            // So we should NOT call onTimerStop/Start.

            await stopEntryInternal();
            await startEntryInternal(newType);
        } else {
            setActivityType(newType);
        }
    };

    // Internal versions without callbacks for switching
    const stopEntryInternal = async () => {
        if (!activeEntryId) return;
        const now = Date.now();
        await fetch('/api/time-entries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: activeEntryId, endTime: now })
        });
        setIsActive(false);
        setActiveEntryId(null);
    };

    const startEntryInternal = async (type: string) => {
        if (!user) return;
        const res = await fetch('/api/time-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, description: 'Switched', type })
        });
        if (res.ok) {
            const newEntry = await res.json() as any;
            setActiveEntryId(newEntry.id);
            setIsActive(true);
            setActivityType(type);
            setElapsedTime(0);
            playSuccess();
            // No callback, assuming presence is already maintained or updated via polling
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

    const currentActivity = ACTIVITIES.find(a => a.id === activityType) || ACTIVITIES[0];

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group h-full flex flex-col justify-between">
            <div className={`absolute top-0 right-0 p-4 opacity-10 transition-colors ${isActive ? currentActivity.color : 'text-zinc-500'}`}>
                <currentActivity.icon size={40} />
            </div>

            <div className="flex justify-between items-start z-10">
                <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Registro Horario</h3>
                {totalMinutesToday > 0 && (
                    <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-mono text-zinc-400">
                        Total: <span className="text-white font-bold">{formatTotal(totalMinutesToday)}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col">
                    <div className={`text-3xl font-mono font-bold tracking-tighter mb-1 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                        {formatTime(elapsedTime)}
                    </div>
                    {isActive && (
                        <div className={`text-xs font-bold uppercase tracking-wider ${currentActivity.color}`}>
                            {currentActivity.label}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleToggle}
                    className={`h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                        }`}
                >
                    {isActive ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
            </div>

            {/* Activity Selector */}
            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-5 gap-2">
                {ACTIVITIES.map((activity) => (
                    <button
                        key={activity.id}
                        onClick={() => handleSwitchActivity(activity.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activityType === activity.id
                            ? `${activity.bg} ${activity.color} ring-1 ring-inset ring-white/10`
                            : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                            }`}
                        title={activity.label}
                    >
                        <activity.icon size={18} />
                        <span className="text-[9px] font-medium hidden md:block">{activity.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
