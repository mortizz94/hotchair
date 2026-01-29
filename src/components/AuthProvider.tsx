import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
    id: string;
    name: string;
    code: string;
    role: 'admin' | 'user';
};

interface AuthContextType {
    user: User | null;
    login: (code: string, pin: string) => Promise<void>;
    logout: () => void;
    deleteAccount: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hotchair_user');
        window.location.href = '/login'; // Force reload/redirect
    };

    const deleteAccount = async () => {
        if (!user) return;
        if (!confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return;

        try {
            await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
            logout();
        } catch (e) {
            alert('Error al eliminar cuenta');
        }
    };

    // Version Check
    useEffect(() => {
        const checkVersion = async () => {
            try {
                const res = await fetch('/version.json');
                if (res.ok) {
                    const remoteVersion = await res.json() as { version: string };
                    const localVersion = localStorage.getItem('hotchair_version');

                    if (localVersion && localVersion !== remoteVersion.version) {
                        localStorage.setItem('hotchair_version', remoteVersion.version);
                        window.location.reload(); // Reload if new version
                    } else if (!localVersion) {
                        localStorage.setItem('hotchair_version', remoteVersion.version);
                    }
                }
            } catch (e) {
                console.error('Version check failed', e);
            }
        };

        const interval = setInterval(checkVersion, 60000); // Check every minute
        checkVersion(); // Initial check

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('hotchair_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (code: string, pin: string) => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, pin }),
        });

        if (!res.ok) {
            const err = await res.json() as { error?: string };
            throw new Error((err.error === 'Invalid credentials' ? 'Credenciales incorrectas' : 'Error al iniciar sesión'));
        }

        const data = await res.json() as { user: User };
        setUser(data.user);
        localStorage.setItem('hotchair_user', JSON.stringify(data.user));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, deleteAccount, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
