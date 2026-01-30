import { getDb } from '../../utils/db';
import { timeEntries, attendance } from '../../../src/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    // Get last 7 days stats
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

    // Recent Time Entries
    const recentEntries = await db.select().from(timeEntries)
        .where(
            and(
                eq(timeEntries.userId, userId),
                gte(timeEntries.startTime, sevenDaysAgo)
            )
        )
        .orderBy(desc(timeEntries.startTime));

    // Attendance History (last 30 days)
    const thirtyDaysAgoInfo = new Date();
    thirtyDaysAgoInfo.setDate(thirtyDaysAgoInfo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgoInfo.toISOString().split('T')[0];

    const attendanceHistory = await db.select().from(attendance)
        .where(
            and(
                eq(attendance.userId, userId),
                gte(attendance.date, thirtyDaysAgoStr)
            )
        )
        .orderBy(desc(attendance.date));

    // Calculate total hours this week
    let totalSecondsThisWeek = 0;
    const now = Date.now();
    recentEntries.forEach(entry => {
        const start = entry.startTime * 1000;
        const end = entry.endTime ? entry.endTime * 1000 : now;
        totalSecondsThisWeek += (end - start) / 1000;
    });

    return new Response(JSON.stringify({
        totalHoursLast7Days: Math.round(totalSecondsThisWeek / 3600 * 10) / 10,
        recentEntries,
        attendanceHistory,
        attendanceRate: Math.round((attendanceHistory.filter(a => a.isPresent).length / 30) * 100) // Rough estimate
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};
