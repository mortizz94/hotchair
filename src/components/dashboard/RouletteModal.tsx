import { useState, useEffect } from 'react';
import { X, Zap, Trophy } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { User, Attendance, DashboardData } from '../../types';

interface RouletteModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    attendance: Attendance[];
    showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export function RouletteModal({ isOpen, onClose, users, attendance, showToast }: RouletteModalProps) {
    const { playTick, playWin } = useSoundEffects();

    // Internal State
    const [rouletteState, setRouletteState] = useState<'idle' | 'spinning' | 'winner'>('idle');
    const [rouletteWinner, setRouletteWinner] = useState<User | null>(null);
    const [currentSpinName, setCurrentSpinName] = useState('...');

    // Reset state when opening
    useEffect(() => {
        if (isOpen && rouletteState === 'idle') {
            setRouletteWinner(null);
            setCurrentSpinName('...');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const startRoulette = () => {
        if (!users) return;

        // Filter users who are present
        const presentUsers = users.filter(u => {
            const att = attendance?.find(a => a.userId === u.id);
            return att?.isPresent;
        });

        if (presentUsers.length === 0) {
            showToast('No hay nadie en la oficina para jugar', 'error');
            return;
        }

        setRouletteState('spinning');
        let spinCount = 0;
        const maxSpins = 30;
        const intervalTime = 80;

        const spinInterval = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * presentUsers.length);
            setCurrentSpinName(presentUsers[randomIdx].name);
            playTick();
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                const finalIdx = Math.floor(Math.random() * presentUsers.length);
                setRouletteWinner(presentUsers[finalIdx]);
                setRouletteState('winner');
                playWin();
                // Trigger confetti or something here ideally
            }
        }, intervalTime);
    };

    const handleClose = () => {
        setRouletteState('idle');
        setRouletteWinner(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-orange-500/20 shadow-2xl relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" />

                <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-20">
                    <X size={24} />
                </button>

                <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 transform rotate-3">
                        <Zap size={40} className="text-white" />
                    </div>

                    <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                        La Silla Caliente
                    </h3>
                    <p className="text-zinc-400 text-sm mb-8">
                        ¿Quién será la próxima víctima?
                    </p>

                    <div className="mb-10 min-h-[120px] flex items-center justify-center">
                        {rouletteState === 'idle' && (
                            <div className="text-zinc-600 font-mono text-sm">
                                Pulsa el botón para comenzar el sorteo...
                            </div>
                        )}

                        {rouletteState === 'spinning' && (
                            <div className="text-4xl font-black text-orange-500 animate-pulse">
                                {currentSpinName}
                            </div>
                        )}

                        {rouletteState === 'winner' && rouletteWinner && (
                            <div className="animate-fade-in transform scale-110 duration-300">
                                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">EL ELEGIDO ES</div>
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2 drop-shadow-lg">
                                    {rouletteWinner.name}
                                </div>
                                <Trophy className="mx-auto text-yellow-500 mt-2 animate-bounce" size={32} />
                            </div>
                        )}
                    </div>

                    {rouletteState === 'idle' && (
                        <button
                            onClick={startRoulette}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-lg rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            ¡GIRAR RULETA!
                        </button>
                    )}

                    {rouletteState === 'winner' && (
                        <button
                            onClick={startRoulette}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all mb-3"
                        >
                            Girar otra vez
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
