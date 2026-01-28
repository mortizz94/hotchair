import { ThumbsUp, Shield, Flame, Crown } from 'lucide-react';
import { UserScore, Attendance, DashboardData } from '../../types';

interface UserCardProps {
    userScore: UserScore;
    currentUserId?: string;
    dashboardData: DashboardData | null;
    attendance: Attendance | undefined;
    onVote: (targetUserId: string, isTrue: boolean) => void;
    animationDelay?: number;
}

export function UserCard({ userScore, currentUserId, dashboardData, attendance, onVote, animationDelay = 0 }: UserCardProps) {
    const isPresent = attendance?.isPresent;
    const isCurrentUser = userScore.id === currentUserId; // Renamed from isMe for consistency
    const status = isPresent ? 'present' : 'absent';

    // Derived states for gamification visuals
    const trustFactor = userScore.confirmedCount + userScore.deniedCount > 0
        ? Math.round((userScore.confirmedCount / (userScore.confirmedCount + userScore.deniedCount)) * 100)
        : 100;

    // Simple logic for visual flair (can be expanded based on DashboardData if needed)
    const isSnitch = userScore.snitchCount > 5;
    const isSuspicious = userScore.deniedCount > userScore.confirmedCount;

    return (
        <div
            className={`
                relative group rounded-3xl p-6 transition-all duration-500
                ${isCurrentUser
                    ? 'glass-card border-purple-500/30 shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)]'
                    : 'glass bg-white/5 border-white/5 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl'
                }
                ${(isSnitch || isSuspicious) && !isCurrentUser ? 'ring-2 ring-offset-4 ring-offset-black/50' : ''}
                ${isSnitch ? 'ring-blue-500' : isSuspicious ? 'ring-red-500' : ''}
            `}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            {/* Crown for Top Level */}
            {userScore.role === 'admin' && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-black p-2 rounded-xl shadow-lg transform rotate-12 z-20">
                    <Crown size={16} fill="currentColor" />
                </div>
            )}

            {/* Badges/Tags Row */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`
                    px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md
                    ${status === 'present'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]'
                        : 'bg-red-500/10 text-red-400 border border-red-500/10'
                    }
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'present' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    {status === 'present' ? 'Presente' : 'Ausente'}
                </div>

                {userScore.level && (
                    <div className="text-[10px] font-black bg-white/10 text-white px-2 py-1 rounded border border-white/10">
                        LVL {userScore.level}
                    </div>
                )}
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center mb-6 relative">
                {/* Avatar Glow */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isCurrentUser ? 'opacity-50' : ''}`} />

                <div className="relative mb-4">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border overflow-hidden transition-transform duration-500 group-hover:scale-110 shadow-lg
                        ${isCurrentUser ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-white/20 text-white' : 'bg-zinc-800 border-white/10 text-zinc-400 group-hover:text-white'}
                    `}>
                        {userScore.avatar ? (
                            <img src={userScore.avatar} alt={userScore.name} className="w-full h-full object-cover" />
                        ) : (
                            userScore.name.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    {/* Status Indicator Dot */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0a0a0b]
                        ${status === 'present' ? 'bg-green-500' : 'bg-red-500'}
                    `} />
                </div>

                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-purple-300 transition-colors text-center truncate w-full">
                    {userScore.name}
                    {isCurrentUser && <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 align-middle">TÚ</span>}
                </h3>
                <p className="text-xs text-zinc-500 font-mono tracking-widest">{userScore.code}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-black/20 p-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-lg font-bold text-white">{trustFactor}%</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Confianza</span>
                </div>
                <div className="bg-black/20 p-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                    <div className="flex items-center gap-1 text-orange-400 font-bold">
                        <Flame size={14} className="fill-orange-400" />
                        <span className="text-lg">{userScore.streak || 0}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Racha</span>
                </div>
            </div>

            {/* Voting Actions - Only show if current user is present */}
            {dashboardData?.currentUser?.status === 'present' && !isCurrentUser && (
                <div className="grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={() => onVote(userScore.id, true)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all hover:scale-105"
                    >
                        <ThumbsUp size={16} /> <span className="text-xs font-bold">Confirmar</span>
                    </button>
                    <button
                        onClick={() => onVote(userScore.id, false)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all hover:scale-105"
                    >
                        <Shield size={16} /> <span className="text-xs font-bold">Reportar</span>
                    </button>
                </div>
            )}

            {/* Info Message if not present */}
            {(dashboardData?.currentUser?.status !== 'present' && !isCurrentUser) && (
                <div className="text-center py-2 text-xs text-zinc-600 italic">
                    Debes fichar para votar
                </div>
            )}

            {isCurrentUser && (
                <div className="text-center py-2 text-xs text-purple-400/50 font-medium">
                    Tu tarjeta de empleado
                </div>
            )}
        </div>
    );
}
