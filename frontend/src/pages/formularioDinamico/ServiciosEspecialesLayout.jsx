import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { ClipboardList, CheckCircle, UserCheck, Plus } from "lucide-react";
import Layout from "../../Layout";

// EstadisticasPanel refactored with Tailwind
function EstadisticasPanel({ stats, loading }) {
    const tarjetas = [
        {
            label: "Formularios creados",
            value: stats?.creados ?? "-",
            icon: <ClipboardList size={28} className="text-blue-500" />,
            borderColor: "border-blue-500",
            bgIcon: "bg-blue-50"
        },
        {
            label: "Formularios activos",
            value: stats?.activos ?? "-",
            icon: <CheckCircle size={28} className="text-emerald-500" />,
            borderColor: "border-emerald-500",
            bgIcon: "bg-emerald-50"
        },
        {
            label: "Asignados a mí",
            value: stats?.asignados ?? "-",
            icon: <UserCheck size={28} className="text-gray-500" />,
            borderColor: "border-gray-500",
            bgIcon: "bg-gray-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tarjetas.map((t, i) => (
                <div 
                    key={i} 
                    className={`bg-white rounded-xl shadow-sm border-l-4 ${t.borderColor} p-6 flex items-center gap-4 transition hover:shadow-md`}
                >
                    <div className={`p-3 rounded-lg ${t.bgIcon}`}>
                        {t.icon}
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loading ? <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div> : t.value}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">{t.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const ServiciosEspecialesPanelLayout = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        Promise.all([
            // Formularios creados por el usuario
            fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/creador/${user.idFuncionario}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(res => res.json()),
            // Todos los formularios
            fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(res => res.json()),
            // Cuotas asignadas al usuario
            fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/mis`, {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(res => res.json())
        ])
            .then(([misFormularios, todosFormularios, cuotas]) => {
                setStats({
                    creados: Array.isArray(misFormularios) ? misFormularios.length : "-",
                    activos: Array.isArray(todosFormularios) ? todosFormularios.filter(f => f.activo !== false).length : "-",
                    asignados: Array.isArray(cuotas) ? cuotas.length : "-"
                });
            })
            .catch(() => setStats({}))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <Layout>
            <div className="relative min-h-[calc(100vh-140px)]">
                {/* Stats Panel */}
                <EstadisticasPanel stats={stats} loading={loading} />

                {/* Main Content */}
                <div className="bg-white rounded-xl">
                    <Outlet />
                </div>

                {/* Floating Action Button */}
                <button
                    onClick={() => navigate("/formularios/crear-formulario")}
                    className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group z-50 transform hover:scale-105"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-bold text-lg">Nuevo Formulario</span>
                </button>
            </div>
        </Layout>
    );
};

export default ServiciosEspecialesPanelLayout;