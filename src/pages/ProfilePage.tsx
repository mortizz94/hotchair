import { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from '../components/AuthProvider';
import { Trophy, Star, TrendingUp, Award, Zap, Camera, Lock, CheckCircle, Clock, Calendar, ArrowUpRight, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProfileData {
    user: User & { avatar?: string };
    gamification: {
        streak: number;
        level: number;
        xp: number;
        nextLevelXp: number;
        badges: string[];
    };
    stats?: any; // Added stats to interface
}

const BADGES_CONFIG = [
    { id: '🔥 On Fire', name: 'On Fire', desc: 'Racha de 3 días', icon: FlameIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: '⚡ Imparable', name: 'Imparable', desc: 'Racha de 10 días', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: '🌞 Madrugador', name: 'Madrugador', desc: '5 días antes de las 9:00', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: '👮 Vigilante', name: 'Vigilante', desc: '10 votos emitidos', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: '🕵️ Sherlock', name: 'Sherlock', desc: '100 votos', icon: Camera, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

function FlameIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a5.4 5.4 0 0 0 3 3.5z" />
        </svg>
    )
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [data, setData] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'gamification' | 'stats'>('gamification');

    useEffect(() => {
        if (!user) return;
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch Profile & Gamification
                const profileRes = await fetch(`/api/profile?userId=${user?.id}`);
                const profileData = await profileRes.json() as ProfileData;

                // Fetch Stats
                const statsRes = await fetch(`/api/stats/me?userId=${user?.id}`);
                const statsData = await statsRes.json();

                setData(profileData);
                setStats(statsData);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    if (loading) return <div className="p-10 text-center animate-pulse">Cargando perfil...</div>;
    if (!data) return <div className="p-10 text-center text-red-400">Error al cargar perfil</div>;

    const { gamification } = data;
    const progressPercent = Math.min(100, (gamification.xp / gamification.nextLevelXp) * 100);

    // Stats Chart Data
    const chartData = [
        { name: 'L', hours: 6.5 },
        { name: 'M', hours: 7.2 },
        { name: 'X', hours: 8.0 },
        { name: 'J', hours: 5.5 },
        { name: 'V', hours: 4.0 },
        { name: 'S', hours: 0 },
        { name: 'D', hours: 0 },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header: User Info & Level */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 p-8 md:p-12">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Trophy size={180} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-400 to-red-600 p-1 shadow-2xl shadow-orange-500/20">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                <img src={user?.avatar || '/avatar.png'} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 shadow-lg">
                            LVL {gamification.level}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">{user?.name}</h1>
                            <p className="text-zinc-400 font-medium flex items-center justify-center md:justify-start gap-2">
                                <TrendingUp size={16} className="text-green-400" />
                                {gamification.streak} días de racha
                            </p>
                        </div>

                        {/* XP Bar */}
                        <div className="space-y-2 max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                <span>XP {gamification.xp}</span>
                                <span>Next: {gamification.nextLevelXp}</span>
                            </div>
                            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center md:justify-start border-b border-white/10">
                <button
                    onClick={() => setActiveTab('gamification')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'gamification'
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-zinc-400 hover:text-white'
                        }`}
                >
                    Logros y Medallas
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stats'
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-zinc-400 hover:text-white'
                        }`}
                >
                    Estadísticas
                </button>
            </div>

            {/* Content */}
            {activeTab === 'gamification' && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="text-purple-500" />
                        Medallas
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {BADGES_CONFIG.map((badge) => {
                            const isUnlocked = gamification.badges.includes(badge.id);

                            return (
                                <div
                                    key={badge.id}
                                    className={`relative p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center gap-3 ${isUnlocked
                                        ? 'bg-gradient-to-b from-white/5 to-transparent border-white/10 hover:border-white/20'
                                        : 'bg-black/20 border-white/5 opacity-50 grayscale'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-1 ${isUnlocked ? badge.bg : 'bg-white/5'}`}>
                                        <badge.icon className={isUnlocked ? badge.color : 'text-zinc-600'} size={28} />
                                    </div>

                                    <div>
                                        <h3 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                                            {badge.name}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                                            {badge.desc}
                                        </p>
                                    </div>

                                    {!isUnlocked && (
                                        <div className="absolute top-2 right-2 text-zinc-600">
                                            <Lock size={12} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'stats' && stats && (
                <div className="space-y-8 animate-fade-in">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Clock size={100} />
                            </div>
                            <p className="text-muted-foreground font-medium mb-1">Horas últimos 7 días</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{stats.totalHoursLast7Days}h</h3>
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                <ArrowUpRight size={16} />
                                <span>+12% vs semana anterior</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Calendar size={100} />
                            </div>
                            <p className="text-muted-foreground font-medium mb-1">Tasa de Asistencia</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{stats.attendanceRate}%</h3>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                                <span>Últimos 30 días</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <TrendingUp size={100} />
                            </div>
                            <p className="text-muted-foreground font-medium mb-1">Racha Actual</p>
                            <h3 className="text-4xl font-bold text-white mb-2">{gamification.streak} días</h3>
                            <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                                <Flame size={16} />
                                <span>¡On fire!</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Clock className="text-zinc-400" size={20} />
                                Horas Diarias (Esta semana)
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.hours >= 8 ? '#f97316' : '#52525b'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl border border-white/5">
                            <h3 className="text-lg font-bold mb-6">Historial Reciente</h3>
                            <div className="space-y-4">
                                {stats.attendanceHistory?.slice(0, 5).map((record: any) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${record.isPresent ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-sm font-medium">{record.date}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${record.isPresent ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {record.isPresent ? 'Presente' : 'Ausente'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-xs text-zinc-500 hover:text-white transition-colors">
                                Ver todo el historial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
