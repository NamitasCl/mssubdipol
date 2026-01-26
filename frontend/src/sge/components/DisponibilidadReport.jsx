import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { CheckCircle, AlertCircle, Users, Truck, Package, Plus, Trash2, Flame } from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';
import AsyncUnidadesSelect from '../../components/ComponentesAsyncSelect/AsyncUnidadesSelect';
import commonServicesApi from '../../api/commonServicesApi';

const DisponibilidadReport = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        unidad: '',
        regionOJefatura: '',
        funcionariosDisponibles: 0,
        vehiculosDisponibles: 0,
        // equiposDisponibles removed from simple string state, handled separately or joined later
        observaciones: '',
        reportadoPor: '',

        estado: 'DISPONIBLE',
        eventoId: ''
    });

    // Structured equipment list
    const [equiposList, setEquiposList] = useState([]);
    const [newItem, setNewItem] = useState("");

    // Set reporter from auth user
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                reportadoPor: user.nombreUsuario || user.name || ''
            }));
        }
    }, [user]);

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic options from API
    const [regionesList, setRegionesList] = useState([]);
    const [jefaturasNacionales, setJefaturasNacionales] = useState([]);
    const [unitContext, setUnitContext] = useState(null);
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const res = await sgeApi.get('/eventos');
                const activos = res.data.filter(e => e.estado === 'ACTIVO' || !e.estado);
                setEventos(activos);
            } catch (e) {
                console.error("Error loading events", e);
            }
        };
        fetchEventos();
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Fetch regions and jefaturas in parallel
                const [regiones, jefaturas] = await Promise.all([
                    commonServicesApi.getRegionesPoliciales(),
                    commonServicesApi.getJefaturasNacionalesPrefecturas()
                ]);

                // Filter options as per user request
                const filteredRegiones = (Array.isArray(regiones) ? regiones : [])
                    .filter(r => r && r.startsWith("REGION POLICIAL"));

                const filteredJefaturas = (Array.isArray(jefaturas) ? jefaturas : [])
                    .filter(j => j && j.startsWith("JEFATURA NACIONAL"));

                setRegionesList(filteredRegiones);
                setJefaturasNacionales(filteredJefaturas);
            } catch (err) {
                console.error("Error fetching options:", err);
                // Fallback to empty or could show a toast error
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const payload = {
                ...formData,
                equiposDisponibles: JSON.stringify(equiposList)
            };
            await sgeApi.post('/disponibilidad', payload);
            setSubmitted(true);

            // Reset form
            setTimeout(() => {
                setFormData({
                    unidad: '',
                    regionOJefatura: '',
                    funcionariosDisponibles: 0,
                    vehiculosDisponibles: 0,
                    observaciones: '',
                    reportadoPor: user ? (user.nombreUsuario || user.name) : '',
                    estado: 'DISPONIBLE'
                });
                setEquiposList([]);
                setSubmitted(false);
            }, 3000);
        } catch (err) {
            console.error("Error reporting availability:", err);
            setError(err.response?.data?.message || "Error al enviar el reporte");
        }
    };


    const [inventory, setInventory] = useState([]);

    // Fetch inventory when unit changes
    useEffect(() => {
        if (formData.unidad) {
            const fetchInventory = async () => {
                try {
                    const res = await sgeApi.get(`/recursos?unidad=${unitContext?.unidad || formData.unidad}`);
                    setInventory(res.data);
                } catch (e) {
                    console.error("Error fetching inventory", e);
                    setInventory([]);
                }
            };
            fetchInventory();
        } else {
            setInventory([]);
        }
    }, [formData.unidad]);

    const addToEquipos = (item, quantity) => {
        if (quantity <= 0) return;
        const entry = {
            id: Date.now(),
            nombre: item.nombre, // Use standardized name
            cantidad: parseInt(quantity),
            tipo: item.tipo
        };
        setEquiposList([...equiposList, entry]);
    };

    const handleAutoFill = async () => {
        if (!formData.unidad) {
            alert("Por favor ingrese una unidad primero para buscar sus recursos.");
            return;
        }

        try {
            const [resFunc, resVeh] = await Promise.all([
                sgeApi.get(`/funcionarios/count?unidad=${formData.unidad}`),
                sgeApi.get(`/vehiculos/count?unidad=${formData.unidad}`)
            ]);

            setFormData(prev => ({
                ...prev,
                funcionariosDisponibles: resFunc.data,
                vehiculosDisponibles: resVeh.data,
                observaciones: `Datos cargados del sistema para: ${formData.unidad}. \n${prev.observaciones}`
            }));

            alert(`Se encontraron ${resFunc.data} funcionarios y ${resVeh.data} vehículos.`);
        } catch (error) {
            console.error("Error autofilling data:", error);
            alert("No se pudieron cargar datos. Verifique el nombre exacto de la unidad.");
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
                    <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
                    <h2 className="text-2xl font-bold text-green-900 mb-2">¡Reporte Enviado Exitosamente!</h2>
                    <p className="text-green-700">
                        Gracias por reportar la disponibilidad de recursos. La información ha sido registrada.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                <h1 className="text-3xl font-extrabold mb-2">Reporte de Disponibilidad de Recursos</h1>
                <p className="text-blue-100">
                    Indique los recursos disponibles en su unidad para despliegues de emergencia.
                    <strong> No requiere permisos especiales.</strong>
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={24} />
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}



            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">

                {/* Event Selector - CRITICAL */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Flame size={18} className="text-orange-500" />
                        Evento / Emergencia *
                    </label>
                    <select
                        name="eventoId"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                        value={formData.eventoId || ''}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione el evento al que reporta...</option>
                        {eventos.map(ev => (
                            <option key={ev.id} value={ev.id}>
                                {ev.descripcion} ({ev.tipo})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Los recursos que disponibilice quedarán asignados exclusivamente a la atención de este evento.
                    </p>
                </div>

                {/* Unidad y Región/Jefatura */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Unidad / Prefectura *
                        </label>

                        <div className="relative">
                            <AsyncUnidadesSelect
                                user={user}
                                onChange={async (option) => {
                                    if (option) {
                                        setFormData(prev => ({
                                            ...prev,
                                            unidad: option.label,
                                            // Auto-detect region if available in option
                                            regionOJefatura: option.regionPolicial || option.nombreRegion || prev.regionOJefatura
                                        }));

                                        // Fetch simplified context (Subdirection & Region)
                                        try {
                                            const ctx = await commonServicesApi.getUnitContext(option.label);
                                            setUnitContext(ctx);
                                        } catch (e) {
                                            console.error("Error context:", e);
                                            setUnitContext(null);
                                        }
                                    } else {
                                        setUnitContext(null);
                                    }
                                }}
                            />
                            {formData.unidad && (
                                <button
                                    type="button"
                                    onClick={handleAutoFill}
                                    className="absolute right-0 top-0 -mt-8 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                                    title="Cargar cantidad desde el sistema"
                                >
                                    <Package size={14} /> Auto-completar
                                </button>
                            )}
                        </div>
                        {formData.unidad && (
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                <p><span className="font-semibold text-blue-600">Seleccionado:</span> {formData.unidad}</p>
                                {unitContext && (
                                    <>
                                        <p><span className="font-semibold text-gray-700">Ubicación:</span> {unitContext.region}</p>
                                        <p><span className="font-semibold text-gray-700">Dependencia:</span> {unitContext.subdireccion}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Región o Jefatura Nacional *
                        </label>
                        <select
                            name="regionOJefatura"
                            value={formData.regionOJefatura}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccione...</option>
                            <optgroup label="Regiones Policiales">
                                {regionesList.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Jefaturas Nacionales">
                                {jefaturasNacionales.map(j => (
                                    <option key={j} value={j}>{j}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                </div>

                {/* Recursos Disponibles */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Recursos Disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <Users size={18} className="text-blue-600" />
                                Funcionarios Disponibles *
                            </label>
                            <input
                                type="number"
                                name="funcionariosDisponibles"
                                value={formData.funcionariosDisponibles}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <Truck size={18} className="text-blue-600" />
                                Vehículos Disponibles *
                            </label>
                            <input
                                type="number"
                                name="vehiculosDisponibles"
                                value={formData.vehiculosDisponibles}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <Package size={18} className="inline mr-1" /> Equipos del Inventario (Catálogo)
                        </label>

                        {inventory.length > 0 ? (
                            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b">
                                            <th className="pb-2">Equipo</th>
                                            <th className="pb-2">Tipo</th>
                                            <th className="pb-2">Disponibles</th>
                                            <th className="pb-2">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {inventory.map(item => {
                                            const used = equiposList
                                                .filter(e => e.nombre === item.nombre && e.tipo === item.tipo)
                                                .reduce((acc, e) => acc + (parseInt(e.cantidad) || 0), 0);
                                            const total = item.cantidad || 0; // Default to 0 if not set (legacy data)
                                            // Assume if quantity is null/undefined in DB, it's 1 for backward compatibility or handle as unlimited? 
                                            // User asked for limit based on inventory. If no quantity, maybe assume 1.
                                            // But we added quantity field recently, existing data might be null.
                                            // Let's treat null as 1 or just show 0? 
                                            // If it's 0 it will be disabled. 
                                            // Ideally backend migration sets default 1.
                                            // For now assume item.cantidad

                                            const remaining = Math.max(0, (item.cantidad || 0) - used);
                                            const isExhausted = remaining <= 0;

                                            return (
                                                <tr key={item.id} className={`group transition-colors ${isExhausted ? 'bg-gray-50 opacity-60' : 'hover:bg-white'}`}>
                                                    <td className="py-2 font-medium">{item.nombre}</td>
                                                    <td className="py-2 text-gray-500 text-xs">{item.tipo}</td>
                                                    <td className="py-2 text-xs">
                                                        <span className={`px-2 py-0.5 rounded-full font-bold ${isExhausted ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                                            {remaining} / {item.cantidad || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        <button
                                                            type="button"
                                                            disabled={isExhausted}
                                                            onClick={() => addToEquipos(item, 1)}
                                                            className={`text-xs font-bold border px-2 py-1 rounded transition-colors flex items-center gap-1 ${isExhausted
                                                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                                    : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-800 bg-white'
                                                                }`}
                                                        >
                                                            {isExhausted ? 'Agotado' : '+ Agregar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mb-4 text-xs text-gray-400 italic p-2 border border-dashed rounded">
                                No hay inventario registrado para esta unidad.
                            </div>
                        )}

                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Package size={18} className="text-blue-600" />
                            Equipos / Especialidades Disponibles (Manual)
                        </label>

                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Ej: 2 camionetas 4x4, 1 dron, 5 radios..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newItem.trim()) {
                                            setEquiposList([...equiposList, newItem.trim()]);
                                            setNewItem("");
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newItem.trim()) {
                                        setEquiposList([...equiposList, newItem.trim()]);
                                        setNewItem("");
                                    }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-1"
                            >
                                <Plus size={18} /> Agregar
                            </button>
                        </div>

                        {equiposList.length > 0 ? (
                            <ul className="space-y-2 bg-white p-3 rounded-lg border border-gray-200">
                                {equiposList.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                                        <span className="text-gray-700 font-medium">
                                            {typeof item === 'object' ? `${item.cantidad}x ${item.nombre} (${item.tipo})` : item}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setEquiposList(equiposList.filter((_, i) => i !== index))}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No hay equipos agregados aún.</p>
                        )}
                    </div>
                </div>

                {/* Observaciones */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Observaciones Adicionales
                    </label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Cualquier información adicional relevante..."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Reportado Por */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Reportado Por
                    </label>
                    <input
                        type="text"
                        name="reportadoPor"
                        value={formData.reportadoPor}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg text-gray-600 font-medium cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Detectado automáticamente del usuario en sesión
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg flex items-center gap-2 text-lg"
                    >
                        <CheckCircle size={24} />
                        Enviar Reporte
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DisponibilidadReport;
