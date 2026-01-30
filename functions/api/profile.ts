import { getDb } from '../utils/db';
import { users, attendance, votes } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { calculateGamification } from '../utils/gamification';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
        return new Response('User not found', { status: 404 });
    }

    const allAttendance = await db.select().from(attendance);
    const allVotes = await db.select().from(votes);

    const { streak, level, xp, badges, nextLevelXp } = calculateGamification(allAttendance, allVotes, userId);

    return new Response(JSON.stringify({
        user,
        gamification: {
            streak,
            level,
            xp,
            nextLevelXp,
            badges
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const onRequestPut = async (context: any) => {
    // We already have a profile update handler in AppLayout via /api/profile
    // But this file is /api/profile.ts, so we can move it here or key it off method
    // For now the AppLayout uses /api/profile (which maps to this file in Pages Functions routing)

    // Implementation for updating profile (pin, department)
    try {
        const db = getDb(context);
        const { userId, newPin, departmentId } = await context.request.json();

        if (!userId) return new Response('Missing userId', { status: 400 });

        const updateData: any = {};
        if (newPin) updateData.pin = newPin;
        if (departmentId) updateData.departmentId = departmentId;

        await db.update(users).set(updateData).where(eq(users.id, userId));

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
