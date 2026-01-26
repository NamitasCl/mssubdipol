import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext.jsx';
import AsyncUnidadSelect from '../../components/ComponentesAsyncSelect/AsyncUnidadSelect';

const VehiculoList = () => {
    const { user } = useAuth(); // Assuming useAuth is available in this context (need to import)
    const [viewMode, setViewMode] = useState('list'); // 'list', 'assign'
    
    // Core State
    const [vehiculos, setVehiculos] = useState([]);
    const [newVehiculo, setNewVehiculo] = useState({ sigla: '', tipo: '', capacidad: 0, estado: 'OPERATIVO' });
    
    // Assignment State
    const [myRequests, setMyRequests] = useState([]);
    const [selectedRequestId, setSelectedRequestId] = useState('');
    const [availableCrew, setAvailableCrew] = useState([]);
    const [loadingCrew, setLoadingCrew] = useState(false);
    
    // Selected Vehicle State for Modal
    const [assigningVehicle, setAssigningVehicle] = useState(null); // The vehicle object being assigned
    const [crewSelection, setCrewSelection] = useState({
        conductor: '',
        encargado: '',
        tripulantes: []
    });

    // List support state
    const [tipoVehiculoList, setTipoVehiculoList] = useState([]);

    useEffect(() => {
        fetchVehiculos();
        fetchListas();
    }, []);

    const fetchListas = async () => {
        try {
            const resTipos = await sgeApi.get('/nodos/listas/tipo-vehiculo');
            setTipoVehiculoList(resTipos.data);
        } catch (error) {
            console.error("Error loading auxiliary lists", error);
        }
    };

    // Load requests when switching to assign
    useEffect(() => {
        if (viewMode === 'assign' && user?.nombreUnidad) {
            fetchRequests();
        }
    }, [viewMode, user]);
    
    // Set default unit when user loads
    useEffect(() => {
        if (user?.nombreUnidad && !newVehiculo.unidad) {
            setNewVehiculo(prev => ({ ...prev, unidad: user.nombreUnidad }));
        }
    }, [user]);

    const fetchRequests = async () => {
        try {
            const res = await sgeApi.get(`/solicitudes/mi-unidad?unidad=${user.nombreUnidad}`);
            setMyRequests(res.data);
        } catch (err) { console.error("Error loading requests", err); }
    };

    const fetchVehiculos = async () => {
        try {
            const res = await sgeApi.get('/vehiculos');
            setVehiculos(res.data);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    const handleInput = (e) => {
        setNewVehiculo({ ...newVehiculo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Include user's unit in the new vehicle if not set (fallback)
            const payload = { ...newVehiculo, unidad: newVehiculo.unidad || user?.nombreUnidad || 'SIN_UNIDAD' };
            await sgeApi.post('/vehiculos', payload);
            setNewVehiculo({ sigla: '', tipo: '', capacidad: 0, estado: 'OPERATIVO', unidad: user?.nombreUnidad || '' });
            fetchVehiculos();
        } catch (error) {
            console.error("Error creating vehicle", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await sgeApi.delete(`/vehiculos/${id}`);
            fetchVehiculos();
        } catch (error) {
            console.error("Error deleting", error);
        }
    }

    // Opens the modal/form to assign crew to a vehicle
    const handleOpenAssign = async (vehiculo) => {
        if (!selectedRequestId) return alert("Seleccione primero un evento activo.");
        setAssigningVehicle(vehiculo);
        setLoadingCrew(true);
        try {
            const res = await sgeApi.get(`/solicitudes/${selectedRequestId}/funcionarios-asignados?unidad=${user.nombreUnidad}`);
            setAvailableCrew(res.data);
            setCrewSelection({ conductor: '', encargado: '', tripulantes: [] });
        } catch (error) {
            console.error(error);
            alert("Error al cargar funcionarios asignados.");
            setAssigningVehicle(null);
        } finally {
            setLoadingCrew(false);
        }
    };

    const handleConfirmAssignment = async () => {
        if (!crewSelection.conductor || !crewSelection.encargado) {
            return alert("Debe indicar al menos el Conductor y el Encargado.");
        }

        // Build list of all involved officials
        const allRutSet = new Set();
        allRutSet.add(crewSelection.conductor);
        allRutSet.add(crewSelection.encargado);
        crewSelection.tripulantes.forEach(t => allRutSet.add(t));
        
        const funcionariosPayload = Array.from(allRutSet).map(rut => ({ rut }));
        
        // Build metadata for roles
        const rolesMeta = {
            conductor: crewSelection.conductor,
            encargado: crewSelection.encargado,
            tripulantes: crewSelection.tripulantes
        };

        const payload = {
            solicitud: { id: parseInt(selectedRequestId) },
            unidadOrigen: user.nombreUnidad,
            vehiculos: [{ sigla: assigningVehicle.sigla }],
            funcionarios: funcionariosPayload,
            fechaAsignacion: new Date().toISOString().split('.')[0],
            equipos: JSON.stringify(rolesMeta), // Storing role info in 'equipos' field
            observaciones: `Asignación Vehicular: ${assigningVehicle.tipo} ${assigningVehicle.sigla} (${assigningVehicle.unidad || 'Ext'})`
        };

        try {
            await sgeApi.post(`/solicitudes/${selectedRequestId}/asignar`, payload);
            alert("Vehículo y tripulación asignados correctamente.");
            setAssigningVehicle(null);
            fetchRequests(); // Update progress
        } catch (error) {
            console.error(error);
            alert("Error al asignar vehículo: " + (error.response?.data?.message || error.message));
        }
    };

    const toggleTripulante = (rut) => {
        setCrewSelection(prev => {
            const current = prev.tripulantes;
            if (current.includes(rut)) return { ...prev, tripulantes: current.filter(r => r !== rut) };
            if (current.length + 2 > assigningVehicle.capacidad) return prev; // Simple check (Driver+Encargado+Crew <= Capacity)
            return { ...prev, tripulantes: [...current, rut] };
        });
    };

    const handleDownloadReport = async (reqId) => {
        try {
            const response = await sgeApi.get(`/solicitudes/${reqId}/reporte/dotacion`, {
                responseType: 'blob', // Important for handling binary data
            });
            
            // Create a Blob from the PDF Stream
            const file = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            // Build a URL from the file
            const fileURL = URL.createObjectURL(file);
            
            // Open the URL on new Window
            const pdfWindow = window.open();
            pdfWindow.location.href = fileURL;      
        } catch (error) {
            console.error("Error downloading report", error);
            alert("Error al descargar el reporte.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div>
                     <h1 className="text-2xl font-bold text-gray-800">Gestión de Vehículos</h1>
                     <p className="text-sm text-gray-500">Administración de flota y asignación a eventos</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>Flota</button>
                    <button onClick={() => setViewMode('assign')} className={`px-4 py-2 rounded-md transition ${viewMode === 'assign' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>Asignación Eventos</button>
                </div>
            </div>

            {viewMode === 'list' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20} /> Nuevo Vehículo</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sigla / Patente</label>
                                <input name="sigla" value={newVehiculo.sigla} onChange={handleInput} placeholder="Ej: PDI-1234" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo</label>
                                <select 
                                    name="tipo" 
                                    value={newVehiculo.tipo} 
                                    onChange={handleInput} 
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">Seleccione Tipo...</option>
                                    {tipoVehiculoList.map(t => (
                                        <option key={t.id || t.tipoVehiculo} value={t.tipoVehiculo}>{t.tipoVehiculo}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad Propietaria</label>
                                <AsyncUnidadSelect
                                    user={user}
                                    value={newVehiculo.unidad ? { label: newVehiculo.unidad, value: newVehiculo.unidad } : null}
                                    onChange={(opt) => setNewVehiculo({ ...newVehiculo, unidad: opt?.label || '' })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                                <input type="number" name="capacidad" value={newVehiculo.capacidad} onChange={handleInput} min="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select name="estado" value={newVehiculo.estado} onChange={handleInput} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="OPERATIVO">Operativo</option>
                                    <option value="MANTENCION">En Mantención</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow font-medium flex items-center gap-2">
                                <Plus size={20} /> Registrar
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Flota Vehicular</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">Sigla</th>
                                    <th className="p-3 border-b">Tipo</th>
                                    <th className="p-3 border-b">Unidad</th>
                                    <th className="p-3 border-b">Capacidad</th>
                                    <th className="p-3 border-b">Estado</th>
                                    <th className="p-3 border-b">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehiculos.length === 0 ? (
                                    <tr><td colSpan="6" className="p-4 text-center text-gray-500">No hay vehículos registrados.</td></tr>
                                ) : (
                                    vehiculos.map(v => (
                                        <tr key={v.sigla} className="hover:bg-gray-50">
                                            <td className="p-3 border-b font-bold">{v.sigla}</td>
                                            <td className="p-3 border-b">{v.tipo}</td>
                                            <td className="p-3 border-b text-sm text-gray-600">{v.unidad || '-'}</td>
                                            <td className="p-3 border-b">{v.capacidad}</td>
                                            <td className="p-3 border-b">
                                                <span className={`px-2 py-1 rounded text-xs ${v.estado === 'OPERATIVO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {v.estado}
                                                </span>
                                            </td>
                                            <td className="p-3 border-b">
                                                <button onClick={() => handleDelete(v.sigla)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            )}

            {viewMode === 'assign' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Active Requests */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow border border-emerald-100 h-fit">
                             <h3 className="font-bold text-gray-800 mb-4">Eventos Activos</h3>
                             <div className="space-y-3">
                                {myRequests.map(req => {
                                    const isActive = selectedRequestId === req.id;
                                    const pending = (req.vehiculosRequeridos || 0) - (req.vehiculosAsignados || 0);
                                    const isComplete = pending <= 0;
                                    return (
                                        <div key={req.id} onClick={() => !isComplete && setSelectedRequestId(req.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition ${isActive ? 'bg-emerald-50 border-emerald-500' : 'hover:bg-gray-50'} ${isComplete ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-bold text-sm">REQ #{req.id}</span>
                                                <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>{req.vehiculosAsignados}/{req.vehiculosRequeridos} Vehículos</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 mb-2">{req.despliegue?.evento?.descripcion}</p>
                                            
                                            {req.vehiculosAsignados > 0 && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadReport(req.id);
                                                    }}
                                                    className="w-full text-center text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 rounded mt-1 flex items-center justify-center gap-1"
                                                >
                                                    <span className="font-bold">📄 Descargar Dotación</span>
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                             </div>
                        </div>
                    </div>

                    {/* Vehicles Selection */}
                    <div className="lg:col-span-2">
                        {selectedRequestId ? (
                             <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="font-bold text-lg mb-4 text-gray-800">Seleccione Vehículo para Asignar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vehiculos.filter(v => v.estado === 'OPERATIVO').map(v => (
                                        <div key={v.sigla} className="border p-4 rounded-lg flex flex-col gap-3 hover:border-blue-400 transition bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-lg text-blue-900">{v.sigla}</div>
                                                    <div className="text-sm text-gray-600">{v.tipo}</div>
                                                    <div className="text-xs text-gray-400">{v.unidad || 'Sin Unidad'}</div>
                                                </div>
                                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">Cap: {v.capacidad}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleOpenAssign(v)}
                                                className="mt-auto w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-sm"
                                            >
                                                Asignar y Tripular
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2">
                                Seleccione un evento para ver vehículos disponibles.
                            </div>
                        )}
                    </div>

                    {/* CREW ASSIGNMENT MODAL (Inline Overlay) */}
                    {assigningVehicle && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b bg-gray-50 flex justify-between items-center sticky top-0">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Tripulación de {assigningVehicle.sigla}</h3>
                                        <p className="text-sm text-gray-500">Asignar personal desde la dotación desplegada en el evento.</p>
                                    </div>
                                    <button onClick={() => setAssigningVehicle(null)} className="text-gray-400 hover:text-gray-600"><Trash2 size={24} className="rotate-45" /></button>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* DRIVER */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">1. Conductor (Obligatorio)</label>
                                        <select 
                                            className="w-full p-2 border rounded"
                                            value={crewSelection.conductor}
                                            onChange={e => setCrewSelection({...crewSelection, conductor: e.target.value})}
                                        >
                                            <option value="">Seleccione Conductor...</option>
                                            {availableCrew.map(f => (
                                                <option key={f.rut} value={f.rut}>{f.grado} {f.nombre} ({f.rut})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ENCARGADO */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">2. Jefe de Máquina (Obligatorio)</label>
                                        <select 
                                            className="w-full p-2 border rounded"
                                            value={crewSelection.encargado}
                                            onChange={e => setCrewSelection({...crewSelection, encargado: e.target.value})}
                                        >
                                            <option value="">Seleccione Encargado...</option>
                                            {availableCrew.map(f => (
                                                <option key={f.rut} value={f.rut}>{f.grado} {f.nombre} ({f.rut})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* TRIPULANTES */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">3. Tripulantes Adicionales (Opcional)</label>
                                        <div className="border rounded p-3 h-48 overflow-y-auto grid grid-cols-1 gap-2">
                                            {availableCrew.map(f => {
                                                const isSelected = crewSelection.tripulantes.includes(f.rut);
                                                const isDriver = f.rut === crewSelection.conductor;
                                                const isInCharge = f.rut === crewSelection.encargado;
                                                
                                                if (isDriver || isInCharge) return null; // Hide if already selected as driver/lead

                                                return (
                                                    <div key={f.rut} onClick={() => toggleTripulante(f.rut)} 
                                                        className={`p-2 rounded cursor-pointer border flex justify-between items-center ${isSelected ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <span className="text-sm">{f.grado} {f.nombre}</span>
                                                        {isSelected && <span className="text-blue-600 font-bold text-xs">TRIPULANTE</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-right mt-1 text-gray-500">
                                            Capacidad: {2 + crewSelection.tripulantes.length} / {assigningVehicle.capacidad} pax
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                                    <button onClick={() => setAssigningVehicle(null)} className="px-4 py-2 text-gray-600 font-medium">Cancelar</button>
                                    <button 
                                        onClick={handleConfirmAssignment}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow"
                                    >
                                        Confirmar Asignación
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehiculoList;
