import { getDb } from '../utils/db';
import { users } from '../../src/db/schema';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    try {
        const allUsers = await db.select({
            id: users.id,
            name: users.name,
            avatar: users.avatar
        }).from(users).all();

        return new Response(JSON.stringify(allUsers), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
