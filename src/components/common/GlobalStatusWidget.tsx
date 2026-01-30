import { useState, useEffect } from 'react';
import { Play, Square, Coffee, Phone, Briefcase, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useSoundEffects } from '../../hooks/useSoundEffects';

const ACTIVITIES = [
    { id: 'work', label: 'Trabajo', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'focus', label: 'Focus', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'meeting', label: 'Reunión', icon: Phone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'lunch', label: 'Comida', icon: Coffee, color: 'text-green-500', bg: 'bg-green-500/10' },
];

export function GlobalStatusWidget() {
    const { user } = useAuth();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
    const [activityType, setActivityType] = useState('work');
    const [isExpanded, setIsExpanded] = useState(false);
    const { playSuccess } = useSoundEffects();

    // Poll for active entry
    useEffect(() => {
        if (!user) return;
        const checkActive = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await fetch(`/api/time-entries?userId=${user.id}&date=${today}`);
                if (res.ok) {
                    const data = await res.json() as any[];
                    // Ensure data is array
                    if (Array.isArray(data)) {
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
                }
            } catch (e) {
                // Silent error
            }
        };

        checkActive();
        const poller = setInterval(checkActive, 30000); // Poll every 30s
        return () => clearInterval(poller);
    }, [user]);

    // Timer tick
    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(() => setElapsedTime(p => p + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleToggle = async () => {
        if (!user) return;
        try {
            if (!isActive) {
                await startEntry(activityType);
            } else {
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
            body: JSON.stringify({ userId: user.id, type, description: 'Started via Global Widget' })
        });
        if (res.ok) {
            const data = await res.json() as any;
            setActiveEntryId(data.id);
            setIsActive(true);
            setActivityType(type);
            setElapsedTime(0);
            playSuccess();
        }
    };

    const stopEntry = async () => {
        if (!activeEntryId) return;
        const res = await fetch('/api/time-entries', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: activeEntryId, endTime: Date.now() })
        });
        if (res.ok) {
            setIsActive(false);
            setActiveEntryId(null);
            setElapsedTime(0);
            playSuccess();
        }
    };

    const switchActivity = async (type: string) => {
        setActivityType(type);
        if (isActive) {
            await stopEntry();
            // Small delay or chained promise to ensure sequence if needed, but awaits should be checking completion.
            // However, stopEntry clears state. We need to manually start next one.
            // Re-implement start logic here to avoid state flicker race conditions
            if (!user) return;
            const res = await fetch('/api/time-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user!.id, type, description: 'Switched via Global Widget' })
            });
            if (res.ok) {
                const data = await res.json() as any;
                setActiveEntryId(data.id);
                setIsActive(true);
                // setActivityType(type) is already called
                setElapsedTime(0);
                playSuccess();
            }
        }
        setIsExpanded(false);
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentActivity = ACTIVITIES.find(a => a.id === activityType) || ACTIVITIES[0];

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 isolate">
            {/* Expanded Menu */}
            {isExpanded && (
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-xl animate-slide-up mb-2 flex flex-col gap-1 w-48">
                    <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase">Cambiar estado</div>
                    {ACTIVITIES.map(a => (
                        <button
                            key={a.id}
                            onClick={() => switchActivity(a.id)}
                            className={`flex items-center gap-3 p-2 rounded-xl text-sm font-medium transition-colors ${activityType === a.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <a.icon size={16} className={a.color} />
                            {a.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Bar */}
            <div className={`flex items-center gap-4 p-2 pl-5 rounded-full border shadow-2xl transition-all duration-300 ${isActive ? 'bg-zinc-900/90 border-orange-500/30' : 'bg-zinc-900/90 border-white/10'}`}>
                {/* Info Area */}
                <div className="flex flex-col cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2">
                        <currentActivity.icon size={14} className={currentActivity.color} />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{isActive ? currentActivity.label : 'Inactivo'}</span>
                        {isExpanded ? <ChevronDown size={12} className="text-zinc-500" /> : <ChevronUp size={12} className="text-zinc-500" />}
                    </div>
                    <div className={`text-base font-mono font-bold leading-none mt-0.5 ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                        {formatTime(elapsedTime)}
                    </div>
                </div>

                {/* FAB */}
                <button
                    onClick={handleToggle}
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 ${isActive
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                        : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                        }`}
                >
                    {isActive ? <Square size={18} fill="currentColor" className="text-white" /> : <Play size={20} fill="currentColor" className="ml-1 text-white" />}
                </button>
            </div>
        </div>
    );
}
