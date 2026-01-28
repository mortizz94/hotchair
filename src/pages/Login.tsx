import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [pin, setPin] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(code, pin);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 border border-border shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3">
                        <Flame size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Hot<span className="text-orange-600">Chair</span>
                    </h1>

                </div>

                {error && (
                    <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-900 rounded-md">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="code" className="sr-only">Código</label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                className="relative block w-full appearance-none rounded-t-md border border-input bg-background/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="Código de Empleado (EMP001)"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="pin" className="sr-only">PIN</label>
                            <input
                                id="pin"
                                name="pin"
                                type="password"
                                required
                                className="relative block w-full appearance-none rounded-b-md border border-input bg-background/50 px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground select-none">
                            He leído y acepto la <Link to="/privacy" className="underline hover:text-orange-500 font-medium">Política de Privacidad</Link> y el procesamiento de mis datos bajo el RGPD.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !acceptedTerms}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                    >
                        {loading ? 'Entrando...' : 'Entrar a la Oficina'}
                    </button>
                </form>
            </div>
        </div>
    );
}
