import React, { useState, useEffect } from 'react';
import axios from 'axios';
import sgeApi from '../../api/sgeApi';
import { Plus, Trash2, UserPlus, FileBadge, MapPin, Search, Filter, Mail, Phone, Shield, CheckSquare, Save } from 'lucide-react';
import AsyncUnidadSelect from '../../components/ComponentesAsyncSelect/AsyncUnidadSelect.jsx';
import { useAuth } from '../../components/contexts/AuthContext.jsx';

const ESPECIALIDADES = [
    "AUDITOR", "ENFERMERO", "PARAMEDICO", "MEDICO", "ABOGADO",
    "PSICOLOGO", "KINESIOLOGO", "INGENIERO", "TECNICO", "BOMBERO", "DRON", "OTRO"
];

const FuncionarioList = () => {
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);

    // Bulk Import State
    const [selectedUnidad, setSelectedUnidad] = useState(null);
    const [importCandidates, setImportCandidates] = useState([]);
    const [selectedToImport, setSelectedToImport] = useState({}); // { idFun: boolean }
    const [importDetails, setImportDetails] = useState({}); // { idFun: { telefono: '', especialidades: [] } }
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    useEffect(() => {
        fetchFuncionarios();
    }, []);

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

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Funcionarios</h1>
                    <p className="text-gray-500 mt-1">Administración de la dotación y personal activo</p>
                </div>
            </div>

            {/* Registration Card - REDESIGNED */}
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
                                                                    {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
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

            {/* List Table */}
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
        </div>
    );
};

export default FuncionarioList;
