import { drizzle } from 'drizzle-orm/d1';
import { getRequestContext } from '@cloudflare/next-on-pages';
import * as schema from './schema';

let db: any;

if (process.env.NODE_ENV === 'production') {
    db = drizzle((getRequestContext().env as any).DB, { schema });
} else {
    // Local Development Shim
    // Dynamic import to avoid bundling better-sqlite3 in production
    // This try-catch block ensures that even if webpack tries to analyze it, it might handle the missing module gracefully in edge,
    // OR we rely on Next.js/Webpack not creating chunks for this in Edge runtime because of the NODE_ENV check (Dead Code Elimination).
    try {
        const { getLocalDb } = require('./dev-db');
        db = getLocalDb();
        if (!db) {
            db = new Proxy({}, {
                get: () => { throw new Error("Database not initialized or not found."); }
            });
        }
    } catch (e) {
        console.warn("Failed to load local DB shim", e);
        db = new Proxy({}, {
            get: () => { throw new Error("Local DB shim failed to load."); }
        });
    }
}

export { db };
