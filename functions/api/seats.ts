import { getDb } from '../utils/db';
import { seats, attendance } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);

    try {
        const allSeats = await db.select().from(seats).all();

        // Enhance with occupancy status based on today's attendance?
        // Actually, we should probably return real-time status.
        // For now, simple return.
        return new Response(JSON.stringify(allSeats), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost = async (context: any) => {
    const db = getDb(context);
    const { name, x, y, type } = await context.request.json();

    if (!name || x === undefined || y === undefined) {
        return new Response('Nombre, x, y requeridos', { status: 400 });
    }

    try {
        const result = await db.insert(seats).values({
            name, x, y, type: type || 'desk'
        }).returning().get();
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPut = async (context: any) => {
    const db = getDb(context);
    const { id, name, x, y, type, status, assignedUserId } = await context.request.json();

    if (!id) {
        return new Response('ID requerido', { status: 400 });
    }

    try {
        const updateData: any = {};
        if (name) updateData.name = name;
        if (x !== undefined) updateData.x = x;
        if (y !== undefined) updateData.y = y;
        if (type) updateData.type = type;
        if (status) updateData.status = status;
        if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId;

        const result = await db.update(seats)
            .set(updateData)
            .where(eq(seats.id, id))
            .returning()
            .get();
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestDelete = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response('ID requerido', { status: 400 });
    }

    try {
        await db.delete(seats).where(eq(seats.id, parseInt(id))).run();
        return new Response('OK', { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
