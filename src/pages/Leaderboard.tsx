import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Clock, Shield, Medal, Trophy } from 'lucide-react';

type UserStats = {
    id: string;
    name: string;
    avatar: string;
    streak: number;
    avgTime: number; // minutes
    trustScore: number;
    totalAttendance: number;
};

export default function Leaderboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'streak' | 'early' | 'trust'>('streak');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json() as UserStats[];
                    setStats(data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getSortedStats = () => {
        switch (activeTab) {
            case 'streak':
                return [...stats].sort((a, b) => b.streak - a.streak);
            case 'early':
                // Filter out those with 0 attendance/time
                return [...stats]
                    .filter(u => u.avgTime > 0)
                    .sort((a, b) => a.avgTime - b.avgTime);
            case 'trust':
                return [...stats].sort((a, b) => b.trustScore - a.trustScore);
        }
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const sorted = getSortedStats();
    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3);

    return (
        <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground selection:bg-orange-500/30">
            <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-black italic flex items-center gap-3">
                    <Trophy className="text-yellow-500" /> HALL OF FAME
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Volver
                </button>
            </header>

            <main className="max-w-4xl mx-auto">
                {/* Tabs */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('streak')}
                        className={`flex-1 min-w-[120px] py-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all border-2 ${activeTab === 'streak'
                            ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                    >
                        <Flame size={24} className={activeTab === 'streak' ? 'fill-current animate-pulse' : ''} />
                        RACHA
                    </button>
                    <button
                        onClick={() => setActiveTab('early')}
                        className={`flex-1 min-w-[120px] py-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all border-2 ${activeTab === 'early'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                    >
                        <Clock size={24} />
                        MADRUGADORES
                    </button>
                    <button
                        onClick={() => setActiveTab('trust')}
                        className={`flex-1 min-w-[120px] py-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all border-2 ${activeTab === 'trust'
                            ? 'bg-green-500/20 border-green-500 text-green-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                    >
                        <Shield size={24} />
                        CONFIANZA
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-zinc-500 animate-pulse">Calculando estadísticas...</div>
                ) : (
                    <>
                        {/* Podium */}
                        <div className="flex justify-center items-end gap-4 mb-12 min-h-[250px]">
                            {/* 2nd Place */}
                            {top3[1] && (
                                <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-2xl font-black mb-3 text-zinc-400">
                                        {top3[1].name.charAt(0)}
                                    </div>
                                    <div className="w-24 h-32 bg-zinc-800/80 rounded-t-lg flex flex-col items-center justify-start pt-4 border-t-4 border-zinc-500">
                                        <div className="text-3xl font-black text-zinc-500 mb-1">2</div>
                                        <div className="text-xs font-bold text-center px-1 truncate w-full">{top3[1].name}</div>
                                        <div className="mt-2 font-mono font-bold text-white">
                                            {activeTab === 'streak' && `${top3[1].streak} 🔥`}
                                            {activeTab === 'early' && formatTime(top3[1].avgTime)}
                                            {activeTab === 'trust' && `${top3[1].trustScore}%`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <div className="flex flex-col items-center z-10 animate-fade-in">
                                    <Medal className="text-yellow-500 mb-2 animate-bounce-slow" size={32} />
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-black mb-3 text-white shadow-lg shadow-orange-500/20">
                                        {top3[0].name.charAt(0)}
                                    </div>
                                    <div className="w-28 h-40 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-t-lg flex flex-col items-center justify-start pt-4 border-t-4 border-yellow-500 shadow-2xl">
                                        <div className="text-4xl font-black text-yellow-500 mb-1">1</div>
                                        <div className="text-sm font-bold text-center px-1 truncate w-full text-white">{top3[0].name}</div>
                                        <div className="mt-3 font-mono font-black text-xl text-white">
                                            {activeTab === 'streak' && `${top3[0].streak} 🔥`}
                                            {activeTab === 'early' && formatTime(top3[0].avgTime)}
                                            {activeTab === 'trust' && `${top3[0].trustScore}%`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-orange-900 flex items-center justify-center text-2xl font-black mb-3 text-orange-800">
                                        {top3[2].name.charAt(0)}
                                    </div>
                                    <div className="w-24 h-24 bg-zinc-800/60 rounded-t-lg flex flex-col items-center justify-start pt-4 border-t-4 border-orange-800">
                                        <div className="text-3xl font-black text-orange-800 mb-1">3</div>
                                        <div className="text-xs font-bold text-center px-1 truncate w-full">{top3[2].name}</div>
                                        <div className="mt-2 font-mono font-bold text-white">
                                            {activeTab === 'streak' && `${top3[2].streak} 🔥`}
                                            {activeTab === 'early' && formatTime(top3[2].avgTime)}
                                            {activeTab === 'trust' && `${top3[2].trustScore}%`}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="bg-card border border-border rounded-xl p-2">
                            {rest.map((u, i) => (
                                <div key={u.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="text-zinc-500 font-mono font-bold w-6 text-center">{i + 4}</span>
                                        <div className="font-bold">{u.name}</div>
                                    </div>
                                    <div className="font-mono font-bold text-zinc-300">
                                        {activeTab === 'streak' && `${u.streak} 🔥`}
                                        {activeTab === 'early' && formatTime(u.avgTime)}
                                        {activeTab === 'trust' && (
                                            <span className={`${u.trustScore >= 80 ? 'text-green-500' : u.trustScore < 50 ? 'text-red-500' : 'text-yellow-500'}`}>
                                                {u.trustScore}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sorted.length === 0 && (
                                <div className="p-10 text-center text-zinc-500">
                                    Aún no hay datos suficientes.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
