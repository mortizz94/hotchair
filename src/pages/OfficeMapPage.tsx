import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { OfficeMap } from '../components/dashboard/OfficeMap';
import { Seat, DashboardData } from '../types';
import { Map as MapIcon, Plus } from 'lucide-react';

export default function OfficeMapPage() {
    const { user } = useAuth();
    const [seats, setSeats] = useState<Seat[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Map<number, any>>(new Map());
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [seatsRes, dashboardRes] = await Promise.all([
                fetch('/api/seats'),
                fetch('/api/dashboard') // Reuse dashboard to get attendance
            ]);

            if (seatsRes.ok) {
                const s = await seatsRes.json() as Seat[];
                setSeats(s);
            }

            if (dashboardRes.ok) {
                const d = await dashboardRes.json() as DashboardData;
                // Map active attendance to seat IDs
                const am = new Map();
                d.attendance.forEach(a => {
                    if (a.isPresent && a.seatId) {
                        // Find user
                        const u = d.users.find(usr => usr.id === a.userId);
                        am.set(a.seatId, { ...a, user: u });
                    }
                });
                setAttendanceMap(am);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSeat = async () => {
        const name = prompt('Nombre del sitio (ej. A1):');
        if (!name) return;

        try {
            const res = await fetch('/api/seats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, x: 50, y: 50, type: 'desk' })
            });
            if (res.ok) {
                const newSeat = await res.json() as Seat;
                setSeats([...seats, newSeat]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSeatMove = async (seatId: number, x: number, y: number) => {
        // Optimistic update
        setSeats(seats.map(s => s.id === seatId ? { ...s, x, y } : s));

        try {
            await fetch('/api/seats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: seatId, x, y })
            });
        } catch (e) {
            console.error(e);
            fetchData(); // Revert on error
        }
    };

    const handleSeatClick = async (seat: Seat) => {
        if (isAdminMode) {
            const newName = prompt('Nuevo nombre:', seat.name);
            if (newName) {
                await fetch('/api/seats', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: seat.id, name: newName })
                });
                fetchData();
            }
            return;
        }

        // User Mode: Sit down
        if (attendanceMap.has(seat.id)) {
            alert('Este sitio está ocupado');
            return;
        }

        if (confirm(`¿Quieres sentarte en ${seat.name}?`)) {
            if (!user) return;
            try {
                await fetch('/api/checkin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, isPresent: true, seatId: seat.id })
                });
                fetchData();
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <MapIcon className="text-blue-400" /> Mapa de Oficina
                    </h1>
                    <p className="text-zinc-400">Selecciona tu sitio para hoy</p>
                </div>

                {user?.role === 'admin' && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddSeat}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isAdminMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'hidden'}`}
                        >
                            <Plus size={18} /> Añadir Sitio
                        </button>
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isAdminMode ? 'bg-blue-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
                        >
                            {isAdminMode ? 'Guardar Diseño' : 'Editar Mapa'}
                        </button>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="text-white text-center">Cargando mapa...</div>
            ) : (
                <OfficeMap
                    seats={seats}
                    currentUserId={user?.id}
                    onSeatClick={handleSeatClick}
                    onSeatMove={handleSeatMove}
                    isAdmin={isAdminMode}
                    attendanceMap={attendanceMap}
                />
            )}
        </div>
    );
}
