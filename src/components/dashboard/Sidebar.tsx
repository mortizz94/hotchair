import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { LogOut, Calendar, Trophy, Zap, Clock, Settings, Shield, Flame, Briefcase, TrendingUp, Palmtree, Map, Home } from 'lucide-react';
import { User, DashboardData } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';

interface SidebarProps {
    user: User | null;
    dashboardData: DashboardData | null;
    logout: () => void;
    onOpenRoulette: () => void;
    onOpenProfile: () => void;
}

export function Sidebar({ user, dashboardData, logout, onOpenRoulette, onOpenProfile }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { permission, requestPermission } = useNotifications();

    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ icon: Icon, label, path, onClick, activeColor = 'text-primary' }: any) => {
        const active = path ? isActive(path) : false;

        return (
            <button
                onClick={() => {
                    if (onClick) onClick();
                    if (path) navigate(path);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 font-medium text-sm group ${active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
            >
                <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-primary text-white' : 'bg-transparent group-hover:bg-muted-foreground/10'}`}>
                    <Icon size={18} className={active ? 'text-white' : activeColor} />
                </div>
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
        );
    };

    const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-6">
            <h3 className="px-4 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    const handleCopyAltai = () => {
        if (!user?.altaiUser || !user?.altaiPassword) {
            alert("No tienes credenciales de Altai configuradas en tu perfil.");
            return;
        }

        const textToCopy = `Usuario: ${user.altaiUser}\nContraseña: ${user.altaiPassword}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Credenciales copiadas al portapapeles");
            window.open('https://altai.holistic.es/altai/jsp/login.jsp', '_blank');
        });
    };

    return (
        <aside className="hidden md:flex flex-col w-72 h-screen max-h-screen border-r border-border bg-card sticky top-0 overflow-hidden">
            <div className="p-6">
                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic text-primary">
                    Hot<span className="text-foreground">Chair</span>
                    <Flame className="text-primary fill-primary animate-pulse-slow" size={24} />
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {/* User Card Mini */}
                <div
                    onClick={onOpenProfile}
                    className="mb-8 flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border cursor-pointer hover:shadow-sm transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{user?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">LVL {dashboardData?.currentUser?.level || 1}</span>
                            <span>•</span>
                            <span>{dashboardData?.currentUser?.streak || 0} 🔥</span>
                        </div>
                    </div>
                </div>

                <NavGroup title="Mi Espacio">
                    <NavItem icon={Home} label="Dashboard" path="/" activeColor="text-blue-500" />
                    <NavItem icon={Clock} label="Fichar" path="/time-tracking" activeColor="text-purple-500" />
                    <NavItem icon={Palmtree} label="Ausencias" path="/time-off" activeColor="text-green-500" />
                    <NavItem icon={Calendar} label="Historial" path="/history" activeColor="text-orange-500" />
                </NavGroup>

                <NavGroup title="Oficina">
                    <NavItem icon={Map} label="Mapa" path="/map" activeColor="text-blue-500" />
                    <NavItem icon={Trophy} label="Ranking" path="/leaderboard" activeColor="text-yellow-500" />
                    <NavItem icon={Zap} label="Ruleta" onClick={onOpenRoulette} activeColor="text-orange-500" />
                </NavGroup>

                {user?.role === 'admin' && (
                    <NavGroup title="Admin">
                        <NavItem icon={Shield} label="Panel" path="/admin" activeColor="text-red-500" />
                        <NavItem icon={Briefcase} label="Dept." path="/departments" activeColor="text-pink-500" />
                        <NavItem icon={TrendingUp} label="Datos" path="/analytics" activeColor="text-cyan-500" />
                    </NavGroup>
                )}
            </div>

            <div className="px-4 pb-2">
                <button
                    onClick={handleCopyAltai}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground group"
                >
                    <div className="p-2 rounded-xl bg-transparent group-hover:bg-muted-foreground/10 transition-colors">
                        <LogOut size={18} className="text-muted-foreground group-hover:text-foreground rotate-180" />
                    </div>
                    <span>Fichar (Altai)</span>
                </button>
            </div>

            <div className="p-4 border-t border-border mt-auto">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut size={16} />
                    <span>Salir</span>
                </button>
                <p className="text-[10px] text-center text-muted-foreground mt-2 font-mono opacity-50">
                    v6.6.6 • {user?.code}
                </p>
            </div>
        </aside>
    );
}
