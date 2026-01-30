import { Briefcase, Utensils, Users, Zap, Coffee } from 'lucide-react';

export const ACTIVITIES = [
    { id: 'work', label: 'Trabajo', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'meeting', label: 'Reunión', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'lunch', label: 'Comida', icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'break', label: 'Descanso', icon: Coffee, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 'focus', label: 'Focus', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];
