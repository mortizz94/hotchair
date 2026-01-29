import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Flame, Palmtree, LogOut, Trash2 } from 'lucide-react';
import { DashboardData } from '../types';
import { TimeTrackerWidget } from '../components/dashboard/TimeTrackerWidget';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout: handleLogout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const query = user ? `?userId=${user.id}` : '';
            const [res, resSettings] = await Promise.all([
                fetch(`/api/dashboard${query}`),
                fetch('/api/settings')
            ]);

            if (res.ok) {
                const d = await res.json() as DashboardData;
                setData(d);
            }
            if (resSettings.ok) {
                const settings = await resSettings.json() as any;
                if (settings.mood_threshold) setMoodThreshold(parseInt(settings.mood_threshold));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [user]);

    // Check-in Logic
    const handleCheckIn = async (present: boolean) => {
        if (!user) return;
        setLoading(true);
        try {
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    isPresent: present,
                    location: 'office' // Default to office for now
                })
            });
            await fetchData(); // Refresh data
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Derived State
    const isPresent = data?.currentUser?.status === 'present';
    const activeUsers = data?.users.filter(u => u.status === 'present').length || 0;
    const totalUsers = data?.users.length || 0;
    const occupancyPercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const [moodThreshold, setMoodThreshold] = useState(60);

    // Mood Logic
    const isHappy = occupancyPercentage > moodThreshold;
    // const moodImage = isHappy ? '/assets/happy_kid.png' : '/assets/angry_kid.png';
    // Use uploaded artifacts or placeholders. I will use the new names I'm generating.
    // If generation fails, I'll stick to old ones or use placeholders.
    // Assuming generation works:
    const moodImage = isHappy ? '/assets/happy_kid_military.png' : '/assets/angry_kid_military.png';

    const moodText = isHappy ? '¡La oficina está viviéndosela!' : 'Esto parece un desierto...';
    const moodColor = isHappy ? 'text-green-500' : 'text-orange-500';

    if (loading && !data) return <div className="p-8"><div className="animate-pulse h-96 bg-white/5 rounded-3xl" /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                        Hola, {user?.name.split(' ')[0]} <span className="animate-wave text-4xl">👋</span>
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1 font-medium">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Status Pill */}
                <div className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all duration-500 ${isPresent
                    ? (data?.currentUser?.location === 'office' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20')
                    : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'
                    }`}>
                    <span className={`w-3 h-3 rounded-full ${params(isPresent, data?.currentUser?.location).dotColor}`}></span>
                    {isPresent
                        ? (data?.currentUser?.location === 'office' ? 'Estás en la Oficina' : 'Trabajando en Remoto')
                        : 'No has fichado hoy'}
                </div>
            </div>

            {/* Check-in Action Card - New Integration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleCheckIn(true)}
                    disabled={isPresent}
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
                    onClick={() => handleCheckIn(false)}
                    disabled={!isPresent}
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

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Mood & Vibe (Span 8) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* 1. MOOD CARD (The Big Feature) */}
                    <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 shadow-2xl group min-h-[300px] flex flex-col md:flex-row items-center">
                        <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="flex-1 p-8 md:pl-12 z-10 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                                <Flame size={12} className={moodColor} /> Vibe Check
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                                {occupancyPercentage}% de Aforo
                            </h2>
                            <p className={`text-xl font-medium ${moodColor} mb-6`}>{moodText}</p>

                            <div className="flex items-center justify-center md:justify-start gap-8">
                                <div>
                                    <p className="text-zinc-500 text-xs font-bold uppercase">Presentes</p>
                                    <p className="text-2xl font-black text-white">{activeUsers}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div>
                                    <p className="text-zinc-500 text-xs font-bold uppercase">Total</p>
                                    <p className="text-2xl font-black text-white">{totalUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full md:w-1/2 h-64 md:h-full flex items-center justify-center p-4">
                            <img
                                src={moodImage}
                                alt="Office Mood"
                                className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                        </div>
                    </div>

                    {/* 2. Streak Card */}
                    <div className="bento-card group">
                        <div className="mb-4 p-3 bg-orange-500/10 w-fit rounded-2xl group-hover:bg-orange-500/20 transition-colors">
                            <Flame size={24} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Tu Racha</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-white">{data?.currentUser?.streak || 0}</p>
                                <span className="text-base text-zinc-500 font-medium">días seguidos</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Upcoming Absences */}
                    <div
                        className="bento-card group cursor-pointer relative overflow-hidden"
                        onClick={() => navigate('/time-off')}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 w-fit rounded-2xl">
                                <Palmtree size={24} className="text-purple-400" />
                            </div>
                            {data?.currentUser?.upcomingAbsences && data.currentUser.upcomingAbsences.length > 0 && (
                                <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold">
                                    {data.currentUser.upcomingAbsences.length}
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-3">Ausencias</h3>

                        <div className="space-y-2">
                            {data?.currentUser?.upcomingAbsences && data.currentUser.upcomingAbsences.length > 0 ? (
                                data.currentUser.upcomingAbsences.map((abs) => (
                                    <div key={abs.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                        <span className="text-sm text-zinc-300 font-medium">
                                            {new Date(abs.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className={`w-2 h-2 rounded-full ${abs.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 italic">Nada planeado.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Time Tracker (Span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <TimeTrackerWidget totalMinutesToday={data?.currentUser?.totalMinutesToday} />

                    {/* Quick Profile / Actions */}
                    <div className="bg-card rounded-[2rem] p-6 border border-border/50 shadow-sm relative overflow-hidden">
                        <h3 className="text-lg font-bold mb-4">Perfil</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                                {user?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white">{user?.name}</p>
                                <p className="text-xs text-zinc-500 font-mono tracking-wider">{user?.code}</p>
                            </div>
                        </div>

                        {data?.currentUser?.badges && data.currentUser.badges.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-zinc-500 font-bold uppercase mb-2">Insignias</p>
                                <div className="flex flex-wrap gap-2">
                                    {data.currentUser.badges.map((b, i) => (
                                        <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-zinc-300 border border-white/10">{b}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 mt-auto">
                            <button
                                onClick={handleLogout}
                                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                            >
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                            <button
                                onClick={deleteAccount}
                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-xs"
                            >
                                <Trash2 size={14} /> Eliminar Cuenta
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper for status colors
const params = (present: boolean, loc?: string) => {
    if (!present) return { dotColor: 'bg-zinc-500' };
    return loc === 'office' ? { dotColor: 'bg-green-400 animate-pulse' } : { dotColor: 'bg-blue-400' };
};
