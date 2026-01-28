import { getDb } from '../../utils/db';
import { attendance, votes } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';

export const onRequestPost = async (context: any) => {
    try {
        const db = getDb(context);
        const today = new Date().toISOString().split('T')[0];

        // Delete today's attendance
        await db.delete(attendance).where(eq(attendance.date, today));

        // Delete today's votes
        await db.delete(votes).where(eq(votes.date, today));

        return new Response(JSON.stringify({ success: true, message: 'Día reiniciado correctamente' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
