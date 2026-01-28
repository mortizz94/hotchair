import { getDb } from '../../utils/db';
import { users } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';

export const onRequestDelete = async (context: any) => {
    try {
        const id = context.params.id;
        const db = getDb(context);

        if (!id) return new Response('Missing ID', { status: 400 });

        await db.delete(users).where(eq(users.id, id));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
