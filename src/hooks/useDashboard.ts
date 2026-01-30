import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardData } from '../types';
import { useAuth } from '../components/AuthProvider';

async function fetchDashboard(userId: string) {
    const res = await fetch(`/api/dashboard?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json() as Promise<DashboardData>;
}

async function fetchSettings() {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
}

async function checkIn({ userId, isPresent, location }: { userId: string, isPresent: boolean, location: string }) {
    const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isPresent, location })
    });
    if (!res.ok) throw new Error('Check-in failed');
    return res.json();
}

export function useDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const dashboardQuery = useQuery({
        queryKey: ['dashboard', user?.id],
        queryFn: () => fetchDashboard(user!.id),
        enabled: !!user,
        refetchInterval: 10000, // Refresh every 10s
    });

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
    });

    const checkInMutation = useMutation({
        mutationFn: checkIn,
        onMutate: async (newCheckIn) => {
            await queryClient.cancelQueries({ queryKey: ['dashboard', user?.id] });
            const previousData = queryClient.getQueryData<DashboardData>(['dashboard', user?.id]);

            if (previousData && user) {
                queryClient.setQueryData<DashboardData>(['dashboard', user.id], {
                    ...previousData,
                    currentUser: {
                        ...previousData.currentUser,
                        status: newCheckIn.isPresent ? 'present' : 'absent',
                        location: newCheckIn.location as 'office' | 'remote',
                    } as DashboardData['currentUser'],
                });
            }

            return { previousData };
        },
        onError: (_err, _newCheckIn, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['dashboard', user?.id], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
        },
    });

    return {
        dashboardQuery,
        settingsQuery,
        checkInMutation
    };
}
