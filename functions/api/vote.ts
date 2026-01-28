import { getDb } from '../utils/db';
import { votes } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const onRequestPost = async (context: any) => {
    try {
        const { voterId, targetUserId, isTrue } = await context.request.json();
        if (!voterId) return new Response('Unauthorized', { status: 401 });
        if (voterId === targetUserId) return new Response("Can't vote on yourself", { status: 400 });

        const today = new Date().toISOString().split('T')[0];
        const db = getDb(context);

        const existing = await db.query.votes.findFirst({
            where: and(
                eq(votes.voterUserId, voterId),
                eq(votes.targetUserId, targetUserId),
                eq(votes.date, today)
            )
        });

        if (existing) {
            await db.update(votes).set({ isTrue, timestamp: Date.now() }).where(eq(votes.id, existing.id));
        } else {
            await db.insert(votes).values({
                voterUserId: voterId,
                targetUserId,
                date: today,
                isTrue,
                timestamp: Date.now(),
            });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
