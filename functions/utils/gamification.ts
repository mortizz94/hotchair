export type GamificationStats = {
    streak: number;
    level: number;
    xp: number;
    nextLevelXp: number;
    badges: string[];
};

export function calculateGamification(attendance: any[], votes: any[], userId: string): GamificationStats {
    const userAtt = attendance.filter(a => a.userId === userId && a.isPresent);
    const userVotes = votes.filter(v => v.voterUserId === userId);

    // 1. Streak Calculation
    let streak = 0;
    if (userAtt.length > 0) {
        // Sort by date desc just in case
        const sortedAtt = [...userAtt].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const todayStr = new Date().toISOString().split('T')[0];

        // Convert to Set for O(1) lookup
        const attendedDates = new Set(sortedAtt.map(a => a.date));

        // Helper to subtract days
        const getPrevDate = (dateIdx: number) => {
            const d = new Date();
            d.setDate(d.getDate() - dateIdx);
            return d.toISOString().split('T')[0];
        };

        // Check if streak is active (present today or yesterday)
        const isPresentToday = attendedDates.has(todayStr);
        const isPresentYesterday = attendedDates.has(getPrevDate(1));

        if (isPresentToday || isPresentYesterday) {
            streak = isPresentToday ? 1 : 0; // If today present, start at 1. If not, start at 0 but adding yesterday will fix it.

            // Actually, simplified loop approach:
            // Check day 0 (today). If yes, streak++.
            // Check day 1 (yesterday). If yes, streak++.
            // ...
            // If day 0 is missing, but day 1 is present, the streak is kept but just not incremented for today? 
            // Usually "Current Streak" includes today only if done.
            // Let's stick to the logic: Streak is consecutive days ending today or yesterday.

            let currentCheckDate = new Date();

            // If strictly not present today, start check from yesterday
            if (!isPresentToday) {
                currentCheckDate.setDate(currentCheckDate.getDate() - 1);
            }

            // Verify our starting point is indeed present
            if (attendedDates.has(currentCheckDate.toISOString().split('T')[0])) {
                streak = 0; // We count inside loop
                // Limit to 365 days lookback
                for (let i = 0; i < 365; i++) {
                    const dateStr = currentCheckDate.toISOString().split('T')[0];
                    if (attendedDates.has(dateStr)) {
                        streak++;
                    } else {
                        // Tolerate weekends? For now, STRICT.
                        break;
                    }
                    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
                }
            }
        }
    }

    // 2. XP Calculation
    let xp = 0;
    xp += userAtt.length * 10; // 10 XP per attendance
    xp += userVotes.length * 1; // 1 XP per vote

    // 3. Level Calculation
    const level = Math.floor(xp / 100) + 1;
    const nextLevelXp = level * 100;

    // 4. Badges Calculation
    const badges: string[] = [];
    if (streak >= 3) badges.push('🔥 On Fire');
    if (streak >= 10) badges.push('⚡ Imparable');
    if (streak >= 30) badges.push('🏆 Leyenda');

    // Early Bird (Late arrivals don't count? We count distinct days where arrival < 8 AM UTC)
    // Assuming timestamp exists and is ISO string
    const earlyBirds = userAtt.filter(a => {
        if (!a.timestamp) return false;
        const h = new Date(a.timestamp).getUTCHours();
        // 9 AM CET is 8 AM UTC (winter) or 7 AM UTC (summer). Let's use < 8 for roughly 9am.
        return h < 8;
    }).length;

    if (earlyBirds >= 5) badges.push('🌞 Madrugador');

    // Voter
    if (userVotes.length >= 10) badges.push('👮 Vigilante');
    if (userVotes.length >= 50) badges.push('🎯 Verificador');

    // Snitch (Votes made) - wait, userVotes IS votes made by user
    if (userVotes.length >= 100) badges.push('🕵️ Sherlock');

    return { streak, level, xp, nextLevelXp, badges };
}
