import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/contexts/AuthContext';
import sgeApi from '../../api/sgeApi';
import AsyncFuncionarioSelect from '../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect';
import { Users, AlertTriangle, Save, Trash2, Home, Car, HelpCircle, MapPin, Search } from 'lucide-react';

const extractRut = (obj) => {
    if (!obj) return null;
    if (obj.rut) return obj.rut;
    if (obj.run) return obj.run;
    // Deep search or regex search in values
    const rutRegex = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/;
    for (const key in obj) {
        if (typeof obj[key] === 'string' && rutRegex.test(obj[key])) {
            return obj[key];
        }
    }
    return null;
};

const RegistroFamiliares = () => {
    const { user } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [familiares, setFamiliares] = useState([]); // Database records
    const [selectedEvento, setSelectedEvento] = useState('');

    // Form State
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [pendingFamiliares, setPendingFamiliares] = useState([]); // Local draft list

    // Current Entry State
    const [currentEntry, setCurrentEntry] = useState({
        nombreCompleto: '',
        rut: '',
        telefono: '',
        parentesco: 'OTRO',
        tipoBienAfectado: 'CASA',
        direccion: '',
        detalle: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEventos();
        fetchFamiliares();
    }, []);

    const fetchEventos = async () => {
        try {
            const res = await sgeApi.get('/eventos');
            const activos = res.data.filter(e => e.estado === 'ACTIVO' || !e.estado);
            setEventos(activos);
            if (activos.length > 0) setSelectedEvento(activos[0].id);
        } catch (error) { console.error(error); }
    };

    const fetchFamiliares = async () => {
        try {
            const res = await sgeApi.get('/familia-afectada');
            setFamiliares(res.data);
        } catch (error) { console.error(error); }
    };

    const handleAddToDraft = (e) => {
        e.preventDefault();
        if (!selectedFuncionario || !selectedEvento) {
            alert("Seleccione Funcionario y Evento.");
            return;
        }
        if (!currentEntry.nombreCompleto || !currentEntry.rut) {
            alert("Complete al menos Nombre y RUT.");
            return;
        }

        setPendingFamiliares([...pendingFamiliares, { ...currentEntry, id: Date.now() }]); // Temp ID

        // Clear basics but keep address if desired? User hinted "mismo domicilio".
        // Let's keep address to speed up entry.
        setCurrentEntry(prev => ({
            ...prev,
            nombreCompleto: '',
            rut: '',
            telefono: '',
            // parentesco: 'OTRO', // Reset parentesco? Maybe keep it same? Reset to avoid copy paste error
            parentesco: 'OTRO',
            tipoBienAfectado: 'CASA',
            // Keep direccion and maybe detalle?
            // direccion: prev.direccion, 
            detalle: ''
        }));
    };

    const handleRemoveDraft = (id) => {
        setPendingFamiliares(pendingFamiliares.filter(p => p.id !== id));
    };

    const handleSaveAll = async () => {
        if (pendingFamiliares.length === 0) return;
        setLoading(true);
        try {
            const promises = pendingFamiliares.map(p => {
                const payload = {
                    eventoId: selectedEvento,
                    funcionarioId: selectedFuncionario.value,
                    funcionarioNombre: selectedFuncionario.label,
                    funcionarioRut: extractRut(selectedFuncionario.f),

                    nombreCompleto: p.nombreCompleto,
                    rut: p.rut,
                    telefono: p.telefono,
                    parentesco: p.parentesco,
                    tipoBienAfectado: p.tipoBienAfectado,
                    direccion: p.direccion,
                    detalle: p.detalle
                };
                return sgeApi.post('/familia-afectada', payload);
            });

            await Promise.all(promises);
            alert(`${pendingFamiliares.length} registros guardados exitosamente.`);

            setPendingFamiliares([]);
            fetchFamiliares();
            // Don't clear Official, allows adding more if needed later, but cleared Draft list.
        } catch (error) {
            console.error(error);
            alert("Error al guardar registros.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este registro de la base de datos?")) return;
        try {
            await sgeApi.delete(`/familia-afectada/${id}`);
            fetchFamiliares();
        } catch (error) { console.error(error); }
    };

    // Filter DB records for selected official
    const existingRecords = selectedFuncionario
        ? familiares.filter(f => f.funcionarioId == selectedFuncionario.value) // Use loose equality for String/Number match
        : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Users className="text-blue-600" />
                    Catastro de Familiares Afectados
                </h1>
                <p className="text-gray-600 mt-2">
                    Registro masivo de grupos familiares afectados.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Context & Entry (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. Official Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Funcionario / Jefe de Hogar
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Evento</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedEvento}
                                    onChange={e => setSelectedEvento(e.target.value)}
                                >
                                    <option value="">Seleccione Evento...</option>
                                    {eventos.map(e => (
                                        <option key={e.id} value={e.id}>{e.descripcion}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Funcionario</label>
                                <div className="bg-blue-50 p-1 rounded-lg">
                                    <AsyncFuncionarioSelect
                                        user={user}
                                        value={selectedFuncionario}
                                        onChange={setSelectedFuncionario}
                                    />
                                </div>
                                {selectedFuncionario && (
                                    <div className="mt-2 px-2 text-xs font-medium">
                                        <p className={extractRut(selectedFuncionario.f) ? "text-green-600" : "text-red-500 font-bold"}>
                                            RUT Funcionario: {extractRut(selectedFuncionario.f) || "NO DETECTADO - POR FAVOR INFORMAR"}
                                        </p>
                                        <p className="text-blue-700">{selectedFuncionario.f?.unidad}</p>
                                        <p className="mt-1 text-gray-500 italic">
                                            ({existingRecords.length} familiares registrados previamente)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. New Entry Form */}
                    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all ${!selectedFuncionario ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            Agregar Familiar
                        </h2>

                        <form onSubmit={handleAddToDraft} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Familiar</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                    value={currentEntry.nombreCompleto}
                                    onChange={e => setCurrentEntry({ ...currentEntry, nombreCompleto: e.target.value })}
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">RUT</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                        value={currentEntry.rut}
                                        onChange={e => setCurrentEntry({ ...currentEntry, rut: e.target.value })}
                                        placeholder="12.345.678-9"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                        value={currentEntry.telefono}
                                        onChange={e => setCurrentEntry({ ...currentEntry, telefono: e.target.value })}
                                        placeholder="+569..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Relación / Parentesco</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                    value={currentEntry.parentesco}
                                    onChange={e => setCurrentEntry({ ...currentEntry, parentesco: e.target.value })}
                                >
                                    <option value="OTRO">Otro</option>
                                    <option value="CONYUGE">Cónyuge / Pareja</option>
                                    <option value="MADRE">Madre</option>
                                    <option value="PADRE">Padre</option>
                                    <option value="HIJA">Hija</option>
                                    <option value="HIJO">Hijo</option>
                                    <option value="HERMANA">Hermana</option>
                                    <option value="HERMANO">Hermano</option>
                                    <option value="ABUELA">Abuela</option>
                                    <option value="ABUELO">Abuelo</option>
                                    <option value="TIA">Tía</option>
                                    <option value="TIO">Tío</option>
                                    <option value="SUEGRA">Suegra</option>
                                    <option value="SUEGRO">Suegro</option>
                                    <option value="NUERA">Nuera</option>
                                    <option value="YERNO">Yerno</option>
                                    <option value="CUÑADA">Cuñada</option>
                                    <option value="CUÑADO">Cuñado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Bien Afectado</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                    value={currentEntry.tipoBienAfectado}
                                    onChange={e => setCurrentEntry({ ...currentEntry, tipoBienAfectado: e.target.value })}
                                >
                                    <option value="CASA">Inmueble: Casa</option>
                                    <option value="DEPARTAMENTO">Inmueble: Departamento</option>
                                    <option value="AUTO">Vehículo</option>
                                    <option value="OTRO">Otro / Enseres</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                    value={currentEntry.direccion}
                                    onChange={e => setCurrentEntry({ ...currentEntry, direccion: e.target.value })}
                                    placeholder="Calle, Número, Comuna"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Detalle Daño</label>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
                                    rows="1"
                                    value={currentEntry.detalle}
                                    onChange={e => setCurrentEntry({ ...currentEntry, detalle: e.target.value })}
                                    placeholder="Breve descripción..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gray-800 hover:bg-black text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition"
                            >
                                <Save size={16} /> Agregar a la Lista
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Review & Save (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* DRAFT LIST */}
                    {pendingFamiliares.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Por Registrar ({pendingFamiliares.length})
                                </h2>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
                                >
                                    {loading ? 'Guardando...' : <>Guardar Todo ({pendingFamiliares.length})</>}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingFamiliares.map((p, idx) => (
                                    <div key={p.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm relative">
                                        <button
                                            onClick={() => handleRemoveDraft(p.id)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex gap-2 items-center mb-1">
                                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{p.parentesco || 'OTRO'}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800">{p.nombreCompleto}</h4>
                                        <p className="text-xs text-gray-500">{p.rut}</p>
                                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{p.tipoBienAfectado}</span>
                                            <span className="truncate max-w-[150px]">{p.direccion}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EXISTING RECORDS LIST */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800">
                                {selectedFuncionario
                                    ? `Historial de ${selectedFuncionario.label}`
                                    : 'Todos los Registros'}
                            </h2>
                        </div>

                        <div className="p-4 flex-1">
                            {(!selectedFuncionario && familiares.length === 0) || (selectedFuncionario && existingRecords.length === 0) ? (
                                <div className="text-center text-gray-400 py-10">Sin registros.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {(selectedFuncionario ? existingRecords : familiares).map(fam => (
                                        <div key={fam.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition group relative">
                                            <div className="flex justify-between mb-2">
                                                <div className="flex gap-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${fam.tipoBienAfectado === 'CASA' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                        {fam.tipoBienAfectado}
                                                    </span>
                                                    {fam.parentesco && (
                                                        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                            {fam.parentesco}
                                                        </span>
                                                    )}
                                                </div>
                                                <button onClick={() => handleDelete(fam.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <h4 className="font-semibold text-gray-800 leading-tight">{fam.nombreCompleto}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{fam.rut}</p>
                                            <p className="text-xs text-gray-600 flex gap-1 items-start">
                                                <MapPin size={12} className="shrink-0 mt-0.5" /> {fam.direccion}
                                            </p>
                                            {!selectedFuncionario && (
                                                <div className="mt-3 pt-2 border-t border-gray-50">
                                                    <p className="text-[10px] text-blue-600 font-bold">{fam.funcionarioNombre}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroFamiliares;
