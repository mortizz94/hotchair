import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Flame, User as UserIcon, Palmtree } from 'lucide-react';
import { DashboardData } from '../types';
import { TimeTrackerWidget } from '../components/dashboard/TimeTrackerWidget';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);


    const fetchData = async () => {
        try {
            const query = user ? `?userId=${user.id}` : '';
            const res = await fetch(`/api/dashboard${query}`);
            if (res.ok) {
                const d = await res.json() as DashboardData;
                setData(d);
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


    // Derived State
    const isPresent = data?.currentUser?.status === 'present';
    const activeUsers = data?.users.filter(u => u.status === 'present').length || 0;
    const totalUsers = data?.users.length || 0;

    if (loading && !data) return <div className="p-8"><div className="animate-pulse h-96 bg-white/5 rounded-3xl" /></div>;

    return (
        <div className="space-y-6">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Hola, {user?.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-muted-foreground">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isPresent ? (
                        <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 animate-pulse-slow ${data?.currentUser?.location === 'office' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            <span className={`w-2 h-2 rounded-full ${data?.currentUser?.location === 'office' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                            {data?.currentUser?.location === 'office' ? 'Estás en la oficina' : 'Teletrabajando'}
                        </div>
                    ) : (
                        <div className="bg-zinc-100 text-zinc-500 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                            No has fichado
                        </div>
                    )}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Quick Stats (Small) - Span 4 */}
                <div className="md:col-span-4 grid grid-cols-2 gap-4">
                    <div className="bento-card bg-primary text-primary-foreground flex flex-col justify-between !border-none">
                        <div className="p-2 bg-white/20 w-fit rounded-xl">
                            <Flame size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">Racha</p>
                            <p className="text-3xl font-black">{data?.currentUser?.streak || 0}</p>
                        </div>
                    </div>
                    <div className="bento-card flex flex-col justify-between">
                        <div className="p-2 bg-blue-100 w-fit rounded-xl">
                            <UserIcon size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Aforo</p>
                            <p className="text-3xl font-black text-foreground">{activeUsers}/{totalUsers}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Time Tracker (Medium) - Span 4 */}
                <div className="md:col-span-4">
                    <TimeTrackerWidget totalMinutesToday={data?.currentUser?.totalMinutesToday} />
                </div>

                {/* 3. Upcoming Absences (Span 4) */}
                <div className="md:col-span-4 bento-card relative overflow-hidden group cursor-pointer flex flex-col justify-between" onClick={() => navigate('/time-off')}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="mb-2">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-purple-100 w-fit rounded-xl">
                                <Palmtree size={20} className="text-purple-600" />
                            </div>
                            {data?.currentUser?.upcomingAbsences && data.currentUser.upcomingAbsences.length > 0 && (
                                <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-full text-zinc-400">
                                    {data.currentUser.upcomingAbsences.length} Próximas
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold">Mis Ausencias</h3>
                    </div>

                    <div className="space-y-2">
                        {data?.currentUser?.upcomingAbsences && data.currentUser.upcomingAbsences.length > 0 ? (
                            data.currentUser.upcomingAbsences.map((abs) => (
                                <div key={abs.id} className="text-xs bg-white/5 p-2 rounded-lg flex justify-between items-center">
                                    <span className="font-medium text-zinc-300">
                                        {new Date(abs.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${abs.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {abs.status === 'approved' ? 'OK' : 'Pend'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground">No tienes ausencias próximas.</p>
                        )}
                        <p className="text-[10px] text-zinc-500 font-medium pt-1 group-hover:text-purple-400 transition-colors">
                            Solicitar nueva &rarr;
                        </p>
                    </div>
                </div>


            </div>
        </div>
    );
}
