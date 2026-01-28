import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

function findLocalD1File() {
    const baseDir = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
    if (!fs.existsSync(baseDir)) return null;

    const files = fs.readdirSync(baseDir);
    const sqliteFile = files.find(f => f.endsWith('.sqlite'));
    return sqliteFile ? path.join(baseDir, sqliteFile) : null;
}

export function getLocalDb() {
    const localDbPath = findLocalD1File();
    if (localDbPath) {
        const sqlite = new Database(localDbPath);
        return drizzle(sqlite, { schema });
    }
    return null;
}
