import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

type User = {
    id: string;
    name: string;
    code: string;
    role: 'admin' | 'user';
    pin: string; // Visible for admin
};

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');

    // Security Redirect
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json() as User[];
                setUsers(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, code: newCode, pin: newPin, role: newRole })
        });

        if (res.ok) {
            setNewName('');
            setNewCode('');
            setNewPin('');
            fetchUsers();
        } else {
            alert('Error creating user (Code might be duplicate)');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;

        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    // IP Management
    type AllowedIp = { id: number, ip: string, label: string, createdAt: number };
    const [ips, setIps] = useState<AllowedIp[]>([]);
    const [newIp, setNewIp] = useState('');
    const [newLabel, setNewLabel] = useState('');

    const fetchIps = async () => {
        if (!user) return;
        const res = await fetch(`/api/ips?userId=${user.id}`);
        if (res.ok) {
            const data = await res.json();
            setIps(data);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchIps();
        }
    }, [user]);

    const handleAddIp = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/ips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, ip: newIp, label: newLabel })
        });
        if (res.ok) {
            setNewIp('');
            setNewLabel('');
            fetchIps();
        } else {
            alert('Error al añadir IP');
        }
    };

    const handleDeleteIp = async (id: number) => {
        if (!confirm('¿Eliminar IP?')) return;
        await fetch(`/api/ips?userId=${user?.id}&id=${id}`, { method: 'DELETE' });
        fetchIps();
    };

    if (loading) return <div className="p-10">Cargando...</div>;

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <header className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Administración</h1>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={20} /> Volver
                </button>
            </header>

            <main className="max-w-4xl mx-auto space-y-10">
                {/* User Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* User List */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
                        <ul className="space-y-3">
                            {users.map(u => (
                                <li key={u.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <div className="font-bold">{u.name} {u.role === 'admin' && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-1 rounded">ADMIN</span>}</div>
                                        <div className="text-xs text-muted-foreground">Code: {u.code} | PIN: {u.pin}</div>
                                    </div>
                                    {u.id !== user?.id && (
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-500 hover:bg-red-900/20 p-2 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Create Form */}
                    <div className="bg-card rounded-xl border border-border p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Plus size={20} /> Nuevo Usuario</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input
                                    className="w-full bg-background border border-input rounded p-2"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Código (Login)</label>
                                <input
                                    className="w-full bg-background border border-input rounded p-2"
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">PIN</label>
                                <input
                                    className="w-full bg-background border border-input rounded p-2"
                                    value={newPin}
                                    onChange={e => setNewPin(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rol</label>
                                <select
                                    className="w-full bg-background border border-input rounded p-2"
                                    value={newRole}
                                    onChange={(e: any) => setNewRole(e.target.value)}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <button className="w-full bg-primary text-primary-foreground py-2 rounded font-bold hover:bg-primary/90">
                                Crear Usuario
                            </button>
                        </form>
                    </div>
                </section>

                {/* IP Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-border">
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h2 className="text-xl font-semibold mb-4">IPs Permitidas (Oficinas)</h2>
                        <ul className="space-y-3">
                            {ips.length === 0 && <li className="text-muted-foreground text-sm">No hay IPs configuradas.</li>}
                            {ips.map(ip => (
                                <li key={ip.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <div className="font-bold font-mono">{ip.ip}</div>
                                        {ip.label && <div className="text-xs text-muted-foreground">{ip.label}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteIp(ip.id)}
                                        className="text-red-500 hover:bg-red-900/20 p-2 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Plus size={20} /> Añadir IP</h2>
                        <form onSubmit={handleAddIp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Dirección IP</label>
                                <input
                                    className="w-full bg-background border border-input rounded p-2 font-mono"
                                    value={newIp}
                                    onChange={e => setNewIp(e.target.value)}
                                    placeholder="ej. 46.25.210.138"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Etiqueta (Opcional)</label>
                                <input
                                    className="w-full bg-background border border-input rounded p-2"
                                    value={newLabel}
                                    onChange={e => setNewLabel(e.target.value)}
                                    placeholder="ej. Oficina Principal"
                                />
                            </div>
                            <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold transition-colors">
                                Añadir IP Permitida
                            </button>
                        </form>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-10 border-t border-border">
                    <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                            <Trash2 size={24} /> Zona de Peligro
                        </h2>
                        <p className="text-zinc-400 mb-6">
                            Estas acciones son destructivas y no se pueden deshacer.
                        </p>

                        <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                            <div>
                                <h3 className="font-bold text-white">Reiniciar Día</h3>
                                <p className="text-sm text-zinc-500">Elimina toda la asistencia y los votos de HOY.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm('¿ESTÁS SEGURO? Esto borrará todos los fichajes y votos de hoy.')) {
                                        const res = await fetch('/api/admin/reset', { method: 'POST' });
                                        if (res.ok) alert('Día reiniciado correctamente');
                                        else alert('Error al reiniciar');
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold transition-colors"
                            >
                                Reiniciar Todo
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
