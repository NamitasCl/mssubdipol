import React, { useState } from 'react';
import { useAuth } from './components/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import PdiLogo from "./assets/imagenes/pdilogo.png";

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isDevMode) {
                // Dev Login bypass
                await login({ username, isDev: true });
            } else {
                // Standard Login
                await login({ username, password });
            }
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Credenciales incorrectas. Verifique e intente nuevamente.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pdi-base via-slate-900 to-slate-900 opacity-90"></div>
                <div className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-pdi-medio/10 rounded-full blur-3xl"></div>
            </div>

            {/* Back Button */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => window.location.href = "https://rac.investigaciones.cl/opciones/"}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full text-sm font-medium border border-white/10 backdrop-blur-md transition-all flex items-center gap-2 group"
                >
                    Volver a RAC
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pdi-dorado via-transparent to-pdi-dorado opacity-50"></div>

                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4 group">
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity rounded-full"></div>
                            <img
                                src={PdiLogo}
                                alt="Logo PDI"
                                className="h-20 w-auto relative drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h2 className="text-white font-bold text-2xl tracking-wide text-center mb-1">
                            PLANA MAYOR SUBDIPOL
                        </h2>
                        <p className="text-blue-200/80 text-sm tracking-widest uppercase font-medium">
                            Acceso Institucional
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-blue-100 text-xs font-semibold uppercase tracking-wider ml-1">Usuario</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300 group-focus-within:text-pdi-dorado transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pdi-dorado/50 focus:border-pdi-dorado/50 transition-all"
                                    placeholder="Ingrese su usuario"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-blue-100 text-xs font-semibold uppercase tracking-wider ml-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300 group-focus-within:text-pdi-dorado transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pdi-dorado/50 focus:border-pdi-dorado/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                <span className="text-red-200 text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-bold py-3.5 rounded-xl shadow-md border-b-4 active:border-b-0 active:translate-y-1 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDevMode
                                ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-800"
                                : "bg-yellow-500 hover:bg-yellow-500 text-slate-900 border-yellow-600"
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isDevMode ? "INGRESAR (DEV MODE)" : "INGRESAR AL SISTEMA"}
                                    {isDevMode ? <Lock size={20} className="text-white/80" /> : <ShieldCheck size={20} className="text-slate-900/80" />}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Dev Mode Toggle */}
                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={() => setIsDevMode(!isDevMode)}
                            className="text-xs text-slate-600 hover:text-purple-400 transition-colors flex items-center gap-1"
                        >
                            <User size={10} /> {isDevMode ? "Volver a Modo Producción" : "Modo Desarrollador"}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-xs">
                            Sistema Integrado de Gestión de Servicios
                        </p>
                        <p className="text-slate-500 text-[10px] mt-1">
                            © {new Date().getFullYear()} Subdirección de Investigación Policial y Criminalística
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;