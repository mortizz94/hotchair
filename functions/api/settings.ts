import { getDb } from '../utils/db';
import { settings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    try {
        const db = getDb(context);
        const allSettings = await db.select().from(settings).all();

        // Convert array to object for easier consumption { key: value }
        const settingsMap = allSettings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // Default if missing
        if (!settingsMap['mood_threshold']) {
            settingsMap['mood_threshold'] = '60';
        }

        return new Response(JSON.stringify(settingsMap), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
};

export const onRequestPost = async (context: any) => {
    try {
        const db = getDb(context);
        const body = await context.request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return new Response('Missing key or value', { status: 400 });
        }

        // Upsert logic (SQLite replace or insert-on-conflict)
        // Since 'key' is primary key, we can try to update, if 0 rows, insert. 
        // Or simpler: DELETE then INSERT, or just use insert().onConflictDoUpdate() if supported by this drizzle version/adapter comfortably.
        // Let's stick to a simple check-then-act for safety or onConflictDoUpdate.

        // Check if exists
        const existing = await db.select().from(settings).where(eq(settings.key, key)).get();

        if (existing) {
            await db.update(settings)
                .set({ value: String(value) })
                .where(eq(settings.key, key))
                .run();
        } else {
            await db.insert(settings)
                .values({ key, value: String(value) })
                .run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
};
