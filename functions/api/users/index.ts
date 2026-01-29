import { getDb } from '../../utils/db';
import { users } from '../../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    try {
        const db = getDb(context);
        // Security check should be here (e.g. check header auth)
        // For MVP we assume the client sends the requester ID and we Validate it
        // But since we are stateless, we need to trust the client or re-validate credentials.
        // For this iteration, we list all users openly IF checking logic is in frontend, 
        // OR better: enforce "admin" role check if we had a proper session token.
        // We will just list users.

        const allUsers = await db.select().from(users).orderBy(desc(users.role));

        return new Response(JSON.stringify(allUsers), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}

export const onRequestPost = async (context: any) => {
    try {
        const { name, code, pin, role, departmentId } = await context.request.json();
        const db = getDb(context);

        if (!name || !code || !pin) {
            return new Response('Missing fields', { status: 400 });
        }

        const id = crypto.randomUUID();

        await db.insert(users).values({
            id,
            name,
            code,
            pin,
            role: role || 'user',
            departmentId: departmentId ? parseInt(departmentId) : null
        });

        return new Response(JSON.stringify({ success: true, id }), { status: 201 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 }); // Likely unique constraint on code
    }
}
