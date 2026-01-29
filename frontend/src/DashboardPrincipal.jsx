import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Map, FileText, Calendar, Settings, ClipboardList, LogOut, ChevronRight, AlertCircle } from "lucide-react";
import sgeApi from "./api/sgeApi";
import PdiLogo from "./assets/imagenes/pdilogo.png";
import { useAuth } from "./components/contexts/AuthContext.jsx";



const iconMap = {
    Shield: <Shield size={32} />,
    Map: <Map size={32} />,
    FileText: <FileText size={32} />,
    Calendar: <Calendar size={32} />,
    Settings: <Settings size={32} />,
    ClipboardList: <ClipboardList size={32} />,
};

const getIcon = (iconName) => {
    if (iconMap[iconName]) return iconMap[iconName];
    return <AlertCircle size={32} />;
};

function Header() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-pdi-base/95 backdrop-blur-md border-b border-pdi-medio shadow-lg transition-all">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo Area */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate("/")}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <img src={PdiLogo} alt="Logo" className="h-12 w-auto relative z-10 drop-shadow-md" />
                    </div>
                    <div className="flex flex-col">
                        <span className="uppercase font-bold tracking-widest text-xs text-pdi-claro opacity-90">
                            Plana Mayor Subdipol
                        </span>
                        <span className="font-extrabold text-xl tracking-wide text-white leading-none">
                            RAC - SIGES
                        </span>
                    </div>
                </div>

                {/* User Actions */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-all hover:shadow-lg hover:border-white/30 backdrop-blur-sm"
                >
                    <span>Cerrar sesión</span>
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
}

const ModuleCard = ({ mod, onClick }) => {
    const colorVariants = {
        blue: "bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
        amber: "bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
        cyan: "bg-cyan-50 text-cyan-600 border-cyan-200 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600",
        slate: "bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-slate-600 group-hover:text-white group-hover:border-slate-600",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600",
    };

    const icon = getIcon(mod.iconName);

    return (
        <div
            onClick={onClick}
            className={`group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col w-full`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
                {React.cloneElement(icon, { size: 120 })}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-4 transition-colors duration-300 ${colorVariants[mod.color] || colorVariants.blue} shadow-sm`}>
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pdi-base transition-colors">
                        {mod.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {mod.description || mod.text}
                    </p>
                </div>

                <div className="flex items-center text-sm font-semibold text-pdi-medio group-hover:text-pdi-base transition-colors mt-2">
                    Ingresar <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};

export default function DashboardPrincipal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await sgeApi.get('/modules');
                setModules(res.data);
            } catch (error) {
                console.error("Error fetching modules", error);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-slate-50 pt-28 pb-12">
                <div className="container mx-auto max-w-6xl px-4">

                    {/* Hero Section */}
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1 w-10 bg-pdi-dorado rounded-full"></span>
                            <span className="text-pdi-medio font-semibold tracking-wider text-sm uppercase">Seleccione un módulo</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Panel Principal de <span className="text-pdi-base">Servicios</span>
                        </h2>
                        <p className="text-gray-500 mt-2 max-w-xl">
                            Bienvenido al sistema integrado RAC-SIGES. Seleccione el servicio que desea gestionar a continuación.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 text-center py-10 text-gray-400">Cargando módulos...</div>
                        ) : (Array.isArray(modules) ? modules : []).map((mod, idx) => {
                            // Check if module is enabled and user has role
                            if (!mod.enabled) return null;
                            if (mod.authorizedRoles && mod.authorizedRoles.length > 0) {
                                const hasRole = user?.roles?.some(rol => mod.authorizedRoles.includes(rol));
                                if (!hasRole) return null;
                            }

                            return (
                                <div key={mod.moduleKey || idx} className="animate-in fade-in zoom-in-95 duration-500 h-full w-full flex" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <ModuleCard mod={mod} onClick={() => navigate(mod.route)} />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer simple decoration */}
                <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pdi-base via-pdi-medio to-pdi-dorado"></div>
            </div>
        </>
    );
}