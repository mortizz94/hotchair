import { useNavigate } from 'react-router-dom';
import { Palmtree, LogOut, Trash2, Flame } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useDashboard } from '../hooks/useDashboard';
import { MoodCard } from '../components/dashboard/MoodCard';
import { ACTIVITIES } from '../constants';

export default function Dashboard() {
    const { user, logout: handleLogout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const { dashboardQuery } = useDashboard();

    const { data, isLoading } = dashboardQuery;
    // const { mutate: checkIn } = checkInMutation; // Unused

    // Derived State
    const isPresent = data?.currentUser?.status === 'present';
    const activeUsers = data?.users.filter(u => u.status === 'present').length || 0;
    const totalUsers = data?.users.length || 0;
    const occupancyPercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;


    if (isLoading && !data) return <div className="p-8"><div className="animate-pulse h-96 bg-white/5 rounded-3xl" /></div>;

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
                        ? (
                            <span className="flex items-center gap-2">
                                {data?.currentUser?.activity && ACTIVITIES.find(a => a.id === data.currentUser?.activity)?.label || (data?.currentUser?.location === 'office' ? 'Estás en la Oficina' : 'Trabajando en Remoto')}
                            </span>
                        )
                        : 'No has fichado hoy'}
                </div>
            </div>



            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Mood & Vibe (Span 8) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* 1. MOOD CARD */}
                    <MoodCard
                        occupancyPercentage={occupancyPercentage}
                        activeUsers={activeUsers}
                        totalUsers={totalUsers}
                    />

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
