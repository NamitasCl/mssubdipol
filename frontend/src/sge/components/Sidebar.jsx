import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Map, FileSpreadsheet, Flame, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const isAdminOrJefe = user?.roles?.some(r => r.includes("ADMINISTRADOR") || r.includes("JEFE"));

    const navItems = [
        { to: "/sge", icon: <LayoutDashboard size={20} />, text: "Dashboard SGE", public: true },
        { to: "/sge/disponibilidad/reportar", icon: <Users size={20} />, text: "Reportar Disponibilidad", public: true },
        // Restricted Items
        { to: "/sge/eventos", icon: <Flame size={20} />, text: "Eventos", restricted: true },
        { to: "/sge/despliegues", icon: <Map size={20} />, text: "Despliegues", restricted: true },
        { to: "/sge/funcionarios", icon: <Users size={20} />, text: "Funcionarios", restricted: true },
        { to: "/sge/vehiculos", icon: <Truck size={20} />, text: "Vehículos", restricted: true },
        { to: "/sge/inventario", icon: <FileSpreadsheet size={20} />, text: "Inventario", restricted: true },
        { to: "/sge/familiares", icon: <Users size={20} />, text: "Registro Afectados", restricted: true },
    ].filter(item => item.public || (item.restricted && isAdminOrJefe));

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-2xl lg:shadow-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-pdi-base text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg text-pdi-dorado backdrop-blur-md">
                            <LayoutDashboard size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-wide leading-none">SGE PDI</span>
                            <span className="text-[10px] text-pdi-claro uppercase tracking-wider font-medium mt-0.5">Gestión de Eventos</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-slate-50">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Menú Principal
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={({ isActive }) => `
                                flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm group
                                ${isActive
                                    ? 'bg-gradient-to-r from-pdi-base to-pdi-base/90 text-white shadow-md shadow-blue-900/20'
                                    : 'text-gray-600 hover:bg-white hover:text-pdi-base hover:shadow-sm'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className={`transition-colors ${isActive ? 'text-pdi-dorado' : 'text-gray-400 group-hover:text-pdi-base'}`}>
                                            {item.icon}
                                        </div>
                                        <span>{item.text}</span>
                                    </div>
                                    {isActive && <ChevronRight size={16} className="text-pdi-claro" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <a
                        href="http://localhost:5173/turnos"
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm group text-gray-600 hover:bg-white hover:text-pdi-base hover:shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-gray-400 group-hover:text-pdi-base transition-colors">
                                <ArrowLeft size={20} />
                            </div>
                            <span>Volver al Dashboard principal</span>
                        </div>
                    </a>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-700">Sistema Operativo</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
