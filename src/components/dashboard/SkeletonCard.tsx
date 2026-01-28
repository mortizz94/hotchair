export function SkeletonCard() {
    return (
        <div className="relative group rounded-2xl p-6 bg-white/5 border border-white/5 shadow-xl transition-all h-[250px] animate-pulse">
            <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-6 bg-white/10 rounded-full"></div>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 mb-4 rounded-3xl bg-white/10"></div>
                <div className="w-32 h-6 bg-white/10 rounded-lg"></div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col items-center w-1/2 border-r border-white/5">
                    <div className="w-8 h-8 bg-white/10 rounded mb-1"></div>
                </div>
                <div className="flex flex-col items-center w-1/2">
                    <div className="w-8 h-8 bg-white/10 rounded mb-1"></div>
                </div>
            </div>
        </div>
    );
}
