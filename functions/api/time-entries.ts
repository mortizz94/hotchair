import { getDb } from '../utils/db';
import { timeEntries } from '../../src/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');
    const date = url.searchParams.get('date');

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    let query = db.select().from(timeEntries).where(eq(timeEntries.userId, userId)).orderBy(desc(timeEntries.startTime));

    // If date is provided, filter by date (optional, might need range later)
    if (date) {
        query = db.select().from(timeEntries)
            .where(and(eq(timeEntries.userId, userId), eq(timeEntries.date, date)))
            .orderBy(desc(timeEntries.startTime));
    }

    const entries = await query;

    return new Response(JSON.stringify(entries), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const onRequestPost = async (context: any) => {
    const db = getDb(context);
    const { userId, description, projectId } = await context.request.json();

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    // Check if there is already an active entry
    const activeEntry = await db.select().from(timeEntries)
        .where(and(eq(timeEntries.userId, userId), eq(timeEntries.endTime, null as any))) // Drizzle might need direct null check differently depending on driver, but usually this works or isNull()
        .get();

    if (activeEntry) {
        return new Response(JSON.stringify({ error: 'Already clocked in', activeEntry }), { status: 409 });
        // Ideally we might want to return 409 Conflict
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestamp = now.getTime();

    const result = await db.insert(timeEntries).values({
        userId,
        date: dateStr,
        startTime: timestamp,
        description,
        projectId
    }).returning();

    return new Response(JSON.stringify(result[0]), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const onRequestPut = async (context: any) => {
    const db = getDb(context);
    const { id, endTime, description, projectId } = await context.request.json();

    if (!id) {
        return new Response('Missing entry id', { status: 400 });
    }

    const updateData: any = {};
    if (endTime !== undefined) updateData.endTime = endTime;
    if (description !== undefined) updateData.description = description;
    if (projectId !== undefined) updateData.projectId = projectId;

    // If clocking out (endTimeProvided)
    if (endTime) {
        updateData.endTime = endTime;
    }

    const result = await db.update(timeEntries)
        .set(updateData)
        .where(eq(timeEntries.id, id))
        .returning();

    return new Response(JSON.stringify(result[0]), {
        headers: { 'Content-Type': 'application/json' }
    });
};
