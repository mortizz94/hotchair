export type User = {
    id: string;
    name: string;
    code: string;
    role: 'admin' | 'user';
    altaiUser?: string;
    altaiPassword?: string;
    avatar?: string;
    // Gamification
    badges?: string[];
    level?: number;
    xp?: number;
    streak?: number;
    // Dynamic
    status?: 'present' | 'absent';
};

export type Attendance = {
    userId: string;
    isPresent: boolean;
    date: string;
};

export type Vote = {
    voterUserId: string;
    targetUserId: string;
    isTrue: boolean;
};

export type DashboardData = {
    users: User[];
    attendance: Attendance[];
    votes: Vote[];
    currentUser?: User & {
        status: 'present' | 'absent';
        streak: number;
        badges: string[];
    };
    topSnitches: { name: string; count: number }[];
    topSuspicious: { name: string; count: number }[];
};

export type UserScore = User & {
    confirmedCount: number;
    deniedCount: number;
    snitchCount: number;
};
