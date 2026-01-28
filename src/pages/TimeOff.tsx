import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Calendar, Save, CheckCircle, XCircle, Users, Clock } from 'lucide-react';

interface TimeOffRequest {
    id: number;
    userId: string;
    userName?: string;
    userAvatar?: string;
    startDate: string;
    endDate: string;
    type: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number;
}

export default function TimeOff() {
    const { user } = useAuth();
    const [myRequests, setMyRequests] = useState<TimeOffRequest[]>([]);
    const [managedRequests, setManagedRequests] = useState<TimeOffRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<'mine' | 'team'>('mine');

    // Form
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('vacation');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (user) fetchAllData();
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // 1. Fetch My Requests
            const myRes = await fetch(`/api/time-off?userId=${user?.id}`);
            if (myRes.ok) {
                setMyRequests(await myRes.json());
            }

            // 2. Fetch Team Requests (if I am a manager)
            // If admin, this logic might differ (admins might use query params differently or see all)
            // But let's check for manager role specifically via this endpoint
            const teamRes = await fetch(`/api/time-off?managerId=${user?.id}`);
            if (teamRes.ok) {
                const teamData = await teamRes.json();
                setManagedRequests(teamData);
                // Auto-switch to team view if there are pending requests and I have no pending requests? No, stick to 'mine' default.
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
                fetchAllData(); // Refresh
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
            fetchAllData();
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

    const isManagerOrAdmin = user?.role === 'admin' || managedRequests.length > 0;

    return (
        <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Calendar className="text-orange-400" /> Gestión de Ausencias
                    </h1>
                    <p className="text-zinc-400">Gestiona tus vacaciones y días libres</p>
                </div>

                <div className="flex gap-3">
                    {isManagerOrAdmin && (
                        <div className="flex bg-zinc-800 p-1 rounded-xl items-center">
                            <button
                                onClick={() => setViewMode('mine')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'mine' ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Mis Solicitudes
                            </button>
                            <button
                                onClick={() => setViewMode('team')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'team' ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Equipo
                                {managedRequests.filter(r => r.status === 'pending').length > 0 && (
                                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {managedRequests.filter(r => r.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors"
                    >
                        {isCreating ? 'Cancelar' : 'Solicitar'}
                    </button>
                </div>
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
                ) : (viewMode === 'mine' ? myRequests : managedRequests).length === 0 ? (
                    <div className="text-center text-zinc-500 py-10">
                        {viewMode === 'mine' ? 'No tienes solicitudes registradas.' : 'No hay solicitudes de tu equipo.'}
                    </div>
                ) : (
                    (viewMode === 'mine' ? myRequests : managedRequests).map((req) => (
                        <div key={req.id} className="glass p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors border-l-4 border-l-transparent hover:border-l-orange-500">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    {/* User Info if Team View */}
                                    {viewMode === 'team' && (
                                        <div className="flex items-center gap-2 mr-2 bg-white/5 pr-3 py-1 rounded-full">
                                            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                                {req.userAvatar ? <img src={req.userAvatar} className="w-full h-full object-cover rounded-full" /> : req.userName?.substring(0, 1)}
                                            </div>
                                            <span className="text-sm font-bold text-white">{req.userName}</span>
                                        </div>
                                    )}

                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(req.status)}`}>
                                        {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                    <h4 className="text-white font-bold text-lg">{getTypeLabel(req.type)}</h4>
                                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    </p>
                                    {req.reason && <p className="text-zinc-500 text-sm italic">"{req.reason}"</p>}
                                </div>
                            </div>

                            {/* Actions for Manager/Admin in Team View */}
                            {viewMode === 'team' && req.status === 'pending' && (
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <button
                                        onClick={() => handleStatusUpdate(req.id, 'approved')}
                                        className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors flex items-center gap-2"
                                        title="Aprobar"
                                    >
                                        <CheckCircle size={20} /> <span className="md:hidden">Aprobar</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex items-center gap-2"
                                        title="Rechazar"
                                    >
                                        <XCircle size={20} /> <span className="md:hidden">Rechazar</span>
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
