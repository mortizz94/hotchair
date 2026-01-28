import { useState, useEffect } from 'react';
import { Department } from '../types';
import { Plus, Trash2, Edit2, Save, X, Briefcase } from 'lucide-react';

export default function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState('#a855f7'); // default purple

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json() as Department[];
                setDepartments(data);
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
                body: JSON.stringify({ name, color })
            });
            if (res.ok) {
                fetchDepartments();
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
                body: JSON.stringify({ id, name, color })
            });
            if (res.ok) {
                fetchDepartments();
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
            fetchDepartments();
        } catch (e) {
            console.error(e);
        }
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setName(dept.name);
        setColor(dept.color);
        setIsCreating(true);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setName('');
        setColor('#a855f7');
    };

    return (
        <div className="p-10 max-w-6xl mx-auto min-h-screen">
            <header className="flex justify-between items-center mb-10">
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
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="Ej. Ingeniería"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-10 w-20 rounded cursor-pointer bg-transparent border-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                            >
                                <Save size={18} /> Guardar
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="text-white">Cargando...</div>
                ) : departments.map((dept) => (
                    <div key={dept.id} className="glass p-6 rounded-2xl border-l-4 flex justify-between items-center group hover:bg-white/5 transition-all" style={{ borderLeftColor: dept.color }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: dept.color }}>
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                                <p className="text-xs text-zinc-500 font-mono">ID: {dept.id}</p>
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
