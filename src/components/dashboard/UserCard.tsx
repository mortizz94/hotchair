import { ThumbsUp, ThumbsDown, Skull } from 'lucide-react';
import { UserScore, User, Attendance, DashboardData } from '../../types';

interface UserCardProps {
    userScore: UserScore;
    currentUser: User | null;
    currentUserId?: string; // ID of the logged in user
    dashboardData: DashboardData | null;
    attendance: Attendance | undefined;
    onVote: (targetUserId: string, isTrue: boolean) => void;
    animationDelay?: number;
}

export function UserCard({ userScore, currentUser, currentUserId, dashboardData, attendance, onVote, animationDelay = 0 }: UserCardProps) {
    const isPresent = attendance?.isPresent;
    const isMe = userScore.id === currentUserId;
    const isFraud = isPresent && userScore.deniedCount > userScore.confirmedCount && userScore.deniedCount >= 2;

    const canVote = isPresent && !isMe && currentUserId && dashboardData?.currentUser?.status === 'present';

    return (
        <div
            className={`relative group rounded-2xl p-6 transition-all duration-300 border backdrop-blur-sm ${isFraud
                ? 'bg-red-900/10 border-red-500/30 hover:border-red-500/50'
                : isPresent
                    ? 'bg-zinc-900/60 border-orange-500/20 shadow-xl shadow-orange-900/5 hover:-translate-y-1 hover:border-orange-500/40'
                    : 'bg-white/5 border-white/5 opacity-60 hover:opacity-80 scale-[0.98]'
                }`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isFraud
                    ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                    : isPresent
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isFraud
                        ? 'bg-red-500 animate-pulse'
                        : isPresent
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-zinc-600'
                        }`} />
                    {isFraud ? 'BAJO SOSPECHA' : (isPresent ? 'Online' : 'Offline')}
                </div>

                {/* Action Buttons */}
                {canVote && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onVote(userScore.id, true)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-green-500 hover:text-white transition-all hover:scale-110 active:scale-95"
                            title="Confirmar presencia"
                        >
                            <ThumbsUp size={14} />
                        </button>
                        <button
                            onClick={() => onVote(userScore.id, false)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-95"
                            title="Reportar ausencia"
                        >
                            <ThumbsDown size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center mb-4">
                <div className="relative">
                    <div className={`w-24 h-24 mb-4 rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl transition-transform group-hover:scale-105 border-4 ${isFraud
                        ? 'bg-zinc-800 text-white border-red-500/50'
                        : isPresent
                            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-zinc-900'
                            : 'bg-zinc-800 text-zinc-600 border-zinc-900'
                        }`}>
                        {isFraud ? <Skull size={40} className="text-red-500 animate-pulse" /> : userScore.name.charAt(0)}
                    </div>
                    {userScore.level && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-black w-8 h-8 flex items-center justify-center rounded-full border-4 border-zinc-900 shadow-lg" title={`Nivel ${userScore.level}`}>
                            {userScore.level}
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-orange-500 transition-colors">{userScore.name}</h3>

                {userScore.badges && userScore.badges.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-1 px-2">
                        {userScore.badges.map((b, i) => (
                            <span key={i} className="text-xs" title={b}>{b.split(' ')[0]}</span>
                        ))}
                    </div>
                )}

                {isMe && <span className="text-[10px] font-bold bg-white/10 text-white/50 px-2 py-0.5 rounded mt-2">TÚ</span>}
            </div>

            {isPresent && (
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col items-center w-1/2 border-r border-white/5">
                        <span className="text-xl font-black text-green-500 leading-none">{userScore.confirmedCount}</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Confirmed</span>
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                        <span className="text-xl font-black text-red-500 leading-none">{userScore.deniedCount}</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Denied</span>
                    </div>
                </div>
            )}
        </div>
    );
}
