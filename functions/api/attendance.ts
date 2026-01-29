import { getDb } from '../utils/db';
import { attendance } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const onRequestPost = async (context: any) => {
    try {
        const { userId, isPresent, location } = await context.request.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
        }

        const db = getDb(context);
        const today = new Date().toISOString().split('T')[0];

        // Check if record exists for today
        const existingRecord = await db.select().from(attendance)
            .where(and(
                eq(attendance.userId, userId),
                eq(attendance.date, today)
            ))
            .get();

        let result;
        if (existingRecord) {
            // Update
            result = await db.update(attendance)
                .set({
                    isPresent: isPresent,
                    location: location || 'office',
                    timestamp: Date.now()
                })
                .where(eq(attendance.id, existingRecord.id))
                .returning()
                .get();
        } else {
            // Insert
            const insertResult = await db.insert(attendance).values({
                userId,
                date: today,
                isPresent: isPresent,
                location: location || 'office',
                timestamp: Date.now()
            }).returning().get();
            result = insertResult;
        }

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
