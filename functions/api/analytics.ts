import { getDb } from '../utils/db';
import { attendance, users, departments } from '../../src/db/schema';
import { eq, sql, desc, and, gte } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);

    // 1. Daily Attendance Trend (Last 7 Days)
    // Since D1/SQLite date functions can be tricky, we'll fetch recent records and aggregate in JS for simplicity/reliability
    // or use a simple group by if date string format YYYY-MM-DD is consistent.

    // Fetch last 30 days of attendance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const rawAttendance = await db.select({
        date: attendance.date,
        isPresent: attendance.isPresent
    })
        .from(attendance)
        .where(and(eq(attendance.isPresent, true), gte(attendance.date, dateStr)))
        .all();

    // Aggregate by Date
    const dailyMap = new Map<string, number>();
    rawAttendance.forEach(a => {
        dailyMap.set(a.date, (dailyMap.get(a.date) || 0) + 1);
    });

    const dailyTrend = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Department Distribution (Today)
    const today = new Date().toISOString().split('T')[0];

    const presentUsers = await db.select({
        departmentId: users.departmentId,
        deptName: departments.name,
        deptColor: departments.color
    })
        .from(attendance)
        .innerJoin(users, eq(attendance.userId, users.id))
        .leftJoin(departments, eq(users.departmentId, departments.id))
        .where(and(eq(attendance.date, today), eq(attendance.isPresent, true)))
        .all();

    const deptMap = new Map<string, { name: string, color: string, value: number }>();

    presentUsers.forEach(u => {
        const key = u.deptName || 'Sin Departamento';
        const current = deptMap.get(key) || {
            name: key,
            color: u.deptColor || '#71717a', // zinc-500
            value: 0
        };
        current.value++;
        deptMap.set(key, current);
    });

    const departmentDistribution = Array.from(deptMap.values());

    return new Response(JSON.stringify({
        dailyTrend,
        departmentDistribution
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};
