import { useState, useEffect } from 'react';
import { Department } from '../types';
import { Plus, Trash2, Edit2, Save, X, Briefcase, User as UserIcon } from 'lucide-react';

interface UserSimple {
    id: string;
    name: string;
    avatar?: string;
}

export default function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<UserSimple[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState('#a855f7'); // default purple
    const [managerId, setManagerId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deptRes, usersRes] = await Promise.all([
                fetch('/api/departments'),
                fetch('/api/users')
            ]);

            if (deptRes.ok) {
                const data = await deptRes.json() as Department[];
                setDepartments(data);
            }
            if (usersRes.ok) {
                const usersData = await usersRes.json() as UserSimple[];
                setUsers(usersData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color, managerId: managerId || null })
            });
            if (res.ok) {
                fetchData();
                resetForm();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            const res = await fetch('/api/departments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, color, managerId: managerId || null })
            });
            if (res.ok) {
                fetchData();
                resetForm();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar este departamento?')) return;
        try {
            await fetch(`/api/departments?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setName(dept.name);
        setColor(dept.color);
        setManagerId(dept.managerId || '');
        setIsCreating(true);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setName('');
        setColor('#a855f7');
        setManagerId('');
    };

    return (
        <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Departamentos</h1>
                    <p className="text-zinc-400">Gestiona la estructura de tu organización</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} /> Nuevo Departamento
                </button>
            </header>

            {isCreating && (
                <div className="mb-8 p-6 glass-card rounded-2xl animate-fade-in border border-purple-500/30">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Departamento' : 'Crear Departamento'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="Ej. Ingeniería"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Responsable</label>
                            <select
                                value={managerId}
                                onChange={(e) => setManagerId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none"
                            >
                                <option value="">Sin asignar</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Color</label>
                            <div className="flex items-center gap-2 h-10">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-10 w-full rounded cursor-pointer bg-transparent border-none"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-1 flex gap-2">
                            <button
                                onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                            >
                                <Save size={18} />
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="text-white">Cargando...</div>
                ) : departments.map((dept) => (
                    <div key={dept.id} className="glass p-6 rounded-2xl border-l-4 flex flex-col gap-4 group hover:bg-white/5 transition-all" style={{ borderLeftColor: dept.color }}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: dept.color }}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                                    {dept.managerName && (
                                        <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                                            <UserIcon size={12} />
                                            <span>{dept.managerName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(dept)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(dept.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-500 font-mono text-right mt-auto">ID: {dept.id}</div>
                    </div>
                ))}

                {!loading && departments.length === 0 && (
                    <div className="col-span-full text-center py-20 text-zinc-500">
                        No hay departamentos creados aún.
                    </div>
                )}
            </div>
        </div>
    );
}
