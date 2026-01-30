import { Flame } from 'lucide-react';

interface MoodCardProps {
    occupancyPercentage: number;
    activeUsers: number;
    totalUsers: number;
}

export function MoodCard({ occupancyPercentage, activeUsers, totalUsers }: MoodCardProps) {
    // Mood Logic
    const moodThreshold = 60; // We can pass this as prop if needed
    const isHappy = occupancyPercentage > moodThreshold;

    const moodImage = isHappy ? '/assets/happy_kid_military.png' : '/assets/angry_kid_military.png';
    const moodText = isHappy ? '¡La oficina está viviéndosela!' : 'Esto parece un desierto...';
    const moodColor = isHappy ? 'text-green-500' : 'text-orange-500';

    return (
        <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 shadow-2xl group min-h-[300px] flex flex-col md:flex-row items-center">
            <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex-1 p-8 md:pl-12 z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                    <Flame size={12} className={moodColor} /> Vibe Check
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                    {occupancyPercentage}% de Aforo
                </h2>
                <p className={`text-xl font-medium ${moodColor} mb-6`}>{moodText}</p>

                <div className="flex items-center justify-center md:justify-start gap-8">
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase">Presentes</p>
                        <p className="text-2xl font-black text-white">{activeUsers}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase">Total</p>
                        <p className="text-2xl font-black text-white">{totalUsers}</p>
                    </div>
                </div>
            </div>

            <div className="relative w-full md:w-1/2 h-64 md:h-full flex items-center justify-center p-4">
                <img
                    src={moodImage}
                    alt="Office Mood"
                    className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500 ease-out"
                />
            </div>
        </div>
    );
}
