import { getDb } from '../utils/db';
import { notifications } from '../../src/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    const userNotifications = await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(20);

    return new Response(JSON.stringify(userNotifications), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const onRequestPut = async (context: any) => {
    const db = getDb(context);
    const { id, read } = await context.request.json();

    if (!id) {
        return new Response('Missing notification id', { status: 400 });
    }

    await db.update(notifications)
        .set({ read: !!read })
        .where(eq(notifications.id, id));

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const onRequestPost = async (context: any) => {
    // Internal use or admin use to create notifications
    const db = getDb(context);
    const { userId, type, message, data } = await context.request.json();

    if (!userId || !message) {
        return new Response('Missing required fields', { status: 400 });
    }

    const result = await db.insert(notifications).values({
        userId,
        type: type || 'system',
        message,
        data,
        read: false,
        createdAt: Math.floor(Date.now() / 1000)
    }).returning();

    return new Response(JSON.stringify(result[0]), {
        headers: { 'Content-Type': 'application/json' }
    });
};
