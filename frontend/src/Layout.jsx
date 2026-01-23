import React, { useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, ChevronRight, ChevronDown, Menu } from "lucide-react";
import PdiLogo from "./assets/imagenes/pdilogo.png";
import { useAuth } from "./components/contexts/AuthContext.jsx";
import clsx from "clsx";

// ROLES
const ROLES = {
    ADMINISTRADOR: "ROLE_ADMINISTRADOR",
    SUBJEFE: "ROLE_SUBJEFE",
    SECUIN: "ROLE_SECUIN",
    JEFE: "ROLE_JEFE",
    FUNCIONARIO: "ROLE_FUNCIONARIO",
    PMSUBDIPOL: "ROLE_PMSUBDIPOL",
    TURNOS: "ROLE_TURNOS",
    TURNOS_RONDA: "ROLE_TURNOS_RONDA"
};

// MENÚ DE NAVEGACIÓN
const navConfig = [
    {
        label: "Dashboard Principal",
        to: "/",
        allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.SECUIN, ROLES.JEFE, ROLES.FUNCIONARIO, ROLES.PMSUBDIPOL, ROLES.TURNOS, ROLES.TURNOS_RONDA],
    },
    {
        label: "Inicio",
        to: "/layout",
        allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.SECUIN, ROLES.JEFE, ROLES.FUNCIONARIO],
    },
    {
        label: "Mis Turnos",
        to: "/layout/calendario",
        allowedRoles: [ROLES.FUNCIONARIO, ROLES.ADMINISTRADOR, ROLES.JEFE, ROLES.SUBJEFE],
    },
    {
        label: "Gestión Unidad",
        allowedRoles: [ROLES.JEFE, ROLES.SUBJEFE, ROLES.ADMINISTRADOR, ROLES.TURNOS, ROLES.TURNOS_RONDA],
        submenu: [
            { label: "Aportar Funcionarios", to: "/layout/asignacionunidad" },
            { label: "Modificar Servicios", to: "/layout/modificaturnosunidad" },
        ]
    },
    {
        label: "Administración Turnos",
        allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SECUIN, ROLES.PMSUBDIPOL],
        submenu: [
             { label: "Gestión de Turnos", to: "/layout/gestion" },
             { label: "Personal Disponible", to: "/layout/disponibles" },
             { label: "Plantillas", to: "/layout/plantillas" },
        ]
    },
    {
        label: "Zona Jefatura",
        to: "/layout/jefe",
        allowedRoles: [ROLES.ADMINISTRADOR, ROLES.JEFE],
    },
];

export default function Layout({ children }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleClickLogout = () => {
        logout();
        window.location.href = "/turnos/login";
    };

    const visibleNavItems = useMemo(() => {
        if (user && user.roles) {
            return navConfig.filter((item) =>
                item.allowedRoles?.some((rol) => user.roles.includes(rol))
            );
        }
        return [];
    }, [user]);

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
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
                                    Plataforma Gestión de Turnos
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
                        {visibleNavItems.map((item) => {
                            const isSubmenu = !!item.submenu;
                            const isActive = location.pathname === item.to;
                            const isAnySubActive = isSubmenu && item.submenu.some((sub) => location.pathname === sub.to);
                            const isOpen = openMenus[item.label] || isAnySubActive;

                            if (isSubmenu) {
                                return (
                                    <div key={item.label} className="mb-1">
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={clsx(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 outline-none",
                                                isAnySubActive 
                                                    ? "bg-blue-50 text-pdi-base shadow-sm ring-1 ring-blue-100" 
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isAnySubActive ? "bg-pdi-base" : "bg-gray-300"}`}></div>
                                                {item.label}
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={clsx("transition-transform duration-200", isOpen && "rotate-180")}
                                            />
                                        </button>

                                        <div 
                                            className={clsx(
                                                "overflow-hidden transition-all duration-300 ease-in-out",
                                                isOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"
                                            )}
                                        >
                                            <div className="pl-4 pr-2 flex flex-col gap-1 border-l-2 border-gray-100 ml-6">
                                                {item.submenu.map((subitem) => {
                                                    const isSubActive = location.pathname === subitem.to;
                                                    return (
                                                        <Link
                                                            key={subitem.to}
                                                            to={subitem.to}
                                                            className={clsx(
                                                                "block px-4 py-2.5 rounded-lg text-sm transition-colors",
                                                                isSubActive 
                                                                    ? "text-pdi-base font-semibold bg-blue-50/50" 
                                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                                                            )}
                                                        >
                                                            {subitem.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Regular Item
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
                                    {isActive ? <ChevronRight size={18} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1"></div>}
                                    {item.label}
                                </Link>
                            );
                        })}
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