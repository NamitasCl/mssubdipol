import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { Users, Truck, Package, Calendar, MapPin, AlertCircle } from 'lucide-react';

const DisponibilidadList = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, disponible, parcial

    useEffect(() => {
        fetchReportes();
    }, []);

    const fetchReportes = async () => {
        try {
            const res = await sgeApi.get('/disponibilidad');
            setReportes(res.data);
        } catch (error) {
            console.error("Error fetching availability reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReportes = reportes.filter(r => {
        if (filter === 'disponible') return r.estado === 'DISPONIBLE';
        if (filter === 'parcial') return r.estado === 'PARCIAL';
        return true;
    });

    const getEstadoBadge = (estado) => {
        const badges = {
            DISPONIBLE: 'bg-green-100 text-green-800 border-green-200',
            PARCIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            COMPROMETIDO: 'bg-orange-100 text-orange-800 border-orange-200',
            NO_DISPONIBLE: 'bg-red-100 text-red-800 border-red-200'
        };
        return badges[estado] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando reportes...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Disponibilidad de Recursos Reportada</h1>
                <p className="text-gray-600 mt-1">Vista administrativa de todos los reportes de disponibilidad</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Todos ({reportes.length})
                </button>
                <button
                    onClick={() => setFilter('disponible')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'disponible' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Disponibles ({reportes.filter(r => r.estado === 'DISPONIBLE').length})
                </button>
                <button
                    onClick={() => setFilter('parcial')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'parcial' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Parciales ({reportes.filter(r => r.estado === 'PARCIAL').length})
                </button>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReportes.map(reporte => (
                    <div key={reporte.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900">{reporte.unidad}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin size={14} />
                                    {reporte.regionOJefatura}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEstadoBadge(reporte.estado)}`}>
                                {reporte.estado}
                            </span>
                        </div>

                        {/* Resources */}
                        <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Users size={16} className="text-blue-600" />
                                <span className="font-semibold text-gray-700">{reporte.funcionariosDisponibles}</span>
                                <span className="text-gray-500">Funcionarios</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Truck size={16} className="text-blue-600" />
                                <span className="font-semibold text-gray-700">{reporte.vehiculosDisponibles}</span>
                                <span className="text-gray-500">Vehículos</span>
                            </div>
                            {reporte.equiposDisponibles && (
                                <div className="flex items-start gap-2 text-sm">
                                    <Package size={16} className="text-blue-600 mt-0.5" />
                                    <span className="text-gray-600 text-xs">{reporte.equiposDisponibles}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{new Date(reporte.fechaReporte).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="mt-1">Reportado por: {reporte.reportadoPor}</div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReportes.length === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">No hay reportes con el filtro seleccionado</p>
                </div>
            )}
        </div>
    );
};

export default DisponibilidadList;
