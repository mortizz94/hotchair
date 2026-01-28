import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Calendar, Save, CheckCircle, XCircle } from 'lucide-react';

interface TimeOffRequest {
    id: number;
    userId: string;
    userName?: string;
    startDate: string;
    endDate: string;
    type: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number;
}

export default function TimeOff() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<TimeOffRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('vacation');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (user) fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const query = user?.role === 'admin' ? '' : `?userId=${user?.id}`;
            const res = await fetch(`/api/time-off${query}`);
            if (res.ok) {
                const data = await res.json() as TimeOffRequest[];
                setRequests(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const res = await fetch('/api/time-off', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    startDate,
                    endDate,
                    type,
                    reason
                })
            });

            if (res.ok) {
                setIsCreating(false);
                setStartDate('');
                setEndDate('');
                setType('vacation');
                setReason('');
                fetchRequests();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        try {
            await fetch('/api/time-off', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            fetchRequests();
        } catch (e) {
            console.error(e);
        }
    };

    const getTypeLabel = (t: string) => {
        switch (t) {
            case 'vacation': return 'Vacaciones';
            case 'sick': return 'Baja Médica';
            case 'personal': return 'Asuntos Propios';
            default: return t;
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen animate-fade-in">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Calendar className="text-orange-400" /> Mis Ausencias
                    </h1>
                    <p className="text-zinc-400">Gestiona tus vacaciones y días libres</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors"
                >
                    {isCreating ? 'Cancelar' : 'Solicitar Ausencia'}
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl mb-8 border border-orange-500/30 animate-scale-in">
                    <h3 className="text-lg font-bold text-white mb-4">Nueva Solicitud</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Desde</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Hasta</label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                            >
                                <option value="vacation">Vacaciones</option>
                                <option value="sick">Baja Médica</option>
                                <option value="personal">Asuntos Propios</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Motivo (Opcional)</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                                placeholder="Ej. Viaje familiar"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all"
                    >
                        <Save size={18} /> Enviar Solicitud
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-white">Cargando solicitudes...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center text-zinc-500 py-10">No tienes solicitudes registradas.</div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="glass p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors border-l-4 border-l-transparent hover:border-l-orange-500">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(req.status)}`}>
                                        {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                    </span>
                                    <h4 className="text-white font-bold text-lg">{getTypeLabel(req.type)}</h4>
                                </div>
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    {req.reason && <span className="text-zinc-500 italic"> • "{req.reason}"</span>}
                                </p>
                                {user?.role === 'admin' && req.userName && (
                                    <p className="text-xs text-blue-400 mt-1">Solicitado por: {req.userName}</p>
                                )}
                            </div>

                            {user?.role === 'admin' && req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(req.id, 'approved')}
                                        className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                                        title="Aprobar"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                                        title="Rechazar"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
