import { getDb } from '../utils/db';
import { attendance, users } from '../../src/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    try {
        const db = getDb(context);

        // Date 30 days ago
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const limitDate = date.toISOString().split('T')[0];

        // Fetch all attendance for last 30 days
        const history = await db.select({
            date: attendance.date,
            userName: users.name,
            isPresent: attendance.isPresent
        })
            .from(attendance)
            .leftJoin(users, eq(attendance.userId, users.id))
            .where(
                and(
                    gte(attendance.date, limitDate),
                    eq(attendance.isPresent, true)
                )
            )
            .orderBy(desc(attendance.date));

        // Group by Date
        const grouped: Record<string, string[]> = {};
        history.forEach(h => {
            if (!grouped[h.date]) grouped[h.date] = [];
            if (h.userName) grouped[h.date].push(h.userName);
        });

        // Convert to array
        const result = Object.entries(grouped).map(([date, attendees]) => ({
            date,
            attendees
        }));

        return new Response(JSON.stringify(result), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
