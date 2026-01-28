import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Logic to find the local D1 file (copied from dev-db.ts to stay standalone)
function findLocalD1File() {
    const baseDir = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
    console.log('Searching for DB in:', baseDir);
    if (!fs.existsSync(baseDir)) {
        console.error('Directory not found');
        return null;
    }

    const files = fs.readdirSync(baseDir);
    // There might be multiple folders if multiple DBs, but usually one per ID.
    // However, baseDir is usually .../d1/miniflare-D1DatabaseObject/<UUID>
    // Wait, let's list .wrangler/state/v3/d1 to be sure.
    // The previous code had:  .../d1/miniflare-D1DatabaseObject
    // But miniflare structure might be different.
    // Let's assume the previous logic was correct or I'll debug it.
    // Actually, let's look at the previous dev-db.ts again or just list the dir first.

    // I will list the directory using list_dir tool before running this script to be sure.
    // But for now, I'll stick to the logic:
    const sqliteFile = files.find(f => f.endsWith('.sqlite'));
    return sqliteFile ? path.join(baseDir, sqliteFile) : null;
}

const INITIAL_USERS = [
    { name: 'Diego', code: 'EMP001', pin: '1234' },
    { name: 'Maria', code: 'EMP002', pin: '5678' },
    { name: 'Juan', code: 'EMP003', pin: '0000' },
    { name: 'Ana', code: 'EMP004', pin: '4321' },
];

async function seed() {
    const dbPath = findLocalD1File();
    if (!dbPath) {
        console.error('Could not find local D1 database file. Run migrations first?');
        process.exit(1);
    }
    console.log('Using DB at:', dbPath);

    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite, { schema });

    console.log('Seeding users...');

    for (const user of INITIAL_USERS) {
        try {
            await db.insert(schema.users).values({
                id: uuidv4(),
                code: user.code,
                pin: user.pin,
                name: user.name,
                role: 'user',
            }).onConflictDoNothing();
            console.log(`User ${user.name} added.`);
        } catch (e) {
            console.error(`Error adding ${user.name}:`, e);
        }
    }
    console.log('Seeding complete.');
}

seed();
