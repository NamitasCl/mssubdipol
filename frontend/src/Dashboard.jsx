import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUsers,
    FaShieldAlt,
    FaCalendarAlt,
    FaCogs,
    FaClipboardList,
    FaUserCheck,
    FaUserShield,
    FaListAlt
} from "react-icons/fa";
import { useAuth } from "./components/contexts/AuthContext.jsx";

// Paleta institucional consistente con tailwind.config.js
const azulPDI = "#2a4d7c"; // pdi.base
const doradoPDI = "#ffe8a3"; // pdi.dorado
const grisOscuro = "#22334a"; // pdi.texto
// Colores auxiliares para iconos (no para texto)
const blanco = "#ffffff";
const azulSuave = "#4f7eb9"; // pdi.medio
const azulOscuro = "#1e3a5c";
const verdeMenta = "#2d8a6e"; // Version más oscura para iconos

// Define tus tarjetas del dashboard aquí, cada una con su rol permitido
const CARDS = [
    {
        title: "Gestión por unidad",
        text: "Asigne los funcionarios que deben ser incluidos en el rol de guardias.",
        icon: <FaUserCheck size={34} />,
        route: "/layout/asignacionunidad",
        color: azulPDI, // Usar azul institucional
        roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Modificación de servicios",
        text: "Realice las modificaciones de los servicios que se han propuesto.",
        icon: <FaClipboardList size={34} />,
        route: "/layout/modificaturnosunidad",
        color: azulSuave,
        roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Gestión de turnos",
        text: "Configure y distribuya turnos entre las unidades colaboradoras.",
        icon: <FaClipboardList size={34} />,
        route: "/layout/gestion",
        color: azulSuave,
        roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Personal disponible",
        text: "Consulte funcionarios disponibles para cada día del mes.",
        icon: <FaUsers size={34} />,
        route: "/layout/disponibles",
        color: verdeMenta,
        roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Área Jefatura",
        text: "Gestione y remueva subjefes de unidad.",
        icon: <FaUserShield size={34} />,
        route: "/layout/jefe",
        color: azulPDI,
        roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Ver turnos",
        text: "Visualice sus turnos mensuales y anuales.",
        icon: <FaCalendarAlt size={34} />,
        route: "/layout/calendario",
        color: azulOscuro,
        roles: ["ROLE_FUNCIONARIO", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Constructor plantillas servicios",
        text: "Construcción de plantillas de servicios.",
        icon: <FaCogs size={36} />,
        route: "/layout/plantillas",
        color: azulSuave,
        roles: ["ROLE_ADMINISTRADOR"]
    },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRoles = user?.roles || [];

    // Filtra las tarjetas según los roles permitidos para el usuario autenticado
    const visibleCards = CARDS.filter(card =>
        card.roles.some(role => userRoles.includes(role))
    );

    return (
        <div className="w-full">
            <div className="container-fluid px-4 max-w-[1450px] mx-auto pb-8">
                <h2
                    className="font-bold mb-6 uppercase text-2xl mt-6 border-l-[6px] pl-4"
                    style={{
                        color: azulPDI,
                        letterSpacing: ".05em",
                        borderColor: doradoPDI,
                    }}
                >
                    Panel principal de servicios
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleCards.map((mod, idx) => (
                        <div key={idx} className="h-full">
                            <div
                                className="h-full bg-white rounded-2xl border border-gray-100 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden flex flex-col group"
                                onClick={() => navigate(mod.route)}
                                style={{
                                    // Default border, but allowed to be overridden by hover
                                }}
                            >
                                {/* Hover Effect Border using pseudo-element or direct style updates */}
                                <div 
                                    className="absolute inset-0 border-2 border-transparent group-hover:border-current transition-colors duration-300 pointer-events-none rounded-2xl" 
                                    style={{ color: mod.color }}
                                ></div>

                                <div className="p-6 flex flex-col justify-between h-full w-full relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div 
                                            className="rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                width: "3.5rem",
                                                height: "3.5rem",
                                                background: `${mod.color}15`, // 15% opacity hex
                                                color: mod.color,
                                            }}
                                        >
                                            {mod.icon}
                                        </div>
                                        <h3 
                                            className="text-lg font-bold uppercase tracking-tight m-0 leading-tight"
                                            style={{ color: azulPDI }} 
                                        >
                                            {mod.title}
                                        </h3>
                                    </div>
                                    <p 
                                        className="text-sm font-medium leading-relaxed"
                                        style={{ minHeight: "48px", color: grisOscuro }}
                                    >
                                        {mod.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}