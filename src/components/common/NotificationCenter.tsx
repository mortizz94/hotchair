import { useState, useEffect } from 'react';
import { Bell, Check, Info, Trophy, X } from 'lucide-react';
import { useAuth } from '../AuthProvider';

type Notification = {
    id: number;
    type: 'welcome' | 'validation' | 'achievement' | 'system';
    message: string;
    read: boolean;
    data?: any;
    createdAt: number;
};

export function NotificationCenter() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/notifications?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json() as Notification[];
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id: number) => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, read: true })
            });
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'welcome': return <Info size={16} className="text-blue-400" />;
            case 'validation': return <Check size={16} className="text-green-400" />;
            case 'achievement': return <Trophy size={16} className="text-yellow-400" />;
            default: return <Bell size={16} className="text-zinc-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-sm">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No tienes notificaciones
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-4 flex gap-3 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}
                                            onClick={() => !n.read && markAsRead(n.id)}
                                        >
                                            <div className="mt-0.5 min-w-8">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                    {getIcon(n.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-1">
                                                    {new Date(n.createdAt * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <div className="flex items-start">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
