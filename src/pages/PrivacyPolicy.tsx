import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, Server } from 'lucide-react';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/login')}
                    className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al inicio
                </button>

                <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-orange-500/10 rounded-2xl">
                            <ShieldCheck size={40} className="text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Política de Privacidad</h1>
                            <p className="text-muted-foreground mt-1">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-8 text-zinc-300">
                        <section>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                <Lock size={20} className="text-blue-400" /> 1. Responsable del Tratamiento
                            </h2>
                            <p>
                                De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se le informa que los datos personales recogidos en esta aplicación ("HotChair") serán tratados por la organización responsable del entorno laboral.
                            </p>
                            <p className="text-sm bg-zinc-900/50 p-4 rounded-lg mt-2 border border-zinc-800">
                                <strong>Nota:</strong> Esta aplicación es una herramienta interna de gestión y gamificación laboral. El responsable legal es su empleador.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                <Eye size={20} className="text-green-400" /> 2. Finalidad del Tratamiento
                            </h2>
                            <p>
                                Sus datos (Nombre, Código de Empleado, Estado de Presencia, y actividad en la plataforma) se recogen con las siguientes finalidades:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Registro de asistencia y gestión de espacios en la oficina.</li>
                                <li>Participación en dinámicas de gamificación interna (votos, insignias, rachas).</li>
                                <li>Estadísticas internas de uso de las instalaciones.</li>
                            </ul>
                            <p className="mt-4">
                                <strong>Base de Legitimación:</strong> El tratamiento se basa en la ejecución de la relación contractual laboral y/o su consentimiento explícito al utilizar esta herramienta opcional.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                <Server size={20} className="text-purple-400" /> 3. Conservación y Derechos
                            </h2>
                            <p>
                                Los datos se conservarán mientras dure su relación con la entidad o hasta que solicite su supresión. No se cederán datos a terceros salvo obligación legal.
                            </p>
                            <p className="mt-4 font-bold text-white">Sus Derechos:</p>
                            <p>
                                Puede ejercer sus derechos de acceso, rectificación, supresión, limitación y oposición contactando con el departamento de administración o RRHH de su organización.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        <p>Al hacer clic en "Aceptar" en la pantalla de inicio, usted reconoce haber leído y entendido esta información.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
