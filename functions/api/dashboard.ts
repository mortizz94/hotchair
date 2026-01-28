import { getDb } from '../utils/db';
import { users, attendance, votes } from '../../src/db/schema';
import { calculateGamification } from '../utils/gamification';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const today = new Date().toISOString().split('T')[0];
    const url = new URL(context.request.url);
    const currentUserId = url.searchParams.get('userId');

    // 1. Fetch All Data
    const allUsers = await db.select().from(users);
    const allAttendance = await db.select().from(attendance); // We need all for history
    const allVotes = await db.select().from(votes);

    // 2. Daily Data
    const dailyAttendance = allAttendance.filter(a => a.date === today);
    const dailyVotes = allVotes.filter(v => v.date === today);

    // 3. Process Users
    const allUsersWithStatus = allUsers.map(u => {
        const att = dailyAttendance.find(a => a.userId === u.id);
        const { streak, level, xp, badges } = calculateGamification(allAttendance, allVotes, u.id);

        return {
            ...u,
            status: att?.isPresent ? 'present' : 'absent',
            seatId: att?.seatId,
            streak,
            level,
            xp,
            badges
        };
    });

    // 4. Rankings
    // Snitch
    const snitchCounts: Record<string, number> = {};
    allVotes.forEach(v => {
        snitchCounts[v.voterUserId] = (snitchCounts[v.voterUserId] || 0) + 1;
    });
    const snitchRanking = Object.entries(snitchCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
            const u = allUsers.find(user => user.id === userId);
            return { name: u?.name || 'Unknown', count };
        });

    // Suspicious
    const suspiciousCounts: Record<string, number> = {};
    allVotes.filter(v => !v.isTrue).forEach(v => {
        suspiciousCounts[v.targetUserId] = (suspiciousCounts[v.targetUserId] || 0) + 1;
    });
    const suspiciousRanking = Object.entries(suspiciousCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
            const u = allUsers.find(user => user.id === userId);
            return { name: u?.name || 'Unknown', count };
        });

    // 5. Current User
    let currentUserData = null;
    if (currentUserId) {
        currentUserData = allUsersWithStatus.find(u => u.id === currentUserId) || null;
    }

    return new Response(JSON.stringify({
        users: allUsersWithStatus,
        attendance: dailyAttendance,
        currentUser: currentUserData,
        votes: dailyVotes,
        topSnitches: snitchRanking,
        topSuspicious: suspiciousRanking
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
