import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from '../dashboard/Sidebar';
import { BottomNav } from './BottomNav';
import { User, DashboardData } from '../../types';
import { useAuth } from '../AuthProvider';
import { RouletteModal } from '../dashboard/RouletteModal';
import { ProfileModal } from '../dashboard/ProfileModal';
import { ThumbsUp, Shield, Settings } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isRouletteOpen, setIsRouletteOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [toast, setToast] = useState<{ id: number, text: string, type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ id: Date.now(), text, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch dashboard data globally for the layout
    useEffect(() => {
        if (!user) return;
        const fetchLayoutData = async () => {
            try {
                const response = await fetch(`/api/dashboard?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error("Failed to fetch layout data", error);
            }
        };
        fetchLayoutData();
    }, [user?.id]);

    const handleUpdateProfile = async (data: { userId: string, newPin?: string, altaiUser?: string, altaiPassword?: string, departmentId?: number }) => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                // Refresh data
                const response = await fetch(`/api/dashboard?userId=${user?.id}`);
                if (response.ok) {
                    const newData = await response.json();
                    setDashboardData(newData);
                }
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row safe-area-pb">
            {/* Desktop Sidebar - Hidden on mobile */}
            <Sidebar
                user={user}
                dashboardData={dashboardData}
                logout={logout}
                onOpenRoulette={() => setIsRouletteOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto mb-20 md:mb-0 relative">
                <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav - Visible only on mobile */}
            <BottomNav />

            {/* Global Modals */}
            {isRouletteOpen && <RouletteModal
                isOpen={isRouletteOpen}
                onClose={() => setIsRouletteOpen(false)}
                users={dashboardData?.users || []}
                attendance={dashboardData?.attendance || []}
                showToast={showToast}
            />}

            {isProfileOpen && user && (
                <ProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    currentUser={user}
                    currentAltaiUser={dashboardData?.currentUser?.altaiUser}
                    currentAltaiPassword={dashboardData?.currentUser?.altaiPassword}
                    onUpdateProfile={handleUpdateProfile}
                />
            )}

            {/* Toast Notification (Global) */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-6 right-6 z-[60] animate-slide-up">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium border ${toast.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
                            toast.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' :
                                'bg-white border-zinc-200 text-zinc-900'
                        }`}>
                        {toast.type === 'success' && <ThumbsUp size={18} className="text-green-600" />}
                        {toast.type === 'error' && <Shield size={18} className="text-red-600" />}
                        {toast.type === 'info' && <Settings size={18} className="text-zinc-600" />}
                        {toast.text}
                    </div>
                </div>
            )}
        </div>
    );
}
