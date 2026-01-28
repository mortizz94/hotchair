import { getDb } from '../utils/db';
import { departments } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const allDepartments = await db.select().from(departments).all();

    return new Response(JSON.stringify(allDepartments), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const onRequestPost = async (context: any) => {
    const db = getDb(context);
    const { name, color, icon } = await context.request.json();

    if (!name || !color) {
        return new Response('Nombre y color requeridos', { status: 400 });
    }

    try {
        const result = await db.insert(departments).values({ name, color, icon }).returning().get();
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPut = async (context: any) => {
    const db = getDb(context);
    const { id, name, color, icon } = await context.request.json();

    if (!id || !name) {
        return new Response('ID y nombre requeridos', { status: 400 });
    }

    try {
        const result = await db.update(departments)
            .set({ name, color, icon })
            .where(eq(departments.id, id))
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
        await db.delete(departments).where(eq(departments.id, parseInt(id))).run();
        return new Response('OK', { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
