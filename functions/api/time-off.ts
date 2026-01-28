import { getDb } from '../utils/db';
import { timeOffRequests, users, departments } from '../../src/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');
    const managerId = url.searchParams.get('managerId');

    try {
        // Base Query Columns
        const selectFields = {
            id: timeOffRequests.id,
            userId: timeOffRequests.userId,
            userName: users.name,
            userAvatar: users.avatar,
            startDate: timeOffRequests.startDate,
            endDate: timeOffRequests.endDate,
            type: timeOffRequests.type,
            reason: timeOffRequests.reason,
            status: timeOffRequests.status,
            createdAt: timeOffRequests.createdAt
        };

        if (managerId) {
            // 1. Get departments managed by this user
            const managedDepartments = await db.select({ id: departments.id })
                .from(departments)
                .where(eq(departments.managerId, managerId))
                .all();

            const deptIds = managedDepartments.map((d: any) => d.id);

            if (deptIds.length === 0) {
                return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
            }

            // 2. Get requests from users in these departments
            const entries = await db.select(selectFields)
                .from(timeOffRequests)
                .leftJoin(users, eq(timeOffRequests.userId, users.id))
                .where(inArray(users.departmentId, deptIds))
                .orderBy(desc(timeOffRequests.createdAt))
                .all();

            return new Response(JSON.stringify(entries), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Default / User view
        let query = db.select(selectFields)
            .from(timeOffRequests)
            .leftJoin(users, eq(timeOffRequests.userId, users.id))
            .orderBy(desc(timeOffRequests.createdAt));

        if (userId) {
            // @ts-ignore
            query = query.where(eq(timeOffRequests.userId, userId));
        }

        const entries = await query.all();

        return new Response(JSON.stringify(entries), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost = async (context: any) => {
    const db = getDb(context);
    const { userId, startDate, endDate, type, reason } = await context.request.json();

    if (!userId || !startDate || !endDate || !type) {
        return new Response('Faltan datos requeridos', { status: 400 });
    }

    try {
        const result = await db.insert(timeOffRequests).values({
            userId,
            startDate,
            endDate,
            type,
            reason,
            status: 'pending'
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
    const { id, status } = await context.request.json();

    if (!id || !status) {
        return new Response('ID y status requeridos', { status: 400 });
    }

    try {
        const result = await db.update(timeOffRequests)
            .set({ status })
            .where(eq(timeOffRequests.id, id))
            .returning()
            .get();
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
