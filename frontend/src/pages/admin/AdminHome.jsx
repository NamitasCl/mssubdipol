import React from "react";
import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    FileText,
    Database,
    Settings,
    ChevronRight
} from "lucide-react";

const adminModules = [
    {
        title: "Funcionarios",
        description: "Buscar y sincronizar datos de funcionarios desde la base externa.",
        to: "/admin/funcionarios",
        icon: Users,
        color: "blue"
    },
    {
        title: "Unidades",
        description: "Gestionar las unidades institucionales y su estructura jerárquica.",
        to: "/admin/unidades",
        icon: Building2,
        color: "emerald"
    },
    {
        title: "Formularios",
        description: "Administrar todos los formularios dinámicos del sistema.",
        to: "/admin/formularios",
        icon: FileText,
        color: "purple"
    }
];

const colorClasses = {
    blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        hover: "hover:bg-blue-100"
    },
    emerald: {
        bg: "bg-emerald-50",
        icon: "text-emerald-600",
        hover: "hover:bg-emerald-100"
    },
    purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        hover: "hover:bg-purple-100"
    }
};

export default function AdminHome() {
    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <Settings size={28} className="text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
                        <p className="text-gray-500 text-sm">Gestión centralizada del sistema RAC-SIGES</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <Database size={24} />
                        <div>
                            <div className="text-2xl font-bold">CommonServices</div>
                            <div className="text-blue-200 text-sm">Funcionarios y Unidades</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <FileText size={24} />
                        <div>
                            <div className="text-2xl font-bold">Formularios</div>
                            <div className="text-emerald-200 text-sm">Gestión de formularios dinámicos</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <Settings size={24} />
                        <div>
                            <div className="text-2xl font-bold">Sistema</div>
                            <div className="text-amber-200 text-sm">Configuración general</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminModules.map((mod, idx) => {
                    const colors = colorClasses[mod.color] || colorClasses.blue;
                    const Icon = mod.icon;

                    return (
                        <Link
                            key={idx}
                            to={mod.to}
                            className={`group bg-white rounded-xl border border-gray-200 p-6 transition-all hover:shadow-lg hover:border-gray-300 hover:-translate-y-1 ${colors.hover}`}
                        >
                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                                <Icon size={24} className={colors.icon} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{mod.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{mod.description}</p>
                            <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                                Acceder
                                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
