import { useState } from 'react';
import { Seat } from '../../types';

interface OfficeMapProps {
    seats: Seat[];
    currentUserId?: string;
    onSeatClick: (seat: Seat) => void;
    onSeatMove?: (seatId: number, x: number, y: number) => void;
    isAdmin: boolean;
    attendanceMap: Map<number, any>; // seatId -> attendance record
}

export function OfficeMap({ seats, currentUserId, onSeatClick, onSeatMove, isAdmin, attendanceMap }: OfficeMapProps) {
    const [draggingId, setDraggingId] = useState<number | null>(null);

    const handleMouseDown = (seatId: number) => {
        if (isAdmin) setDraggingId(seatId);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (draggingId) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left - 20); // Center offset
            const y = Math.round(e.clientY - rect.top - 20);

            onSeatMove && onSeatMove(draggingId, x, y);
            setDraggingId(null);
        }
    };

    return (
        <div
            className="w-full h-[600px] bg-zinc-900/50 rounded-2xl border border-white/10 relative overflow-hidden select-none"
            onMouseUp={handleMouseUp}
            onMouseMove={(e) => draggingId && e.preventDefault()} // Prevent text selection
        >
            {/* Grid for admin */}
            {isAdmin && (
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
            )}

            {seats.map((seat) => {
                const occupant = attendanceMap.get(seat.id);
                const isOccupied = !!occupant;
                const isMe = occupant?.userId === currentUserId;

                return (
                    <div
                        key={seat.id}
                        className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer group
                            ${isMe ? 'bg-green-500 text-white ring-4 ring-green-500/20' :
                                isOccupied ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                    'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600 border border-white/10'}
                        `}
                        style={{ left: seat.x, top: seat.y }}
                        onMouseDown={() => handleMouseDown(seat.id)}
                        onClick={() => !draggingId && onSeatClick(seat)}
                    >
                        {isOccupied ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                {occupant.user?.avatar ? (
                                    <img src={occupant.user.avatar} alt={occupant.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-black/30 flex items-center justify-center font-bold text-xs ring-1 ring-white/10">
                                        {occupant.user?.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-[10px] font-mono opacity-50">{seat.name}</span>
                        )}

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {seat.name} {isOccupied ? `(${occupant.user?.name})` : ''}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
