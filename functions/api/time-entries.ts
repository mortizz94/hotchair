import { getDb } from '../utils/db';
import { timeEntries, attendance, allowedIps } from '../../src/db/schema';
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
        .where(and(eq(timeEntries.userId, userId), eq(timeEntries.endTime, null as any)))
        .get();

    if (activeEntry) {
        return new Response(JSON.stringify({ error: 'Already clocked in', activeEntry }), { status: 409 });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestamp = now.getTime();

    // 1. Determine Location
    let location = 'remote';
    const clientIP = context.request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const LOCAL_IPS = ['127.0.0.1', '::1', 'localhost'];

    // Fetch Allowed IPs
    const allowedIpsList = await db.query.allowedIps.findMany();
    const allowed = allowedIpsList.map((i: any) => i.ip);

    if (allowed.includes(clientIP) || LOCAL_IPS.includes(clientIP)) {
        location = 'office';
    }

    // 2. Upsert Attendance (Side Effect: Mark as Present)
    const existingAttendance = await db.query.attendance.findFirst({
        where: and(eq(attendance.userId, userId), eq(attendance.date, dateStr))
    });

    if (existingAttendance) {
        await db.update(attendance)
            .set({ isPresent: true, location, timestamp: Date.now() })
            .where(eq(attendance.id, existingAttendance.id));
    } else {
        await db.insert(attendance).values({
            userId,
            date: dateStr,
            isPresent: true,
            location,
            timestamp: Date.now(),
        });
    }

    // 3. Insert Time Entry
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
