import React, { useEffect, useState } from "react";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect";
import axios from "axios";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { X, Plus, Trash2, Loader2, Share2, Users, Building2, Check } from "lucide-react";

export default function DelegarCuotaFormulario({ show, cuota, formulario, onClose, onDelegado }) {
    const { user } = useAuth();

    const [tipoDestino, setTipoDestino] = useState("unidad");
    const [destinoObj, setDestinoObj] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [subcuotas, setSubcuotas] = useState([]);
    const [delegadas, setDelegadas] = useState([]);
    const [cargandoDelegadas, setCargandoDelegadas] = useState(false);

    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [success, setSuccess] = useState(null);

    // Reset state on close
    useEffect(() => {
        if (!show) {
            setTipoDestino("unidad");
            setDestinoObj(null);
            setCantidad(1);
            setSubcuotas([]);
            setDelegadas([]);
            setCargandoDelegadas(false);
            setError(null);
            setGuardando(false);
            setSuccess(null);
        }
    }, [show]);

    // Load existing delegations
    useEffect(() => {
        if (!show || !cuota?.id) return;
        setCargandoDelegadas(true);
        axios.get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/padre/${cuota.id}`,
            { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => setDelegadas(res.data || []))
            .catch(() => setDelegadas([]))
            .finally(() => setCargandoDelegadas(false));
    }, [show, cuota, user.token]);

    if (!show || !cuota) return null;

    const totalAsignado = [
        ...delegadas.map(d => d.cuotaAsignada ?? 0),
        ...subcuotas.map(sc => Number(sc.cantidad) || 0)
    ].reduce((sum, x) => sum + x, 0);

    const cuotaRestante = (cuota.cuotaAsignada ?? 0) - totalAsignado;

    const agregarSubcuota = () => {
        if (!destinoObj || !cantidad || cantidad < 1) return;
        if (cantidad > cuotaRestante) {
            setError("No puedes asignar más de la cuota restante.");
            return;
        }
        setError(null);
        setSubcuotas(prev => [
            ...prev,
            { tipoDestino, destinoObj, cantidad: Number(cantidad) }
        ]);
        setDestinoObj(null);
        setCantidad(1);
    };

    const eliminarSubcuota = idx => setSubcuotas(subcuotas.filter((_, i) => i !== idx));

    const guardarDelegaciones = async () => {
        setGuardando(true);
        setError(null);
        setSuccess(null);
        try {
            for (const sc of subcuotas) {
                await axios.post(
                    `${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/delegar`,
                    {
                        formularioId: cuota.formularioId,
                        cuotaPadreId: cuota.id,
                        cuotaAsignada: sc.cantidad,
                        idUnidad: sc.tipoDestino === "unidad" ? (sc.destinoObj.idUnidad || sc.destinoObj.value) : null,
                        idFuncionario: sc.tipoDestino === "usuario" ? (sc.destinoObj.idFun || sc.destinoObj.value) : null
                    },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
            }
            setSuccess("Delegación registrada correctamente");
            setSubcuotas([]);
            if (onDelegado) onDelegado();
            // Reload delegations
            setCargandoDelegadas(true);
            axios.get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/padre/${cuota.id}`,
                { headers: { Authorization: `Bearer ${user.token}` } })
                .then(res => setDelegadas(res.data || []))
                .finally(() => setCargandoDelegadas(false));
        } catch {
            setError("Error al guardar delegaciones");
        } finally {
            setGuardando(false);
        }
    };

    const renderDestinoDelegada = (d) => {
        if (d.nombreUnidad) return d.nombreUnidad;
        if (d.nombreFuncionario) return d.nombreFuncionario;
        if (d.idUnidad) return `Unidad #${d.idUnidad}`;
        if (d.idFuncionario) return `Funcionario #${d.idFuncionario}`;
        return "?";
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Share2 size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Distribuir Cuota</h3>
                            <p className="text-sm text-gray-500">{formulario?.nombre || "Formulario"}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium mb-1">Cuota asignada</p>
                            <p className="text-2xl font-bold text-blue-700">{cuota.cuotaAsignada ?? 0}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-medium mb-1">Total repartido</p>
                            <p className="text-2xl font-bold text-emerald-700">{totalAsignado}</p>
                        </div>
                        <div className={`rounded-xl p-4 border ${cuotaRestante === 0 ? 'bg-gray-50 border-gray-200' : 'bg-amber-50 border-amber-100'}`}>
                            <p className={`text-xs font-medium mb-1 ${cuotaRestante === 0 ? 'text-gray-500' : 'text-amber-600'}`}>Restante</p>
                            <p className={`text-2xl font-bold ${cuotaRestante === 0 ? 'text-gray-400' : 'text-amber-700'}`}>{cuotaRestante}</p>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                            <X size={16} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <Check size={16} />
                            {success}
                        </div>
                    )}

                    {/* Add Delegation Form */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                        <h4 className="font-semibold text-gray-700 text-sm mb-3">Nueva delegación</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
                                <select
                                    value={tipoDestino}
                                    onChange={e => { setTipoDestino(e.target.value); setDestinoObj(null); }}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="unidad">Unidad</option>
                                    <option value="usuario">Funcionario</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Destino</label>
                                {tipoDestino === "unidad" ? (
                                    <AsyncUnidadesSelect
                                        value={destinoObj}
                                        onChange={setDestinoObj}
                                        isClearable
                                        user={user}
                                    />
                                ) : (
                                    <AsyncFuncionarioSelect
                                        value={destinoObj}
                                        onChange={setDestinoObj}
                                        isClearable
                                        user={user}
                                    />
                                )}
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Cantidad</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={cuotaRestante}
                                        value={cantidad}
                                        onChange={e => setCantidad(Number(e.target.value))}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={agregarSubcuota}
                                    disabled={!destinoObj || !cantidad || cantidad < 1 || cantidad > cuotaRestante}
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Delegations */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                            <Building2 size={16} />
                            Cuotas ya delegadas
                        </h4>
                        {cargandoDelegadas ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">#</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Destino</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Tipo</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {delegadas.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                                                    No hay delegaciones guardadas aún
                                                </td>
                                            </tr>
                                        )}
                                        {delegadas.map((d, i) => (
                                            <tr key={d.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">{i + 1}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{renderDestinoDelegada(d)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${d.idUnidad ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {d.idUnidad ? <Building2 size={12} /> : <Users size={12} />}
                                                        {d.idUnidad ? "Unidad" : "Funcionario"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                        {d.cuotaAsignada}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pending Delegations */}
                    {subcuotas.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                                <Share2 size={16} />
                                Delegaciones pendientes de guardar
                            </h4>
                            <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-amber-100/50 border-b border-amber-200">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700">#</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700">Destino</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700">Tipo</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700">Cantidad</th>
                                            <th className="px-4 py-2.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-200">
                                        {subcuotas.map((sc, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-sm text-amber-800">{i + 1}</td>
                                                <td className="px-4 py-3 text-sm text-amber-900 font-medium">
                                                    {sc.tipoDestino === "unidad"
                                                        ? sc.destinoObj.nombreUnidad || sc.destinoObj.label
                                                        : `${sc.destinoObj.nombreFun || ""} ${sc.destinoObj.apellidoPaternoFun || ""} ${sc.destinoObj.apellidoMaternoFun || ""}`.trim()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-amber-800">
                                                    {sc.tipoDestino === "unidad" ? "Unidad" : "Funcionario"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
                                                        {sc.cantidad}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => eliminarSubcuota(i)}
                                                        className="p-1.5 text-amber-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={guardarDelegaciones}
                        disabled={guardando || subcuotas.length === 0 || cuotaRestante < 0}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {guardando ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        Guardar delegaciones
                    </button>
                </div>
            </div>
        </div>
    );
}