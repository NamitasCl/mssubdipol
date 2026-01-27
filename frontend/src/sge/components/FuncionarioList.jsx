import React, { useState, useEffect } from 'react';
import axios from 'axios';
import sgeApi from '../../api/sgeApi';
import { Plus, Trash2, UserPlus, FileBadge, MapPin, Search, Filter, Mail, Phone, Shield, CheckSquare, Save, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import AsyncUnidadSelect from '../../components/ComponentesAsyncSelect/AsyncUnidadSelect.jsx';
import { useAuth } from '../../components/contexts/AuthContext.jsx';

// Removed static ESPECIALIDADES const


const FuncionarioList = () => {
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);
    const [especialidadesList, setEspecialidadesList] = useState([]);

    // Bulk Import State
    const [selectedUnidad, setSelectedUnidad] = useState(null);
    const [importCandidates, setImportCandidates] = useState([]);
    const [selectedToImport, setSelectedToImport] = useState({}); // { idFun: boolean }
    const [importDetails, setImportDetails] = useState({}); // { idFun: { telefono: '', especialidades: [] } }
    const [loadingCandidates, setLoadingCandidates] = useState(false);



    // Assignment Mode State
    const [viewMode, setViewMode] = useState('list'); // 'list', 'import', 'assign'
    const [myRequests, setMyRequests] = useState([]);
    const [selectedRequestId, setSelectedRequestId] = useState('');
    const [assignmentSelection, setAssignmentSelection] = useState([]);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchFuncionarios();
        fetchEspecialidades();
    }, []);

    const fetchEspecialidades = async () => {
        try {
            const res = await sgeApi.get('/tipos-especialidades');
            setEspecialidadesList(res.data.map(e => e.nombre));
        } catch (error) {
            console.error("Error fetching specialties", error);
            // Fallback
            setEspecialidadesList(["AUDITOR", "ENFERMERO", "BOMBERO", "OTROS"]);
        }
    };

    // Load requests when switching to assignment mode
    useEffect(() => {
        if (viewMode === 'assign' && user?.nombreUnidad) {
            sgeApi.get(`/solicitudes/mi-unidad?unidad=${user.nombreUnidad}`)
                .then(res => setMyRequests(res.data))
                .catch(err => console.error("Error loading requests", err));
        }
    }, [viewMode, user]);

    const fetchFuncionarios = async () => {
        try {
            const res = await sgeApi.get('/funcionarios');
            setFuncionarios(res.data);
        } catch (error) { console.error("Error", error); }
    };

    const handleUnidadSelect = async (option) => {
        setSelectedUnidad(option);
        if (option && option.unidad) {
            setLoadingCandidates(true);
            try {
                // Fetch officials for this unit from Common Services
                const res = await axios.get(
                    `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/porunidad?unidad=${option.unidad.siglasUnidad}`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );

                // Map to candidate structure
                const existingRutSet = new Set(funcionarios.map(f => f.rut));

                const candidates = res.data.map(f => ({
                    ...f,
                    // Check registration using idFun as the key (since local RUT is stored as idFun)
                    isRegistered: existingRutSet.has(f.idFun ? f.idFun.toString() : '')
                }));

                setImportCandidates(candidates);
                setSelectedToImport({});
                setImportDetails({});
            } catch (error) {
                console.error("Error fetching unit officials", error);
                alert("Error al obtener funcionarios de la unidad.");
            } finally {
                setLoadingCandidates(false);
            }
        } else {
            setImportCandidates([]);
        }
    };

    const toggleImportSelection = (idFun) => {
        setSelectedToImport(prev => ({
            ...prev,
            [idFun]: !prev[idFun]
        }));
    };

    const handleDetailChange = (idFun, field, value) => {
        setImportDetails(prev => ({
            ...prev,
            [idFun]: {
                ...prev[idFun],
                [field]: value
            }
        }));
    };

    const handleEspChange = (idFun, options) => {
        const values = Array.from(options, o => o.value);
        handleDetailChange(idFun, 'especialidades', values);
    };

    const handleBulkImport = async () => {
        const ids = Object.keys(selectedToImport).filter(id => selectedToImport[id]);
        if (ids.length === 0) return alert("Seleccione al menos un funcionario.");

        try {
            const promises = ids.map(idStr => {
                const idFun = parseInt(idStr);
                const candidate = importCandidates.find(c => c.idFun === idFun);
                const details = importDetails[idFun] || {};

                // Determine effective RUT (Identifier)
                const effectiveRut = (candidate.idFun && candidate.idFun !== 0)
                    ? candidate.idFun.toString()
                    : (candidate.rut || '');

                const payload = {
                    rut: effectiveRut,
                    nombre: candidate.nombreCompleto || (candidate.nombreFun + ' ' + candidate.apellidoPaternoFun),
                    region: candidate.region || selectedUnidad?.unidad?.nombreRegion || '',
                    jefatura: candidate.jefatura || selectedUnidad?.unidad?.nombreUnidadReporta || '',
                    unidad: candidate.nombreUnidad || selectedUnidad?.unidad?.nombreUnidad || '',
                    grado: candidate.grado || candidate.siglasCargo || '',
                    telefono: details.telefono || '',
                    correo: candidate.email || '',
                    especialidades: details.especialidades || []
                };

                if (!payload.nombre) return null;

                return sgeApi.post('/funcionarios', payload);
            });

            await Promise.all(promises);
            alert("Funcionarios importados correctamente.");

            // Reset and refresh
            setSelectedUnidad(null);
            setImportCandidates([]);
            fetchFuncionarios();
        } catch (error) {
            console.error("Error importing", error);
            alert("Ocurrió un error al importar algunos funcionarios.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar funcionario del sistema local?")) return;
        try { await sgeApi.delete(`/funcionarios/${id}`); fetchFuncionarios(); }
        catch (e) { console.error(e); }
    };

    const handleAssignmentSubmit = async () => {
        if (!selectedRequestId || assignmentSelection.length === 0) return;

        setAssigning(true);
        try {
            const request = myRequests.find(r => r.id === parseInt(selectedRequestId));
            const payload = {
                funcionarios: assignmentSelection.map(rut => ({ rut })), // Backend expects list of objects with ID/RUT
                solicitud: { id: parseInt(selectedRequestId) },
                despliegue: { id: request.despliegue.id },
                unidadOrigen: user.nombreUnidad,
                fechaAsignacion: new Date().toISOString().split('.')[0] // Remove .sssZ
            };

            await sgeApi.post(`/solicitudes/${selectedRequestId}/asignar`, payload);
            alert("Personal asignado correctamente.");

            // Allow user to assign more or reset
            setAssignmentSelection([]);
            // Refresh requests to update counters
            const res = await sgeApi.get(`/solicitudes/mi-unidad?unidad=${user.nombreUnidad}`);
            setMyRequests(res.data);

        } catch (error) {
            console.error("Assignment error", error);
            alert("Error al asignar personal: " + (error.response?.data?.message || error.message));
        } finally {
            setAssigning(false);
        }
    };

    const toggleAssignmentSelection = (rut) => {
        const request = myRequests.find(r => r.id === parseInt(selectedRequestId));
        if (!request) return;

        const remainingNeeded = (request.funcionariosRequeridos || 0) - (request.funcionariosAsignados || 0);
        const currentSelectionCount = assignmentSelection.length;

        if (assignmentSelection.includes(rut)) {
            setAssignmentSelection(prev => prev.filter(id => id !== rut));
        } else {
            // Check limit
            if (currentSelectionCount >= remainingNeeded) {
                alert(`Solo se requieren ${remainingNeeded} funcionarios más para este evento.`);
                return;
            }
            setAssignmentSelection(prev => [...prev, rut]);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Funcionarios</h1>
                    <p className="text-gray-500 mt-1">Administración de la dotación y personal activo</p>
                </div>

                {/* View Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Dotación
                    </button>
                    <button
                        onClick={() => setViewMode('import')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'import'
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Incorporación
                    </button>
                    <button
                        onClick={() => setViewMode('assign')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'assign'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Briefcase size={16} /> Asignación Eventos
                    </button>
                </div>
            </div>

            {/* ASSIGNMENT MODE */}
            {viewMode === 'assign' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Request Selector */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Shield size={18} className="text-emerald-600" />
                                    Eventos Activos
                                </h3>

                                {myRequests.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No hay solicitudes pendientes para su unidad.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myRequests.map(req => {
                                            const isActive = selectedRequestId === req.id;
                                            const pending = (req.funcionariosRequeridos || 0) - (req.funcionariosAsignados || 0);
                                            const isComplete = pending <= 0;

                                            // Extract event description safely
                                            const eventDesc = req.despliegue?.evento?.descripcion || "Evento sin descripción";
                                            const zoneDesc = req.despliegue?.descripcion || "Zona sin nombre";

                                            return (
                                                <div
                                                    key={req.id}
                                                    onClick={() => !isComplete && setSelectedRequestId(req.id)}
                                                    className={`
                                                        p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden
                                                        ${isActive ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}
                                                        ${isComplete ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                            REQ #{req.id}
                                                        </span>
                                                        {isComplete && <CheckCircle size={16} className="text-green-600" />}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{eventDesc}</h4>
                                                    <p className="text-xs text-gray-500 mb-3">{zoneDesc}</p>

                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">Progreso:</span>
                                                        <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {req.funcionariosAsignados} / {req.funcionariosRequeridos}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-orange-500'}`}
                                                            style={{ width: `${Math.min(100, (req.funcionariosAsignados / req.funcionariosRequeridos) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Personnel Selection */}
                        <div className="lg:col-span-2">
                            {selectedRequestId ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                                    {(() => {
                                        const req = myRequests.find(r => r.id === parseInt(selectedRequestId));
                                        if (!req) return null;

                                        const remaining = (req.funcionariosRequeridos || 0) - (req.funcionariosAsignados || 0);
                                        const currentCount = assignmentSelection.length;
                                        const isFull = currentCount >= remaining;

                                        return (
                                            <>
                                                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">Selección de Personal</h3>
                                                        <p className="text-xs text-gray-500">
                                                            Seleccione <strong className="text-orange-600">{remaining}</strong> funcionarios para completar el requerimiento.
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`px-4 py-2 rounded-lg font-bold text-xl ${isFull ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                                            {currentCount} <span className="text-sm font-normal text-gray-500">/ {remaining}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {funcionarios.filter(f => !f.estado || f.estado === 'DISPONIBLE').map(f => {
                                                            const isSelected = assignmentSelection.includes(f.rut);
                                                            return (
                                                                <div
                                                                    key={f.rut}
                                                                    onClick={() => toggleAssignmentSelection(f.rut)}
                                                                    className={`
                                                                        p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all
                                                                        ${isSelected
                                                                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                                                                            : 'border-gray-200 hover:bg-gray-50 hover:border-blue-200'}
                                                                        ${(isFull && !isSelected) ? 'opacity-50' : 'opacity-100'}
                                                                    `}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                                        {f.nombre ? f.nombre.substring(0, 1) : '?'}
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <p className="font-bold text-sm text-gray-800 truncate">{f.grado} {f.nombre}</p>
                                                                        <p className="text-xs text-gray-500 truncate">{f.rut}</p>
                                                                    </div>
                                                                    {isSelected && <CheckCircle size={18} className="text-blue-500 ml-auto" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                                    <button
                                                        onClick={handleAssignmentSubmit}
                                                        disabled={currentCount === 0 || assigning}
                                                        className={`
                                                            px-6 py-2.5 rounded-lg font-bold text-white shadow-md flex items-center gap-2
                                                            ${(currentCount === 0 || assigning) ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}
                                                        `}
                                                    >
                                                        {assigning ? (
                                                            <>Procesando...</>
                                                        ) : (
                                                            <><Save size={18} /> Confirmar Asignación ({currentCount})</>
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-8">
                                    <AlertCircle size={48} className="mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Seleccione un evento para comenzar</p>
                                    <p className="text-sm">Haga clic en una tarjeta de evento en la izquierda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Card - REDESIGNED */}
            {viewMode === 'import' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-primary-900 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <UserPlus size={20} className="text-secondary-400" />
                            Incorporación Masiva por Unidad
                        </h2>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        {/* Unit Selector */}
                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Paso 1: Buscar Unidad de Origen</label>
                            <AsyncUnidadSelect
                                value={selectedUnidad}
                                onChange={handleUnidadSelect}
                                user={user}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                * Se buscarán automáticamente todos los funcionarios pertenecientes a esta unidad en la base institucional.
                            </p>
                        </div>

                        {/* Import Candidates List */}
                        {loadingCandidates && <div className="text-center py-8 text-blue-600">Cargando dotación...</div>}

                        {!loadingCandidates && importCandidates.length > 0 && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">Seleccione Funcionarios a Importar</h3>
                                    <p className="text-xs text-gray-500">{importCandidates.length} funcionarios encontrados</p>
                                </div>

                                <div className="max-h-[600px] overflow-y-auto border rounded-lg">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 w-10 text-center">
                                                    <input type="checkbox" disabled />
                                                </th>
                                                <th className="p-3 font-semibold text-gray-700">Funcionario</th>
                                                <th className="p-3 font-semibold text-gray-700">Contacto y Especialidad (Requerido)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {importCandidates.map((f) => {
                                                const isSelected = !!selectedToImport[f.idFun];
                                                const details = importDetails[f.idFun] || {};

                                                if (f.isRegistered) {
                                                    return (
                                                        <tr key={f.idFun} className="bg-gray-50 opacity-60">
                                                            <td className="p-3 text-center">
                                                                <CheckSquare size={16} className="text-green-500 mx-auto" />
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="font-bold text-gray-800">{f.grado || f.nombreCargo || ''} {f.nombreCompleto || (f.nombreFun + ' ' + f.apellidoPaternoFun)}</div>
                                                                <div className="text-xs text-green-600 font-semibold">Ya Registrado</div>
                                                            </td>
                                                            <td className="p-3 text-gray-400 italic">
                                                                --
                                                            </td>
                                                        </tr>
                                                    )
                                                }

                                                return (
                                                    <tr key={f.idFun} className={`hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleImportSelection(f.idFun)}
                                                                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="p-3 cursor-pointer" onClick={() => toggleImportSelection(f.idFun)}>
                                                            <div className="font-bold text-gray-800">{f.grado || f.nombreCargo || ''} {f.nombreCompleto || (f.nombreFun + ' ' + f.apellidoPaternoFun)}</div>
                                                            <div className="text-xs text-gray-500">{f.email || 'Sin correo institucional'}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="+569..."
                                                                        className="w-full text-xs p-1.5 border rounded focus:ring-1 focus:ring-blue-500"
                                                                        disabled={!isSelected}
                                                                        value={details.telefono || ''}
                                                                        onChange={e => handleDetailChange(f.idFun, 'telefono', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <select
                                                                        multiple
                                                                        className="w-full text-xs p-1.5 border rounded h-8 focus:ring-1 focus:ring-blue-500"
                                                                        disabled={!isSelected}
                                                                        value={details.especialidades || []}
                                                                        onChange={e => handleEspChange(f.idFun, e.target.selectedOptions)}
                                                                    >
                                                                        {especialidadesList.map(e => <option key={e} value={e}>{e}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end pt-4 gap-4">
                                    <button
                                        onClick={() => { setSelectedUnidad(null); setImportCandidates([]); }}
                                        className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleBulkImport}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold shadow-md flex items-center gap-2"
                                    >
                                        <Save size={18} /> Importar Seleccionados ({Object.values(selectedToImport).filter(Boolean).length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {!loadingCandidates && selectedUnidad && importCandidates.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No se encontraron funcionarios en esta unidad.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* List Table */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FileBadge size={20} className="text-primary-600" />
                            Dotación Registrada en SGE
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-3 border-b border-gray-100">Grado</th>
                                    <th className="px-6 py-3 border-b border-gray-100">Funcionario</th>
                                    <th className="px-6 py-3 border-b border-gray-100">Unidad</th>
                                    <th className="px-6 py-3 border-b border-gray-100">Contacto</th>
                                    <th className="px-6 py-3 border-b border-gray-100 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {funcionarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            No hay funcionarios registrados en el sistema local.
                                        </td>
                                    </tr>
                                ) : funcionarios.map((f, idx) => (
                                    <tr key={f.rut || idx} className="hover:bg-blue-50/50 transition-colors group text-sm">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-primary-900 bg-blue-50 px-2 py-1 rounded border border-blue-100 text-xs">
                                                {f.grado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{f.nombre}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{f.rut}</div>
                                            {f.especialidades && f.especialidades.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {f.especialidades.map(e => (
                                                        <span key={e} className="text-[10px] bg-purple-50 text-purple-700 px-1 rounded border border-purple-100">{e}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800 font-medium">{f.unidad}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {f.correo && <div className="text-xs flex items-center gap-1 mb-1"><Mail size={10} /> {f.correo}</div>}
                                            {f.telefono && <div className="text-xs flex items-center gap-1"><Phone size={10} /> {f.telefono}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(f.rut)}
                                                className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuncionarioList;
