import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Activity, Trophy, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type HistoryItem = {
    date: string;
    attendees: string[];
};

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/history');
                if (res.ok) {
                    const data = await res.json() as HistoryItem[];
                    setHistory(data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <header className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Calendar className="text-primary" /> Historial
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={20} /> Volver
                </button>
            </header>

            <main className="max-w-4xl mx-auto space-y-6">
                {loading ? (
                    <div className="flex h-64 items-center justify-center animate-pulse text-zinc-500">
                        Cargando historial...
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-card border border-border p-4 rounded-xl">
                                <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Total Días</div>
                                <div className="text-2xl font-black">{history.length}</div>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-xl">
                                <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Promedio Asistencia</div>
                                <div className="text-2xl font-black">{Math.round(history.reduce((acc, curr) => acc + curr.attendees.length, 0) / (history.length || 1))}</div>
                            </div>
                            <div className="bg-checkered border border-border p-4 rounded-xl col-span-2 flex items-center justify-between">
                                <div>
                                    <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Día más concurrido</div>
                                    <div className="text-xl font-black text-orange-500">
                                        {history.reduce((prev, current) => (prev.attendees.length > current.attendees.length) ? prev : current, history[0] || { date: '', attendees: [] }).attendees.length} personas
                                    </div>
                                </div>
                                <Trophy className="text-yellow-500" />
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="bg-card border border-border p-6 rounded-xl">
                            <h3 className="font-bold mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" /> Tendencia de Asistencia (Últimos 30 días)
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[...history].reverse().slice(0, 30).reverse()}>
                                        <defs>
                                            <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                            stroke="#666"
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#f97316' }}
                                            labelFormatter={(l) => new Date(l).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="attendees.length"
                                            name="Asistentes"
                                            stroke="#f97316"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAttendees)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent History List */}
                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <HistoryIcon size={18} className="text-zinc-500" /> Historial Reciente
                            </h3>
                            <div className="space-y-3">
                                {history.map((day) => (
                                    <div key={day.date} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-zinc-800 text-zinc-400 w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-zinc-700">
                                                <span className="text-xs uppercase font-bold">{new Date(day.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-white">{new Date(day.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold capitalize text-lg">
                                                    {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long' })}
                                                </h3>
                                                <p className="text-xs text-zinc-500">
                                                    {day.attendees.length} asistentes
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 justify-end max-w-lg">
                                            {day.attendees.map((name, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/5 text-zinc-300 border border-white/5 rounded text-xs">
                                                    {name}
                                                </span>
                                            ))}
                                            {day.attendees.length === 0 && (
                                                <span className="text-muted-foreground text-sm italic">Nadie vino este día.</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
