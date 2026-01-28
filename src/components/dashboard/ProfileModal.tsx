import { useState, useEffect } from 'react';
import { X, Settings, Briefcase } from 'lucide-react';
import { User, Department } from '../../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    onUpdateProfile: (data: { userId: string, newPin?: string, departmentId?: number }) => Promise<boolean>;
}

export function ProfileModal({ isOpen, onClose, currentUser, onUpdateProfile }: ProfileModalProps) {
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [departmentId, setDepartmentId] = useState<number | undefined>(currentUser?.departmentId);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [profileMessage, setProfileMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDepartmentId(currentUser?.departmentId);
            setNewPin('');
            setConfirmPin('');
            setProfileMessage(null);

            fetch('/api/departments')
                .then(res => res.json())
                .then(data => setDepartments(data as Department[]))
                .catch(console.error);
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);

        if (newPin && newPin.length < 4) {
            setProfileMessage({ text: 'El PIN debe tener al menos 4 caracteres', type: 'error' });
            return;
        }

        if (newPin && newPin !== confirmPin) {
            setProfileMessage({ text: 'Los PINs no coinciden', type: 'error' });
            return;
        }

        if (!currentUser) return;

        setIsSubmitting(true);
        try {
            const success = await onUpdateProfile({
                userId: currentUser.id,
                newPin: newPin || undefined,
                departmentId
            });

            if (success) {
                setProfileMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
                setNewPin('');
                setConfirmPin('');
                setTimeout(onClose, 2000);
            } else {
                setProfileMessage({ text: 'Error al actualizar', type: 'error' });
            }
        } catch (e) {
            setProfileMessage({ text: 'Error inesperado', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm glass-card rounded-2xl p-8 border border-white/10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Settings size={32} className="text-zinc-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Configuración</h3>
                    <p className="text-zinc-500 text-sm">Actualiza tu seguridad</p>
                </div>

                {profileMessage && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${profileMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {profileMessage.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Nuevo PIN</label>
                        <input
                            type="password"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-700 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-center tracking-[0.5em] font-mono text-lg"
                            placeholder="••••"
                            maxLength={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Confirmar PIN</label>
                        <input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-700 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-center tracking-[0.5em] font-mono text-lg"
                            placeholder="••••"
                            maxLength={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Departamento</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <select
                                value={departmentId || ''}
                                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none"
                            >
                                <option value="">Sin departamento</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
