import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import sgeApi from '../../api/sgeApi';
import {
    MapPin, Calendar, Users, Truck, FileText,
    ArrowLeft, CheckCircle, AlertCircle, Edit, Save, X, Printer
} from 'lucide-react';

const DespliegueDetail = () => {
    const { id } = useParams();
    const [despliegue, setDespliegue] = useState(null);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        cantidadFuncionariosRequeridos: 0,
        cantidadVehiculosRequeridos: 0
    });

    // Extension State
    const [isExtending, setIsExtending] = useState(false);
    const [newEndDate, setNewEndDate] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const resDes = await sgeApi.get(`/despliegues/${id}`);
                const found = resDes.data;
                setDespliegue(found);

                setEditForm({
                    cantidadFuncionariosRequeridos: found.cantidadFuncionariosRequeridos,
                    cantidadVehiculosRequeridos: found.cantidadVehiculosRequeridos
                });

                const resAsig = await sgeApi.get(`/asignaciones/despliegue/${found.id}`);
                setAsignaciones(resAsig.data);

                setLoading(false);
            } catch (error) {
                console.error("Error loading detail", error);
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const handleUpdateRequirements = async () => {
        try {
            // Optimistic update
            const updated = { ...despliegue, ...editForm };
            setDespliegue(updated);
            setIsEditing(false);

            await sgeApi.put(`/despliegues/${despliegue.id}`, updated);
            alert("Requerimientos actualizados correctamente");
        } catch (error) {
            console.error("Error updating requirements", error);
            alert("Error al actualizar requerimientos");
        }
    };

    const handleProrrogaMismoPeriodo = async () => {
        try {
            const res = await sgeApi.put(`/despliegues/${despliegue.id}/prorroga`, { mismoPeriodo: true });
            setDespliegue(res.data);
            setIsExtending(false);
            alert("Despliegue prorrogado exitosamente");
        } catch (error) {
            console.error(error);
            alert("Error al prorrogar");
        }
    };

    const handleProrrogaNewDate = async () => {
        if (!newEndDate) return alert("Seleccione una fecha");
        try {
            const res = await sgeApi.put(`/despliegues/${despliegue.id}/prorroga`, {
                mismoPeriodo: false,
                nuevaFechaTermino: newEndDate
            });
            setDespliegue(res.data);
            setIsExtending(false);
            alert("Despliegue prorrogado exitosamente");
        } catch (error) {
            console.error(error);
            alert("Error al prorrogar: " + (error.response?.data?.message || "Error desconocido"));
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando información...</div>;
    if (!despliegue) return <div className="p-10 text-center text-red-500">Despliegue no encontrado</div>;

    // Calculate stats
    const assignedVehicles = asignaciones.filter(a => a.vehiculo).length;
    const pendingVehicles = Math.max(0, despliegue.cantidadVehiculosRequeridos - assignedVehicles);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <Link to="/sge/despliegues" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <ArrowLeft size={18} /> Volver al Monitor
                </Link>

                {despliegue.evento && (
                    <Link
                        to={`/sge/eventos/${despliegue.evento.id}/reporte`}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                    >
                        <Printer size={18} /> Ver Reporte Consolidado
                    </Link>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT COLUMN: Report / Detailed Info */}
                <div className="lg:w-2/3 bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-600">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Informe de Despliegue #{despliegue.id}</h1>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={18} />
                                <span>Solicitado el: {new Date(despliegue.fechaSolicitud).toLocaleString()}</span>
                            </div>
                        </div>
                        {despliegue.evento ? (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                                {despliegue.evento.tipo}
                            </span>
                        ) : (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Sin Evento</span>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-2 flex items-center gap-2">
                                <FileText size={20} /> Descripción de la Misión
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {despliegue.descripcion}
                            </p>
                            {despliegue.evento && (
                                <p className="mt-2 text-sm text-gray-500">
                                    <strong>Contexto:</strong> {despliegue.evento.descripcion} ({despliegue.evento.region})
                                </p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-2 flex items-center gap-2">
                                <MapPin size={20} /> Ubicación Geográfica
                            </h3>
                            <div className="bg-gray-50 p-4 rounded border">
                                <p><strong>Latitud:</strong> {despliegue.latitud}</p>
                                <p><strong>Longitud:</strong> {despliegue.longitud}</p>
                                <a
                                    href={`https://www.openstreetmap.org/?mlat=${despliegue.latitud}&mlon=${despliegue.longitud}#map=15/${despliegue.latitud}/${despliegue.longitud}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline text-sm mt-2 inline-block"
                                >
                                    Ver en OpenStreetMap Externo
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-2 flex items-center gap-2">
                                <Calendar size={20} /> Vigencia
                            </h3>
                            <div className="bg-gray-50 p-4 rounded border">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-500 uppercase">Inicio</span>
                                        <span className="text-gray-800">{despliegue.fechaInicio ? new Date(despliegue.fechaInicio).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-gray-500 uppercase">Término</span>
                                        <span className="text-gray-800 font-bold">{despliegue.fechaTermino ? new Date(despliegue.fechaTermino).toLocaleString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-3">
                                    Prórrogas realizadas: <span className="font-bold">{despliegue.numeroProrrogas || 0}</span>
                                </div>

                                {!isExtending ? (
                                    <button
                                        onClick={() => setIsExtending(true)}
                                        className="w-full bg-orange-100 text-orange-700 border border-orange-200 py-2 rounded font-medium hover:bg-orange-200 transition"
                                    >
                                        Prorrogar Despliegue
                                    </button>
                                ) : (
                                    <div className="bg-white p-3 border rounded shadow-inner animate-fade-in relative">
                                        <button onClick={() => setIsExtending(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
                                        <h4 className="font-bold text-gray-800 text-sm mb-2">Configurar Prórroga</h4>

                                        <button
                                            onClick={handleProrrogaMismoPeriodo}
                                            className="w-full mb-2 bg-blue-50 text-blue-700 border border-blue-200 py-1 rounded text-sm hover:bg-blue-100"
                                        >
                                            + Mismo Periodo Original
                                        </button>

                                        <div className="border-t pt-2 mt-2">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">O definir nueva fecha término:</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="datetime-local"
                                                    className="flex-1 p-1 border rounded text-sm"
                                                    onChange={(e) => setNewEndDate(e.target.value)}
                                                />
                                                <button
                                                    onClick={handleProrrogaNewDate}
                                                    className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                                                >
                                                    <Save size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT COLUMN: Synthetic Details / Cards */}
                <div className="lg:w-1/3 space-y-4">
                    {/* Status Card */}
                    <div className={`p-6 rounded-lg shadow-md text-white ${pendingVehicles === 0 ? 'bg-green-600' : 'bg-orange-500'}`}>
                        <h3 className="font-bold text-lg mb-1">Estado de Cobertura</h3>
                        <div className="text-4xl font-bold mb-2">
                            {pendingVehicles === 0 ? 'Cubierto' : 'Pendiente'}
                        </div>
                        <p className="opacity-90">{pendingVehicles === 0 ? 'Todos los recursos asignados' : `Faltan ${pendingVehicles} vehículos`}</p>
                    </div>

                    {/* Editing Controls */}
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition flex justify-center items-center gap-2"
                        >
                            <Edit size={16} /> Editar Requerimientos
                        </button>
                    ) : (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                            <h4 className="font-bold text-blue-800 text-sm">Editar Requerimientos</h4>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600">Vehículos Requeridos</label>
                                <input
                                    type="number"
                                    className="w-full p-1 border rounded"
                                    value={editForm.cantidadVehiculosRequeridos}
                                    onChange={e => setEditForm({ ...editForm, cantidadVehiculosRequeridos: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600">Funcionarios Requeridos</label>
                                <input
                                    type="number"
                                    className="w-full p-1 border rounded"
                                    value={editForm.cantidadFuncionariosRequeridos}
                                    onChange={e => setEditForm({ ...editForm, cantidadFuncionariosRequeridos: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-2 text-sm">
                                <button onClick={handleUpdateRequirements} className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 flex justify-center items-center gap-1">
                                    <Save size={14} /> Guardar
                                </button>
                                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-300 text-gray-700 py-1 rounded hover:bg-gray-400 flex justify-center items-center gap-1">
                                    <X size={14} /> Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Requirement Cards */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-gray-600 font-bold uppercase text-xs">Vehículos</h4>
                            <Truck className="text-indigo-500" size={24} />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold text-gray-800">{assignedVehicles}</span>
                                <span className="text-gray-400 text-sm"> / {despliegue.cantidadVehiculosRequeridos}</span>
                            </div>
                            <Link to={`/sge/despliegues/${despliegue.id}/asignar`} className="text-indigo-600 text-sm font-semibold hover:underline">
                                + Asignar
                            </Link>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full"
                                style={{ width: `${Math.min(100, (assignedVehicles / despliegue.cantidadVehiculosRequeridos) * 100) || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-gray-600 font-bold uppercase text-xs">Funcionarios (Req)</h4>
                            <Users className="text-teal-500" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{despliegue.cantidadFuncionariosRequeridos}</div>
                        <p className="text-xs text-gray-500 mt-1">Personal total solicitado para la zona.</p>
                    </div>

                    {/* Assignments List Mini */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm border-b pb-2">Recursos Asignados Detalle</h4>
                        {asignaciones.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No hay asignaciones aún.</p>
                        ) : (
                            <ul className="space-y-2">
                                {asignaciones.map(a => (
                                    <li key={a.id} className="text-sm flex items-start gap-2 text-gray-700 p-2 bg-gray-50 rounded">
                                        <CheckCircle size={16} className="text-green-500 mt-0.5" />
                                        <div>
                                            <div className="font-medium">
                                                {a.vehiculo && `Móvil ${a.vehiculo.sigla}`}
                                                {a.recurso && `Equipo: ${a.recurso.nombre}`}
                                                {a.insumo && `Insumo: ${a.insumo.nombre}`}
                                                {!a.vehiculo && !a.recurso && !a.insumo && a.funcionarios && a.funcionarios.length > 0 && `Personal (${a.funcionarios.length})`}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {a.vehiculo && `${a.vehiculo.tipo}`}
                                                {a.recurso && `${a.recurso.tipo}`}
                                                {a.insumo && `Cant: ${a.cantidadAsignada} ${a.insumo.unidad}`}
                                            </div>

                                            {/* Display Crew/Personnel */}
                                            {a.funcionarios && a.funcionarios.length > 0 && (
                                                <div className="mt-1 pl-2 border-l-2 border-green-200">
                                                    <p className="text-xs font-semibold text-gray-600">
                                                        {a.vehiculo ? 'Tripulación:' : 'Funcionarios:'}
                                                    </p>
                                                    <ul className="text-xs text-gray-500">
                                                        {a.funcionarios.map(f => (
                                                            <li key={f.id}>{f.grado} {f.apellido}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-400 mt-1">Origen: {a.unidadOrigen}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DespliegueDetail;
