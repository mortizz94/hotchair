import { getDb } from '../utils/db';
import { attendance, allowedIps } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const onRequestPost = async (context: any) => {
    try {
        const { userId, isPresent, seatId } = await context.request.json();
        const today = new Date().toISOString().split('T')[0];
        const db = getDb(context);

        // Simple auth check via body (in real app, use headers/cookies)
        if (!userId) return new Response('Unauthorized', { status: 401 });

        // IP Restriction for "I am Here"
        if (isPresent) {
            const clientIP = context.request.headers.get('CF-Connecting-IP') || '127.0.0.1';
            const LOCAL_IPS = ['127.0.0.1', '::1', 'localhost'];

            // Fetch Allowed IPs from DB
            const allowedIpsList = await db.query.allowedIps.findMany();
            const allowed = allowedIpsList.map((i: any) => i.ip);

            if (!allowed.includes(clientIP) && !LOCAL_IPS.includes(clientIP)) {
                return new Response(JSON.stringify({
                    error: `Solo puedes hacer check-in desde la oficina. Tu IP: ${clientIP}`
                }), { status: 403 });
            }
        }

        const existing = await db.query.attendance.findFirst({
            where: and(eq(attendance.userId, userId), eq(attendance.date, today))
        });

        if (existing) {
            await db.update(attendance)
                .set({ isPresent, seatId: isPresent ? seatId : null, timestamp: Date.now() })
                .where(eq(attendance.id, existing.id));
        } else {
            await db.insert(attendance).values({
                userId,
                date: today,
                isPresent,
                seatId: isPresent ? seatId : null,
                timestamp: Date.now(),
            });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
