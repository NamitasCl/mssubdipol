import React from "react";
import { Link } from "react-router-dom";
import { FaRegCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "./components/contexts/AuthContext.jsx";

export default function Dashboard() {
    const { user } = useAuth();
    
    // Mock Data - In a real app this would come from an API
    const nextShift = { date: "Mañana, 24 Ene", time: "08:00 - 20:00", type: "Servicio Guardia" };
    const pendingTasks = 2;

    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-pdi-base to-pdi-medio rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-12"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Bienvenido, {user?.nombreUsuario || "Funcionario"}</h1>
                    <p className="text-blue-100/90 text-lg">Panel General de Gestión de Servicios</p>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Next Shift Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-gray-500">
                        <FaRegCalendarAlt />
                        <span className="text-xs font-bold uppercase tracking-wider">Próximo Servicio</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{nextShift.date}</div>
                    <div className="text-pdi-base font-semibold flex items-center gap-2">
                        <FaClock />
                        {nextShift.time}
                    </div>
                    <div className="mt-3 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        {nextShift.type}
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-gray-500">
                            <FaExclamationTriangle />
                            <span className="text-xs font-bold uppercase tracking-wider">Gestión Pendiente</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{pendingTasks}</div>
                        <div className="text-gray-400 text-sm">Validaciones requeridas</div>
                    </div>
                    <Link to="/layout/asignacionunidad" className="mt-4 text-sm font-semibold text-pdi-base hover:text-blue-700 hover:underline">
                        Ir a Gestión &rarr;
                    </Link>
                </div>

                {/* Quick Status */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                        <FaCheckCircle className="text-emerald-500 text-2xl" />
                    </div>
                    <div className="font-bold text-gray-800">Sistema Operativo</div>
                    <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full mt-2">
                        Todos los servicios OK
                    </div>
                </div>
            </div>
            
            {/* Recent Activity or Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Zona de Navegación</h3>
                    <p className="text-gray-500 mb-6 text-sm">
                        Utiliza el menú lateral izquierdo para acceder a todas las funcionalidades del sistema (Gestión de Unidades, Mis Turnos, Configuración).
                    </p>
                </div>
            </div>
        </div>
    );
}