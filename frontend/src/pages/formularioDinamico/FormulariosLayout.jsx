import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { User, LogOut, ChevronRight, Menu, ClipboardList, PlusCircle, FolderOpen, LayoutDashboard, Settings, Home } from "lucide-react";
import PdiLogo from "../../assets/imagenes/pdilogo.png";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import clsx from "clsx";

// Navigation config for Formularios module
const getNavConfig = (user) => {
    const items = [
        {
            label: "Mis Tareas",
            to: "/formularios",
            icon: LayoutDashboard,
        },
        {
            label: "Crear Formulario",
            to: "/formularios/crear-formulario",
            icon: PlusCircle,
        },
    ];

    // Admin-only link
    if (user?.roles?.includes("ROLE_ADMINISTRADOR")) {
        items.push({
            label: "Administrar",
            to: "/formularios/admin",
            icon: Settings,
        });
    }

    return items;
};

export default function FormulariosLayout({ children }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    console.log(user);

    const handleClickLogout = () => {
        logout();
        window.location.href = "/turnos/login";
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <nav className="bg-pdi-base text-white shadow-lg sticky top-0 z-50 h-16 flex-shrink-0">
                <div className="container-fluid px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src={PdiLogo} alt="Logo" className="h-10 w-auto drop-shadow-md" />
                            <div className="hidden sm:block">
                                <h4 className="font-bold text-lg tracking-wide leading-none text-white">
                                    Gestión de Formularios
                                </h4>
                                <span className="text-xs text-pdi-dorado font-medium opacity-90 block mt-1">
                                    Subdirección de Investigación Policial y Criminalística
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-pdi-medio/30 py-1.5 px-4 rounded-full border border-white/10 backdrop-blur-sm">
                            <User size={18} className="text-pdi-claro" />
                            <span className="font-semibold text-sm hidden md:inline-block text-white">
                                {user?.nombreUsuario || "Usuario"}
                            </span>
                        </div>
                        <button
                            onClick={handleClickLogout}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 md:px-4 md:py-1.5 flex items-center gap-2 font-medium transition-all text-sm group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden md:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <div
                    className={clsx(
                        "bg-white border-r border-gray-200 w-64 flex-shrink-0 transition-all duration-300 absolute lg:static top-0 bottom-0 z-40 shadow-xl lg:shadow-none h-full overflow-y-auto",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"
                    )}
                    style={{
                        height: 'calc(100vh - 64px)'
                    }}
                >
                    <div className="py-6 px-3 flex flex-col gap-1">
                        {/* Module Title */}
                        <div className="px-4 pb-4 mb-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <ClipboardList size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Formularios</h3>
                                    <p className="text-xs text-gray-500">Panel de gestión</p>
                                </div>
                            </div>
                        </div>

                        {getNavConfig(user).map((item) => {
                            const isActive = location.pathname === item.to;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
                                        isActive
                                            ? "bg-pdi-base text-white shadow-md shadow-blue-900/20"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        {/* Dashboard Link - always at bottom */}
                        <div className="border-t border-gray-100 mt-4 pt-4">
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            >
                                <Home size={18} />
                                Ir al Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-full p-6 animate-in fade-in zoom-in-95 duration-300">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
}
