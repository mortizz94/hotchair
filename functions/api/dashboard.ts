import { getDb } from '../utils/db';
import { users, attendance, votes, timeEntries, timeOffRequests } from '../../src/db/schema';
import { eq, and, gt, or } from 'drizzle-orm';
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
    // Fetch active time entries to determine current activity (Work, Lunch, etc.)
    const activeTimeEntries = await db.select().from(timeEntries).where(eq(timeEntries.endTime, null as any));

    // 2. Daily Data
    const dailyAttendance = allAttendance.filter(a => a.date === today);
    const dailyVotes = allVotes.filter(v => v.date === today);

    // 3. Process Users
    const allUsersWithStatus = allUsers.map(u => {
        const att = dailyAttendance.find(a => a.userId === u.id);
        const activeEntry = activeTimeEntries.find((e: any) => e.userId === u.id);
        const { streak, level, xp, badges } = calculateGamification(allAttendance, allVotes, u.id);

        return {
            ...u,
            status: att?.isPresent ? 'present' : 'absent',
            activity: activeEntry?.type || (att?.isPresent ? 'work' : undefined), // Default to work if present but no entry (legacy)
            location: att?.location as 'office' | 'remote' | undefined,
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
    let totalMinutesToday = 0;

    if (currentUserId) {
        currentUserData = allUsersWithStatus.find(u => u.id === currentUserId) || null;

        // Calculate total minutes for today
        // We need time entries for this user and today
        // Note: We need to fetch time entries first
        const userEntries = await db.select().from(timeEntries)
            .where(and(eq(timeEntries.userId, currentUserId), eq(timeEntries.date, today)))
            .all();

        userEntries.forEach((entry: any) => {
            const start = entry.startTime;
            const end = entry.endTime || Date.now();
            totalMinutesToday += Math.floor((end - start) / 1000 / 60);
        });

        // Fetch upcoming time off requests (approved or pending, future dates)
        // db vs db.select() - using query builder style
        // We need to import timeOffRequests and gt from drizzle
        // But for now, let's keep it simple. If we don't have gt (greater than), we filter in JS.
        // Actually imports are needed at top.
    }

    let upcomingAbsences: any[] = [];
    if (currentUserId) {
        const userAbsences = await db.select().from(timeOffRequests)
            .where(eq(timeOffRequests.userId, currentUserId))
            .all();

        // Filter in JS for simplicity with dates
        upcomingAbsences = userAbsences.filter((req: any) => {
            return req.startDate >= today && (req.status === 'approved' || req.status === 'pending');
        }).sort((a: any, b: any) => a.startDate.localeCompare(b.startDate))
            .slice(0, 3); // Top 3
    }

    return new Response(JSON.stringify({
        users: allUsersWithStatus,
        attendance: dailyAttendance,
        currentUser: currentUserData ? { ...currentUserData, totalMinutesToday, upcomingAbsences, avatar: '/avatar.png' } : null,
        votes: dailyVotes,
        topSnitches: snitchRanking,
        topSuspicious: suspiciousRanking
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
