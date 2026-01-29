import { getDb } from '../../utils/db';
import { users } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';

export const onRequestPut = async (context: any) => {
    const db = getDb(context);
    const id = context.params.id;

    try {
        const { name, code, pin, role, departmentId } = await context.request.json();

        // Build update object dynamically
        const updateData: any = {};
        if (name) updateData.name = name;
        if (code) updateData.code = code;
        if (pin) updateData.pin = pin;
        if (role) updateData.role = role;
        // Handle departmentId being null/undefined explicitly if sent
        if (departmentId !== undefined) {
            updateData.departmentId = departmentId ? parseInt(departmentId) : null;
        }

        const result = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
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
    const id = context.params.id;

    try {
        await db.delete(users).where(eq(users.id, id)).run();
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
