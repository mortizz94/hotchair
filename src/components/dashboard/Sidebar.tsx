import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Trophy, Zap, Clock, Settings, Shield, Flame, Menu, X, Bell } from 'lucide-react';
import { User, DashboardData } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';

type SidebarProps = {
    user: User | null;
    dashboardData: DashboardData | null;
    logout: () => void;
    onOpenRoulette: () => void;
    onOpenProfile: () => void;
};

export function Sidebar({ user, dashboardData, logout, onOpenRoulette, onOpenProfile }: SidebarProps) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { permission, requestPermission } = useNotifications();

    const handleCopyAltai = () => {
        if (dashboardData?.currentUser?.altaiPassword) {
            navigator.clipboard.writeText(dashboardData.currentUser.altaiPassword);
            alert('Contraseña copiada al portapapeles');
        }
        window.open('https://app.altaiclockin.com/Default.aspx', '_blank');
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <aside className={`w-full md:w-80 glass-card md:h-screen sticky top-0 md:border-r border-b md:border-b-0 border-white/5 p-6 flex-shrink-0 flex flex-col z-20 transition-all duration-300 ${isMobileMenuOpen ? 'h-screen bg-black/95' : 'h-auto'}`}>
            <div className="flex justify-between items-center mb-6 md:mb-10">
                <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2 italic text-white">
                    Hot<span className="text-orange-500">Chair</span>
                    <Flame className="text-orange-500 fill-orange-500 animate-pulse-slow" size={24} />
                </h1>

                <div className="flex gap-2 items-center">
                    <button onClick={logout} className="md:hidden text-muted-foreground hover:text-white transition-colors p-2" title="Cerrar Sesión">
                        <LogOut size={20} />
                    </button>
                    <button onClick={toggleMenu} className="md:hidden text-muted-foreground hover:text-white transition-colors p-2">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <button onClick={logout} className="hidden md:block text-muted-foreground hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg" title="Cerrar Sesión">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobileMenuOpen ? 'flex opacity-100' : 'hidden md:flex opacity-100'}`}>
                <div className="mb-8 p-6 bg-gradient-to-br from-zinc-900/80 to-black/80 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/30 transition-all duration-700" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1 font-medium tracking-widest uppercase">Bienvenido</p>
                                <h3 className="font-bold text-xl text-white mb-2 flex items-center gap-2">
                                    {user?.name}
                                    {dashboardData?.currentUser?.level && (
                                        <span className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded font-black">
                                            LVL {dashboardData.currentUser.level}
                                        </span>
                                    )}
                                </h3>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {dashboardData?.currentUser?.streak ? (
                                <div className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-full font-bold shadow-lg shadow-orange-500/10 flex items-center gap-1.5 animate-bounce-slow">
                                    <Flame size={12} className="fill-current" /> {dashboardData.currentUser.streak} días racha
                                </div>
                            ) : (
                                <div className="text-xs bg-zinc-800 text-zinc-500 px-3 py-1.5 rounded-full font-bold">
                                    Sin racha activa
                                </div>
                            )}
                        </div>

                        {dashboardData?.currentUser?.badges && dashboardData.currentUser.badges.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                                {dashboardData.currentUser.badges.map((badge, idx) => (
                                    <span key={idx} className="text-[10px] bg-white/10 text-zinc-300 px-2 py-1 rounded border border-white/5" title={badge}>
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        )}

                        {dashboardData?.currentUser?.xp && (
                            <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full"
                                    style={{ width: `${(dashboardData.currentUser.xp % 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                    <button
                        onClick={() => navigate('/history')}
                        className="w-full flex items-center gap-4 py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold border border-transparent hover:border-white/5 group"
                    >
                        <Calendar size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-zinc-300 group-hover:text-white">Ver Historial</span>
                    </button>

                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="w-full flex items-center gap-4 py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold border border-transparent hover:border-white/5 group"
                    >
                        <Trophy size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="text-zinc-300 group-hover:text-white">Hall of Fame</span>
                    </button>

                    <button
                        onClick={onOpenRoulette}
                        className="w-full flex items-center gap-4 py-3.5 px-5 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent hover:from-orange-500/20 transition-all text-sm font-semibold border border-orange-500/10 hover:border-orange-500/30 group"
                    >
                        <Zap size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="text-zinc-200 group-hover:text-white">Silla Caliente</span>
                    </button>

                    <button
                        onClick={() => navigate('/time-tracking')}
                        className="w-full flex items-center gap-4 py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold border border-transparent hover:border-white/5 group"
                    >
                        <Clock size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-zinc-300 group-hover:text-white">Registro Horario</span>
                    </button>

                    <button
                        onClick={handleCopyAltai}
                        className="w-full flex items-center gap-4 py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold border border-transparent hover:border-white/5 group"
                    >
                        <LogOut size={18} className="text-green-400 group-hover:scale-110 transition-transform" />
                        <span className="text-zinc-300 group-hover:text-white">Fichar (Altai)</span>
                    </button>

                    <button
                        onClick={onOpenProfile}
                        className="w-full text-left p-3 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors flex items-center gap-3 font-medium group"
                    >
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Configuración
                    </button>

                    {permission === 'default' && (
                        <button
                            onClick={requestPermission}
                            className="w-full text-left p-3 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors flex items-center gap-3 font-medium group"
                        >
                            <Bell size={20} className="group-hover:animate-swing" /> Activar Alertas
                        </button>
                    )}

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full flex items-center gap-4 py-3.5 px-5 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent hover:from-purple-500/20 transition-all text-sm font-semibold border border-purple-500/10 hover:border-purple-500/30 group"
                        >
                            <Shield size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-zinc-300 group-hover:text-white">Administración</span>
                        </button>
                    )}
                </div>

                <div className="mt-8 text-xs text-zinc-700 text-center font-mono py-4 md:py-0">
                    ID: {user?.code}
                </div>
            </div>
        </aside>
    );
}
