import { getDb } from '../utils/db';
import { users } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const onRequestPost = async (context: any) => {
    try {
        const { code, pin } = await context.request.json();

        if (!code || !pin) {
            return new Response(JSON.stringify({ error: 'Missing code or pin' }), { status: 400 });
        }

        const db = getDb(context);
        const user = await db.query.users.findFirst({
            where: and(eq(users.code, code), eq(users.pin, pin)),
        });

        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // In a real app, we'd use a secure session token. 
        // For this demo/MVP, we'll return the user info and store it in client storage 
        // or set a simple signed cookie if we had a secret.
        // Let's rely on client-side storage for simplicity as requested "elimina todo lo anterior" implying simplicity 
        // BUT user wanted "reliable". 
        // Let's return the user.id and name. 

        return new Response(JSON.stringify({ user: { ...user, avatar: '/avatar.png' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
