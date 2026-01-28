import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Trophy, Zap, Clock, Settings, Shield, Flame, Menu, X, Bell, Briefcase, TrendingUp, Palmtree, Map, Home } from 'lucide-react';
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
    const location = useLocation();
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

    const NavItem = ({ icon: Icon, label, onClick, path, activeColor = "text-blue-400" }: any) => {
        const isActive = path ? location.pathname === path : false;

        return (
            <button
                onClick={() => {
                    onClick?.();
                    if (path) navigate(path);
                    setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-medium group relative overflow-hidden
                    ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                `}
            >
                <div className="flex items-center gap-3 z-10">
                    <Icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? activeColor : 'text-zinc-500 group-hover:text-white'}`} />
                    <span>{label}</span>
                </div>
                {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeColor.replace('text-', 'bg-')}`} />}
            </button>
        );
    }

    const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-6">
            <h4 className="px-3 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">{title}</h4>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    return (
        <aside className={`w-full md:w-72 bg-black/95 md:bg-black/40 backdrop-blur-xl md:h-screen sticky top-0 md:border-r border-b md:border-b-0 border-white/10 flex-shrink-0 flex flex-col z-50 transition-all duration-300 ${isMobileMenuOpen ? 'h-screen fixed inset-0' : 'h-16 md:h-screen'}`}>
            {/* Header Mobile */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/5 md:border-none">
                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic text-white">
                    Hot<span className="text-orange-500">Chair</span>
                    <Flame className="text-orange-500 fill-orange-500 animate-pulse-slow" size={20} />
                </h1>

                <button onClick={toggleMenu} className="md:hidden text-zinc-400 hover:text-white p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Content */}
            <div className={`flex-1 flex flex-col overflow-y-auto p-4 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'hidden md:flex opacity-100'}`}>

                {/* User Profile Summary */}
                <div className="mb-8 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white uppercase">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user?.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                            LVL {dashboardData?.currentUser?.level || 1} • {dashboardData?.currentUser?.status === 'present' ? <span className="text-green-500">Online</span> : <span className="text-zinc-500">Offline</span>}
                        </p>
                    </div>
                    <button onClick={onOpenProfile} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <Settings size={16} />
                    </button>
                </div>

                <div className="flex-1">
                    <NavGroup title="Mi Espacio">
                        <NavItem icon={Home} label="Dashboard" path="/" activeColor="text-orange-400" />
                        <NavItem icon={Clock} label="Registro Horario" path="/time-tracking" activeColor="text-purple-400" />
                        <NavItem icon={Palmtree} label="Mis Ausencias" path="/time-off" activeColor="text-green-400" />
                        <NavItem icon={Calendar} label="Historial" path="/history" activeColor="text-blue-400" />
                    </NavGroup>

                    <NavGroup title="Oficina">
                        <NavItem icon={Map} label="Mapa Oficina" path="/map" activeColor="text-indigo-400" />
                        <NavItem icon={Trophy} label="Hall of Fame" path="/leaderboard" activeColor="text-yellow-400" />
                        <NavItem icon={Zap} label="Silla Caliente" onClick={onOpenRoulette} activeColor="text-orange-500 hover:text-orange-500" />
                    </NavGroup>

                    {user?.role === 'admin' && (
                        <NavGroup title="Gestión">
                            <NavItem icon={Shield} label="Admin Panel" path="/admin" activeColor="text-red-400" />
                            <NavItem icon={Briefcase} label="Departamentos" path="/departments" activeColor="text-pink-400" />
                            <NavItem icon={TrendingUp} label="Analytics" path="/analytics" activeColor="text-cyan-400" />
                        </NavGroup>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                    <NavItem icon={LogOut} label="Fichar en Altai" onClick={handleCopyAltai} activeColor="text-zinc-400" />
                    {permission === 'default' && (
                        <NavItem icon={Bell} label="Activar Alertas" onClick={requestPermission} activeColor="text-yellow-400" />
                    )}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>

                <div className="mt-6 text-[10px] text-zinc-700 text-center font-mono">
                    ID: {user?.code} • v6.6.6
                </div>
            </div>
        </aside>
    );
}

// Reuse logic from original component for things I missed? 
// No, rewritten cleanly.
