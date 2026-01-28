import { getDb } from '../utils/db';
import { allowedIps, users } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    try {
        const db = getDb(context);
        const url = new URL(context.request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) return new Response('Unauthorized', { status: 401 });

        // Verify Admin
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (user?.role !== 'admin') {
            return new Response('Forbidden', { status: 403 });
        }

        const ips = await db.select().from(allowedIps).orderBy(desc(allowedIps.createdAt));
        return new Response(JSON.stringify(ips), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}

export const onRequestPost = async (context: any) => {
    try {
        const db = getDb(context);
        const { userId, ip, label } = await context.request.json();

        if (!userId || !ip) return new Response('Missing data', { status: 400 });

        // Verify Admin
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (user?.role !== 'admin') {
            return new Response('Forbidden', { status: 403 });
        }

        await db.insert(allowedIps).values({
            ip,
            label,
            createdAt: Date.now()
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}

export const onRequestDelete = async (context: any) => {
    try {
        const db = getDb(context);
        const url = new URL(context.request.url);
        const userId = url.searchParams.get('userId');
        const ipId = url.searchParams.get('id');

        if (!userId || !ipId) return new Response('Missing data', { status: 400 });

        // Verify Admin
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (user?.role !== 'admin') {
            return new Response('Forbidden', { status: 403 });
        }

        await db.delete(allowedIps).where(eq(allowedIps.id, Number(ipId)));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
