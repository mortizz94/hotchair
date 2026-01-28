import { useCallback } from 'react';

export const useSoundEffects = () => {
    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime = 0) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

            gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const playTick = useCallback(() => {
        playTone(800, 'sine', 0.05);
    }, [playTone]);

    const playSuccess = useCallback(() => {
        playTone(523.25, 'sine', 0.1, 0); // C5
        playTone(659.25, 'sine', 0.3, 0.1); // E5
    }, [playTone]);

    const playWin = useCallback(() => {
        // Major Arpeggio Fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            playTone(freq, 'triangle', 0.3, i * 0.1);
        });
        playTone(1046.50, 'square', 0.8, 0.4); // Long C6
    }, [playTone]);

    return { playTick, playSuccess, playWin };
};
