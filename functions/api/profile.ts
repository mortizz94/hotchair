import { getDb } from '../utils/db';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export const onRequestPut = async (context: any) => {
    try {
        const db = getDb(context);
        const { userId, newPin, altaiUser, altaiPassword } = await context.request.json();

        // Update object construction
        const updateData: any = {};
        if (newPin) updateData.pin = newPin;
        if (altaiUser !== undefined) updateData.altaiUser = altaiUser;
        if (altaiPassword !== undefined) updateData.altaiPassword = altaiPassword;

        if (Object.keys(updateData).length === 0) {
            return new Response(JSON.stringify({ error: 'No hay datos para actualizar' }), { status: 400 });
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
