import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../src/db/schema';

export function getDb(context: any) {
    return drizzle(context.env.DB, { schema });
}
