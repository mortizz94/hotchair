import { getDb } from '../utils/db';
import { timeOffRequests, attendance } from '../../src/db/schema';
import { eq, and, or, gte, lte } from 'drizzle-orm';

export const onRequestGet = async (context: any) => {
    const db = getDb(context);
    const url = new URL(context.request.url);
    const month = url.searchParams.get('month'); // 1-12
    const year = url.searchParams.get('year'); // 2024

    if (!month || !year) {
        return new Response('Missing month or year', { status: 400 });
    }

    const startOfMonth = `${year}-${month.padStart(2, '0')}-01`;
    // Calculate end of month
    const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endOfMonth = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

    // Fetch confirmed absences (Time Off Requests)
    // We want requests that overlap with this month
    // overlap: (start <= endOfMonth) && (end >= startOfMonth)
    const approvedAbsences = await db.select().from(timeOffRequests)
        .where(
            and(
                eq(timeOffRequests.status, 'approved'),
                or(
                    and(
                        lte(timeOffRequests.startDate, endOfMonth),
                        gte(timeOffRequests.endDate, startOfMonth)
                    )
                )
            )
        );

    // Fetch attendance history for this month (optional, maybe too heavy? let's stick to absences for now and future)
    // Actually user wants "who is working remote", so we might need daily status?
    // Start with absences as "Calendar" usually implies planning.

    return new Response(JSON.stringify({
        absences: approvedAbsences
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};
