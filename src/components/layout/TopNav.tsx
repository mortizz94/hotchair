import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Flame, LogOut, Settings, Briefcase, TrendingUp, Palmtree, Users } from 'lucide-react';
import { User, DashboardData } from '../../types';
import { NotificationCenter } from '../common/NotificationCenter';

interface TopNavProps {
    user: User | null;
    dashboardData: DashboardData | null;
    logout: () => void;
}

export function TopNav({ user, dashboardData, logout }: TopNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: Flame },
        { path: '/team', label: 'Compañeros', icon: Users },
        { path: '/calendar', label: 'Calendario', icon: Palmtree },
        { path: '/time-off', label: 'Ausencias', icon: Palmtree },
        { path: '/profile', label: 'Mi Perfil', icon: Flame },
    ];

    const adminLinks = [
        { path: '/admin', label: 'Panel', icon: Settings },
        { path: '/departments', label: 'Dept.', icon: Briefcase },
        { path: '/analytics', label: 'Datos', icon: TrendingUp },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                        <Flame className="text-orange-500 fill-orange-500" size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Hot<span className="text-foreground/80">Chair</span></span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(link.path)
                                ? 'bg-foreground/5 text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                                }`}
                        >
                            <link.icon size={16} className={isActive(link.path) ? 'text-orange-500' : ''} />
                            {link.label}
                        </Link>
                    ))}

                    {user?.role === 'admin' && (
                        <div className="h-4 w-px bg-border mx-2" />
                    )}

                    {user?.role === 'admin' && adminLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(link.path)
                                ? 'bg-purple-500/10 text-purple-600'
                                : 'text-muted-foreground hover:text-purple-600 hover:bg-purple-500/10'
                                }`}
                        >
                            <link.icon size={16} />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Side / Mobile Menu Toggle */}
                <div className="flex items-center gap-3">
                    <NotificationCenter />
                    {/* User Profile Trigger */}
                    <Link
                        to="/profile"
                        className="hidden md:flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-border hover:border-orange-500/30 transition-all bg-card hover:shadow-sm group"
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-xs ring-2 ring-transparent group-hover:ring-orange-500/20 transition-all">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : user?.name.substring(0, 2)}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold leading-none">{user?.name.split(' ')[0]}</p>
                            <p className="text-[10px] text-muted-foreground leading-none mt-1">LVL {dashboardData?.currentUser?.level || 1}</p>
                        </div>
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background p-4 animate-slide-down shadow-xl">
                    <div className="space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${isActive(link.path)
                                    ? 'bg-orange-500/10 text-orange-600'
                                    : 'text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        ))}
                        {user?.role === 'admin' && (
                            <div className="py-2">
                                <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Admin</p>
                                {adminLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${isActive(link.path)
                                            ? 'bg-purple-500/10 text-purple-600'
                                            : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                    >
                                        <link.icon size={18} />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                        <div className="h-px bg-border my-2" />
                        <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted"
                        >
                            <Settings size={18} />
                            Mi Perfil
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
