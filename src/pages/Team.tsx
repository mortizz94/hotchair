import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { DashboardData } from '../types';
import { SkeletonCard } from '../components/dashboard/SkeletonCard';
import { Users, Search, MapPin, Monitor, Coffee } from 'lucide-react';

export default function Team() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Filter and Group
    const filteredUsers = data?.users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())) || [];

    const officeUsers = filteredUsers.filter(u => u.status === 'present' && u.location === 'office');
    const remoteUsers = filteredUsers.filter(u => u.status === 'present' && u.location !== 'office'); // Default remote?
    const absentUsers = filteredUsers.filter(u => u.status !== 'present');

    const UserCard = ({ u, isPresent, location }: { u: any, isPresent: boolean, location?: string }) => (
        <div key={u.id} className="bg-card border border-border/50 p-4 rounded-3xl flex items-center gap-4 hover:shadow-md transition-all group hover:border-orange-500/20 animate-fade-in">
            <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-muted-foreground text-lg">{u.name.substring(0, 2)}</span>}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-card ${isPresent ? (location === 'office' ? 'bg-green-500' : 'bg-blue-500') : 'bg-zinc-300'}`} />
            </div>
            <div className="min-w-0">
                <p className="font-bold text-base truncate group-hover:text-orange-500 transition-colors">{u.name}</p>
                <p className="text-xs text-muted-foreground truncate font-medium">
                    {isPresent
                        ? (location === 'office' ? 'En la oficina' : 'Teletrabajando')
                        : 'Ausente'}
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Users className="text-orange-500" size={32} />
                        Equipo
                    </h1>
                    <p className="text-muted-foreground mt-1 max-w-md">
                        Consulta quién está disponible y dónde están trabajando tus compañeros hoy.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar compañero..."
                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-transparent focus:border-orange-500/50 focus:bg-background rounded-xl transition-all outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && (
                <div className="space-y-12">

                    {/* Office */}
                    {officeUsers.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={20} className="text-green-500" />
                                <h2 className="text-lg font-bold">En la Oficina <span className="text-muted-foreground text-sm font-normal">({officeUsers.length})</span></h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {officeUsers.map(u => <UserCard key={u.id} u={u} isPresent={true} location="office" />)}
                            </div>
                        </section>
                    )}

                    {/* Remote */}
                    {remoteUsers.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Monitor size={20} className="text-blue-500" />
                                <h2 className="text-lg font-bold">Teletrabajando <span className="text-muted-foreground text-sm font-normal">({remoteUsers.length})</span></h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {remoteUsers.map(u => <UserCard key={u.id} u={u} isPresent={true} location={u.location || 'remote'} />)}
                            </div>
                        </section>
                    )}

                    {/* Absent */}
                    {absentUsers.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Coffee size={20} className="text-zinc-500" />
                                <h2 className="text-lg font-bold text-muted-foreground">Ausentes / Offline <span className="text-sm font-normal">({absentUsers.length})</span></h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {absentUsers.map(u => (
                                    <div key={u.id} className="bg-card/30 border border-border/20 p-4 rounded-3xl flex items-center gap-4 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100 hover:bg-card/50">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center overflow-hidden">
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-muted-foreground text-lg">{u.name.substring(0, 2)}</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm truncate">{u.name}</p>
                                            <p className="text-xs text-muted-foreground">No disponible</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>No se encontraron compañeros con ese nombre.</p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
