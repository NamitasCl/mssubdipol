import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import FormulariosLayout from "./FormulariosLayout";

// Fallback URL for forms API
const FORMS_API_URL = import.meta.env.VITE_FORMS_API_URL || 'http://localhost:8012/api/formularios';

// Dashboard with actionable metrics and bold colors
function DashboardMetrics({ stats, loading }) {
    const tarjetas = [
        {
            label: "Cuota Pendiente",
            value: stats?.pendiente ?? "-",
            sublabel: "registros por completar",
            icon: <ClipboardList size={28} className="text-white" />,
            bgColor: "bg-gradient-to-br from-blue-600 to-blue-700",
            textColor: "text-white"
        },
        {
            label: "Urgentes",
            value: stats?.urgentes ?? "-",
            sublabel: "vencen en < 3 días",
            icon: <AlertTriangle size={28} className="text-white" />,
            bgColor: stats?.urgentes > 0
                ? "bg-gradient-to-br from-red-500 to-red-600"
                : "bg-gradient-to-br from-gray-400 to-gray-500",
            textColor: "text-white"
        },
        {
            label: "Completados",
            value: stats?.completados ?? "-",
            sublabel: "tareas terminadas",
            icon: <CheckCircle2 size={28} className="text-white" />,
            bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            textColor: "text-white"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tarjetas.map((t, i) => (
                <div
                    key={i}
                    className={`${t.bgColor} rounded-xl shadow-lg p-6 flex items-center gap-4 transition hover:shadow-xl hover:scale-[1.02]`}
                >
                    <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                        {t.icon}
                    </div>
                    <div>
                        <div className={`text-3xl font-bold ${t.textColor}`}>
                            {loading ? (
                                <div className="animate-pulse h-9 w-16 bg-white/30 rounded"></div>
                            ) : (
                                t.value
                            )}
                        </div>
                        <div className={`text-sm font-semibold ${t.textColor} opacity-90`}>{t.label}</div>
                        <div className={`text-xs ${t.textColor} opacity-70`}>{t.sublabel}</div>
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

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        // Fetch cuotas assigned to me
        fetch(`${FORMS_API_URL}/dinamico/cuotas/mis`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => res.json())
            .then(cuotas => {
                if (!Array.isArray(cuotas)) {
                    setStats({ pendiente: 0, urgentes: 0, completados: 0 });
                    return;
                }

                // Fetch form definitions to get deadlines
                fetch(`${FORMS_API_URL}/dinamico/definicion`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
                    .then(res => res.json())
                    .then(formularios => {
                        const formMap = {};
                        (formularios || []).forEach(f => {
                            formMap[f.id] = f;
                        });

                        const now = new Date();
                        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

                        let pendiente = 0;
                        let urgentes = 0;
                        let completados = 0;

                        cuotas.forEach(c => {
                            const avance = c.avance ?? 0;
                            const cuotaAsignada = c.cuotaAsignada ?? 0;
                            const restante = cuotaAsignada - avance;

                            if (restante <= 0) {
                                completados++;
                            } else {
                                pendiente += restante;

                                // Check if form has deadline and it's within 3 days
                                const form = formMap[c.formularioId];
                                if (form?.fechaLimite) {
                                    const deadline = new Date(form.fechaLimite);
                                    if (deadline <= threeDaysFromNow && deadline > now) {
                                        urgentes++;
                                    }
                                }
                            }
                        });

                        setStats({ pendiente, urgentes, completados });
                    })
                    .catch(() => setStats({ pendiente: 0, urgentes: 0, completados: 0 }));
            })
            .catch(() => setStats({ pendiente: 0, urgentes: 0, completados: 0 }))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <FormulariosLayout>
            <div className="min-h-[calc(100vh-140px)]">
                {/* Dashboard Metrics */}
                <DashboardMetrics stats={stats} loading={loading} />

                {/* Main Content */}
                <Outlet />
            </div>
        </FormulariosLayout>
    );
};

export default ServiciosEspecialesPanelLayout;