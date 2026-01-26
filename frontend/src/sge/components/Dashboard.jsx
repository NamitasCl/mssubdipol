import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, AlertTriangle, Users, Truck, Activity, MapPin, Calendar, ArrowRight, Flame, Shield } from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { token } = useAuth();
    const [kpis, setKpis] = useState({
        eventosActivos: 0,
        desplieguesActivos: 0,
        totalFuncionarios: 0,
        vehiculosTerreno: 0,
        alertasAbastecimiento: 0,
        regionData: {}
    });
    const [activeEvents, setActiveEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_SGE_API_URL || 'http://localhost:8080/api';
                const headers = { 'Authorization': `Bearer ${token}` };

                const [kpiRes, eventosRes] = await Promise.all([
                    fetch(`${baseUrl}/dashboard/kpis`, { headers }),
                    fetch(`${baseUrl}/eventos`, { headers })
                ]);

                if (kpiRes.ok) {
                    const kpiData = await kpiRes.json();
                    setKpis(kpiData);
                }

                if (eventosRes.ok) {
                    const eventosData = await eventosRes.json();
                    const active = eventosData
                        .filter(e => !e.estado || e.estado === 'ACTIVO')
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                        .slice(0, 5); // Take top 5 recent active
                    setActiveEvents(active);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    const chartData = Object.entries(kpis.regionData || {}).map(([name, value]) => ({ name, value }));

    const handleDownloadReport = () => {
        const baseUrl = import.meta.env.VITE_SGE_API_URL || 'http://localhost:8080/api';
        window.location.href = `${baseUrl}/reports/deployments/excel`;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando información del tablero...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Control Operativo</h1>
                <p className="text-gray-500">Resumen en tiempo real de operaciones y recursos.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Eventos Activos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.eventosActivos}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                        <Flame size={24} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Despliegues</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.desplieguesActivos}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Activity size={24} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Personal Desplegado</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.totalFuncionarios}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <Shield size={24} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Vehículos en Terreno</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.vehiculosTerreno}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                        <Truck size={24} />
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {kpis.alertasAbastecimiento > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-600" size={24} />
                        <div>
                            <p className="font-semibold text-red-900">Atención Requerida</p>
                            <p className="text-red-700 text-sm">Se detectaron {kpis.alertasAbastecimiento} despliegues con niveles críticos de abastecimiento.</p>
                        </div>
                    </div>
                    <Link to="/sge/despliegues" className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
                        Ver Detalles
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Events List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Eventos en Curso</h2>
                        <Link to="/sge/eventos" className="text-sm text-pdi-base hover:text-pdi-dark font-medium flex items-center gap-1">
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {activeEvents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Activity className="mx-auto mb-3 text-gray-300" size={48} />
                                <p>No hay eventos activos registrados actualmente.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {activeEvents.map(evento => (
                                    <div key={evento.id} className="p-5 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {evento.tipo} - {evento.descripcion}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar size={14} />
                                                            {new Date(evento.fecha).toLocaleDateString()}
                                                        </span>
                                                        {evento.regiones && evento.regiones.length > 0 && (
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin size={14} />
                                                                {evento.regiones.join(", ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                                                {evento.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Stats & Actions */}
                <div className="space-y-6">
                    {/* Distribution Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Distribución Regional</h3>
                        <div className="h-64">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    No hay datos geográficos disponibles
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleDownloadReport}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Download size={18} />
                                Reporte General (Excel)
                            </button>
                            <Link
                                to="/sge/eventos"
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-3 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Flame size={18} />
                                Gestionar Eventos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
