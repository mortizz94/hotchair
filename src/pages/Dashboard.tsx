import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { ThumbsUp, Shield, Map as MapIcon, Flame, Clock, MoreHorizontal, User as UserIcon } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useNotifications } from '../hooks/useNotifications';
import { DashboardData } from '../types';
import { SkeletonCard } from '../components/dashboard/SkeletonCard';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ id: number, text: string, type: 'success' | 'error' | 'info' } | null>(null);

    const { playSuccess } = useSoundEffects();
    const { sendNotification } = useNotifications();

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ id: Date.now(), text, type });
        setTimeout(() => setToast(null), 3000);
    };

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

    const handleCheckIn = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, isPresent: true })
            });
            if (res.ok) {
                showToast('📍 ¡Has fichado correctamente!', 'success');
                playSuccess();
                await fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Derived State
    const isPresent = data?.currentUser?.status === 'present';
    const activeUsers = data?.users.filter(u => u.status === 'present').length || 0;
    const totalUsers = data?.users.length || 0;

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
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 animate-pulse-slow">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Estás en la oficina
                        </div>
                    ) : (
                        <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
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
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 w-fit rounded-xl">
                            <UserIcon size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Aforo</p>
                            <p className="text-3xl font-black text-foreground">{activeUsers}/{totalUsers}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Action Card (Medium) - Span 4 */}
                <div className="md:col-span-4 bento-card relative overflow-hidden group cursor-pointer" onClick={handleCheckIn}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 w-fit rounded-xl">
                                <Clock size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            {isPresent && <ThumbsUp className="text-green-500" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Fichar Entrada</h3>
                            <p className="text-muted-foreground text-sm">Registra tu presencia hoy</p>
                        </div>
                    </div>
                </div>

                {/* 3. Map Preview (Medium) - Span 4 */}
                <div className="md:col-span-4 bento-card relative overflow-hidden group cursor-pointer" onClick={() => navigate('/map')}>
                    {/* Mini Map Visual Placeholder */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 w-fit rounded-xl">
                            <MapIcon size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Mapa de Sitio</h3>
                            <p className="text-muted-foreground text-sm">Ver distribución</p>
                        </div>
                    </div>
                </div>

                {/* 4. Team List (Large) - Span 12 */}
                <div className="md:col-span-12">
                    <h3 className="text-lg font-bold mb-4 px-2">Compañeros ({activeUsers})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

                        {data?.users.map((u) => {
                            // Check status directly
                            const isUserPresent = u.status === 'present';

                            if (!isUserPresent) return null; // Only show present users in this section? 
                            // Or show all with status? let's show all but sorted by presence.
                            // Actually user wanted "Who is here?".

                            return (
                                <div key={u.id} className="bg-card border border-border/50 p-4 rounded-3xl flex items-center gap-4 hover:shadow-md transition-all">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-muted-foreground">{u.name.substring(0, 2)}</span>}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${isUserPresent ? 'bg-green-500' : 'bg-zinc-300'}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm truncate">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{isUserPresent ? 'En la oficina' : 'Ausente'}</p>
                                    </div>
                                </div>
                            )
                        })}
                        {/* Show absent users faded out */}
                        {data?.users.filter(u => u.status !== 'present').map((u) => (
                            <div key={u.id} className="bg-card/50 border border-border/30 p-4 rounded-3xl flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-muted-foreground">{u.name.substring(0, 2)}</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm truncate">{u.name}</p>
                                    <p className="text-xs text-muted-foreground">Ausente</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-slide-up">
                    <div className="bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
                        {toast.type === 'success' && <ThumbsUp size={18} className="text-green-400" />}
                        {toast.text}
                    </div>
                </div>
            )}
        </div>
    );
}
