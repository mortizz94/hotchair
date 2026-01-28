import { ReactNode, useEffect, useState } from 'react';
import { TopNav } from './TopNav';
import { DashboardData } from '../../types';
import { useAuth } from '../AuthProvider';
import { ProfileModal } from '../dashboard/ProfileModal';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Fetch dashboard data globally for the layout
    useEffect(() => {
        if (!user) return;
        const fetchLayoutData = async () => {
            try {
                const response = await fetch(`/api/dashboard?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json() as DashboardData;
                    setDashboardData(data);
                }
            } catch (error) {
                console.error("Failed to fetch layout data", error);
            }
        };
        fetchLayoutData();
    }, [user?.id]);

    const handleUpdateProfile = async (data: { userId: string, newPin?: string, departmentId?: number }) => {
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
                    const newData = await response.json() as DashboardData;
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
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <TopNav
                user={user}
                dashboardData={dashboardData}
                logout={logout}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-fade-in relative">
                {children}
            </main>

            {/* Global Modals */}
            {isProfileOpen && user && (
                <ProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    currentUser={user}
                    onUpdateProfile={handleUpdateProfile}
                />
            )}

        </div>
    );
}
