import { getDb } from '../utils/db';
import { users, attendance, votes } from '../../src/db/schema';
import { calculateGamification } from '../utils/gamification';

export const onRequestGet = async (context: any) => {
    try {
        const db = getDb(context);
        const allUsers = await db.select().from(users);
        const allAttendance = await db.select().from(attendance);
        const allVotes = await db.select().from(votes);

        const stats = allUsers.map((user: any) => {
            // Shared Gamification Logic
            const { streak, level, xp, badges } = calculateGamification(allAttendance, allVotes, user.id);

            // Specific Leaderboard Metrics
            const userAtt = allAttendance.filter((a: any) => a.userId === user.id && a.isPresent);

            // Average Time
            let avgTime = 0;
            if (userAtt.length > 0) {
                const totalMinutes = userAtt.reduce((acc: number, curr: any) => {
                    if (!curr.timestamp) return acc;
                    const d = new Date(curr.timestamp);
                    return acc + (d.getUTCHours() * 60 + d.getMinutes()); // Using UTC as per other file roughly
                }, 0);
                avgTime = totalMinutes / userAtt.length;
            }

            // Trust Score
            const receivedVotes = allVotes.filter((v: any) => v.targetUserId === user.id);
            const positiveVotes = receivedVotes.filter((v: any) => v.isTrue).length;
            const trustScore = receivedVotes.length > 0
                ? Math.round((positiveVotes / receivedVotes.length) * 100)
                : 0; // Default pending

            return {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                streak,
                level,
                xp,
                badges,
                avgTime,
                trustScore,
                totalAttendance: userAtt.length
            };
        });

        return new Response(JSON.stringify(stats), { status: 200 });

    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
