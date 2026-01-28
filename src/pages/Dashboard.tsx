import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { ThumbsUp, Shield, Settings } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useNotifications } from '../hooks/useNotifications';
import { DashboardData, UserScore } from '../types';

// Components
import { Sidebar } from '../components/dashboard/Sidebar';
import { UserCard } from '../components/dashboard/UserCard';
import { SkeletonCard } from '../components/dashboard/SkeletonCard';
import { RouletteModal } from '../components/dashboard/RouletteModal';
import { ProfileModal } from '../components/dashboard/ProfileModal';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ id: number, text: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Modals
    const [isRouletteOpen, setIsRouletteOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { playSuccess } = useSoundEffects();
    const { sendNotification } = useNotifications();

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ id: Date.now(), text, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Reminder Notification
    useEffect(() => {
        if (!loading && data) {
            const myAttendance = data.attendance.find(a => a.userId === user?.id && a.isPresent);
            if (!myAttendance) {
                const hour = new Date().getHours();
                if (hour >= 9 && hour < 18) {
                    // Request permission silently/check if granted? 
                    // Better to only send if granted.
                    sendNotification('⏰ ¡No has fichado!', {
                        body: 'Recuerda confirmar tu asistencia en HotChair.'
                    });
                }
            }
        }
    }, [loading, data, user, sendNotification]);

    const fetchData = async () => {
        try {
            const query = user ? `?userId=${user.id}` : '';
            const res = await fetch(`/api/dashboard${query}`);

            if (!res.ok) {
                if (res.status === 401) {
                    logout();
                    return;
                }
                throw new Error('Error al cargar datos');
            }

            const d = await res.json() as DashboardData;
            setData(d);
            setError(null);
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Error desconocido del servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user]);

    // Auto Check-in
    useEffect(() => {
        const performAutoCheckIn = async () => {
            if (!user) return;
            try {
                const res = await fetch('/api/checkin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        isPresent: true,
                        seatId: 1
                    })
                });

                if (res.ok) {
                    showToast('📍 Verificado: Estás en la oficina', 'success');
                    playSuccess();
                    await fetchData();
                }
            } catch (e: any) {
                console.error("Auto check-in failed", e);
            }
        };

        if (user) {
            performAutoCheckIn();
        }
    }, [user]);

    const handleVote = async (targetUserId: string, isTrue: boolean) => {
        if (!user) return;
        try {
            await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voterId: user.id,
                    targetUserId,
                    isTrue
                })
            });
            showToast(isTrue ? '¡Voto confirmado!' : '¡Voto denegado!', isTrue ? 'success' : 'error');
            await fetchData();
        } catch (e) {
            console.error(e);
            showToast('Error al votar', 'error');
        }
    };

    const handleUpdateProfile = async (profileData: { userId: string, newPin?: string, altaiUser?: string, altaiPassword?: string }) => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (res.ok) {
                await fetchData();
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    if (error || (!data && !loading)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground flex-col gap-6">
                <div className="bg-destructive/10 p-6 rounded-2xl border border-destructive/20 text-center">
                    <p className="text-destructive font-bold text-xl mb-2">Error de Conexión</p>
                    <p className="text-muted-foreground mb-4">{error || 'No hay datos disponibles'}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Process data for presentation
    const attendanceMap = new Map((data?.attendance || []).map(a => [a.userId, a]));

    const userScores: UserScore[] = (data?.users || []).map(u => {
        const receivedVotes = (data?.votes || []).filter(v => v.targetUserId === u.id);
        const confirmedCount = receivedVotes.filter(v => v.isTrue).length;
        const deniedCount = receivedVotes.filter(v => !v.isTrue).length;
        const castVotes = (data?.votes || []).filter(v => v.voterUserId === u.id);
        const snitchCount = castVotes.length;

        return { ...u, confirmedCount, deniedCount, snitchCount };
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-orange-500/30">
            <Sidebar
                user={user}
                dashboardData={data}
                logout={logout}
                onOpenRoulette={() => setIsRouletteOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
                {/* Background Ambient Light */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 relative z-10 animate-fade-in">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Sala de Control</h2>
                        <p className="text-zinc-400 font-medium">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                    {loading ? (
                        // Render Skeletons
                        Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))
                    ) : (
                        userScores.map((u, idx) => (
                            <UserCard
                                key={u.id}
                                userScore={u}
                                currentUserId={user?.id}
                                dashboardData={data}
                                attendance={attendanceMap.get(u.id)}
                                onVote={handleVote}
                                animationDelay={idx * 50}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce-slow z-50 ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    {toast.type === 'success' ? <ThumbsUp size={18} /> :
                        toast.type === 'error' ? <Shield size={18} /> :
                            <Settings size={18} />}
                    <span className="font-bold">{toast.text}</span>
                </div>
            )}

            <RouletteModal
                isOpen={isRouletteOpen}
                onClose={() => setIsRouletteOpen(false)}
                users={data?.users || []}
                attendance={data?.attendance || []}
                showToast={showToast}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentUser={user}
                currentAltaiUser={data?.currentUser?.altaiUser}
                currentAltaiPassword={data?.currentUser?.altaiPassword}
                onUpdateProfile={handleUpdateProfile}
            />
        </div>
    );
}
