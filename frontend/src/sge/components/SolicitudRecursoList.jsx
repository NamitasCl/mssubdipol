import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { ClipboardList, Send, CheckCircle, AlertCircle, Clock, Users, Truck } from 'lucide-react';

/**
 * SolicitudRecursoList - Component for viewing and managing resource requests.
 * Displays different views based on user role:
 * - PM_REG sees regional requests with delegate/assign options
 * - JEFE sees unit requests with assign option only
 */
const SolicitudRecursoList = ({ userRole, userRegion, userUnidad }) => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            let res;
            if (userRole === 'PM_REG') {
                res = await sgeApi.get(`/solicitudes/mi-region?region=${userRegion}`);
            } else if (userRole === 'JEFE') {
                res = await sgeApi.get(`/solicitudes/mi-unidad?unidad=${userUnidad}`);
            } else {
                // PM_SUB or DIRECTOR - show all
                res = await sgeApi.get('/solicitudes');
            }
            setSolicitudes(res.data);
        } catch (error) {
            console.error("Error fetching solicitudes", error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
            case 'DELEGADA': return 'bg-blue-100 text-blue-800';
            case 'PARCIAL': return 'bg-orange-100 text-orange-800';
            case 'CUMPLIDA': return 'bg-green-100 text-green-800';
            case 'RECHAZADA': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return <Clock size={14} />;
            case 'DELEGADA': return <Send size={14} />;
            case 'PARCIAL': return <AlertCircle size={14} />;
            case 'CUMPLIDA': return <CheckCircle size={14} />;
            default: return <ClipboardList size={14} />;
        }
    };

    const handleDelegar = async (solicitudId) => {
        const unidadDestino = prompt("Ingrese la unidad destino para delegar:");
        if (!unidadDestino) return;

        try {
            await sgeApi.post(`/solicitudes/${solicitudId}/delegar`, { unidadDestino });
            alert("Solicitud delegada exitosamente");
            fetchSolicitudes();
        } catch (error) {
            alert("Error al delegar: " + (error.response?.data?.message || error.message));
        }
    };

    const handleRechazar = async (solicitudId) => {
        const motivo = prompt("Ingrese el motivo del rechazo:");
        if (!motivo) return;

        try {
            await sgeApi.post(`/solicitudes/${solicitudId}/rechazar`, { motivo });
            alert("Solicitud rechazada");
            fetchSolicitudes();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList size={24} /> Solicitudes de Recursos
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {userRole === 'PM_REG' && `Región: ${userRegion}`}
                        {userRole === 'JEFE' && `Unidad: ${userUnidad}`}
                    </p>
                </div>
                <div className="text-sm text-gray-600">
                    {solicitudes.length} solicitudes pendientes
                </div>
            </div>

            {solicitudes.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border">
                    <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No hay solicitudes asignadas</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {solicitudes.map(sol => (
                        <div key={sol.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(sol.estado)}`}>
                                        {getEstadoIcon(sol.estado)} {sol.estado}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Evento: <span className="font-medium text-gray-700">{sol.evento?.descripcion}</span>
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(sol.fechaCreacion).toLocaleString()}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {/* Requirements */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <Users size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {sol.funcionariosAsignados || 0}/{sol.funcionariosRequeridos}
                                            </div>
                                            <div className="text-xs text-gray-500">Funcionarios</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <Truck size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {sol.vehiculosAsignados || 0}/{sol.vehiculosRequeridos}
                                            </div>
                                            <div className="text-xs text-gray-500">Vehículos</div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="md:col-span-2">
                                        <div className="text-sm text-gray-500 mb-1">Cumplimiento</div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${sol.porcentajeCumplimiento >= 100 ? 'bg-green-500' :
                                                    sol.porcentajeCumplimiento > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                                                    }`}
                                                style={{ width: `${Math.min(sol.porcentajeCumplimiento || 0, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {(sol.porcentajeCumplimiento || 0).toFixed(0)}% completado
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                {sol.instrucciones && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                        <strong>Instrucciones:</strong> {sol.instrucciones}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {(sol.estado === 'PENDIENTE' || sol.estado === 'DELEGADA' || sol.estado === 'PARCIAL') && (
                                <div className="px-6 py-3 bg-gray-50 border-t flex gap-2 justify-end">
                                    {userRole === 'PM_REG' && sol.estado === 'PENDIENTE' && (
                                        <button
                                            onClick={() => handleDelegar(sol.id)}
                                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                        >
                                            <Send size={14} /> Delegar a Unidad
                                        </button>
                                    )}
                                    <button
                                        onClick={() => window.location.href = `/sge/solicitudes/${sol.id}/asignar`}
                                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <Users size={14} /> Asignar Recursos
                                    </button>
                                    <button
                                        onClick={() => handleRechazar(sol.id)}
                                        className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SolicitudRecursoList;
