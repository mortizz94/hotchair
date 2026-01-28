import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Trophy, User } from 'lucide-react';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const NavItem = ({ icon: Icon, label, path }: any) => {
        const isActive = location.pathname === path;
        return (
            <button
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                    }`}
            >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-white/5 pb-4 pt-2 px-4 z-50 md:hidden shadow-lg safe-area-pb">
            <div className="flex justify-around items-center h-full">
                <NavItem icon={Home} label="Inicio" path="/" />
                <NavItem icon={Map} label="Mapa" path="/map" />
                <NavItem icon={Trophy} label="Rank" path="/leaderboard" />
                <NavItem icon={User} label="Perfil" path="/history" />
            </div>
        </div>
    );
}
