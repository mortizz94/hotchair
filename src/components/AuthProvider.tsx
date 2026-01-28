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
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hotchair_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
