import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Palmtree } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../components/AuthProvider';

type Absence = {
    id: number;
    userId: string;
    startDate: string;
    endDate: string;
    type: string;
    // We need user name/avatar, might need to fetch users or join in backend
    // For now, let's fetch users in frontend or backend should return joined data
};

export default function CalendarPage() {
    const { } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true);

    const fetchCalendarData = async () => {
        // setLoading(true);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            // Fetch users for mapping
            // Ideally we should cache this or have it in context
            // const usersRes = await fetch('/api/dashboard'); // reusing dashboard endpoint to get users? heavy.
            // Let's assume we have a way to get users. For now let's reuse dashboard or create /api/users
            // Or just rely on the fact that absences might not have names if we don't join.
            // Let's try to get users from /api/dashboard for now
            const dashRes = await fetch('/api/dashboard');
            const dashData = await dashRes.json() as { users: any[] };
            setUsers(dashData.users);

            const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json() as { absences: Absence[] };
                setAbsences(data.absences);
            }
        } catch (e) {
            console.error(e);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getDayAbsences = (day: Date) => {
        return absences.filter(a => {
            return isWithinInterval(day, {
                start: parseISO(a.startDate),
                end: parseISO(a.endDate)
            });
        });
    };

    const getUser = (id: string) => users.find(u => u.id === id);

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Palmtree className="text-orange-500" size={32} />
                        Calendario de Equipo
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visualiza vacaciones y ausencias planificadas.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-card border border-border/50 p-1 rounded-xl">
                    <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold min-w-[140px] text-center capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-card border border-white/5 rounded-3xl overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 bg-muted/30 border-b border-white/5">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                        <div key={d} className="p-4 text-center text-sm font-bold text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-background/50">
                    {calendarDays.map((day) => {
                        const dayAbsences = getDayAbsences(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[140px] p-2 border-b border-r border-white/5 flex flex-col gap-1 transition-colors hover:bg-white/[0.02] ${!isCurrentMonth ? 'bg-muted/10 opacity-50' : ''
                                    }`}
                            >
                                <div className={`text-right p-1 mb-1 ${isToday ? 'bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center ml-auto font-bold text-xs shadow-lg' : 'text-zinc-500 text-sm font-medium'}`}>
                                    {format(day, 'd')}
                                </div>

                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                                    {dayAbsences.map(absence => {
                                        const u = getUser(absence.userId);
                                        return (
                                            <div key={`${absence.id}-${day.toISOString()}`} className="text-[10px] p-1.5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center gap-2 truncate" title={`${u?.name || 'Usuario'}: ${absence.type}`}>
                                                {u?.avatar ? <img src={u.avatar} className="w-4 h-4 rounded-full" /> : <div className="w-4 h-4 rounded-full bg-zinc-600" />}
                                                <span className="truncate flex-1">{u?.name || 'Usuario'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
