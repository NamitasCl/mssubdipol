import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import { registrarDiaNoDisponibleGlobal } from "../../api/diasNoDisponiblesGlobalesApi.js";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { X, Calendar as CalendarIcon, AlertCircle, Plus, Trash2, Save, Info } from "lucide-react";

const MOTIVOS = [
    "Feriado legal",
    "Licencia médica",
    "Permiso Administrativo",
    "Cometido funcionario",
    "Permiso parental",
    "Otro"
];

export default function IngresoFuncionarioConDiasNoDisponibles({ show, onHide, onGuardado, calendario }) {
    const { user } = useAuth();
    const [nuevoFuncionario, setNuevoFuncionario] = useState(null);
    const [seleccion, setSeleccion] = useState({ from: undefined, to: undefined });
    const [motivo, setMotivo] = useState("");
    const [detalle, setDetalle] = useState("");
    const [bloques, setBloques] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [faltanDias, setFaltanDias] = useState(false);

    if (!show) return null;

    const getResumenSeleccion = () => {
        if (!seleccion.from) return "No hay fechas";
        if (!seleccion.to) return seleccion.from.toLocaleDateString("es-CL");
        const fechas = [];
        let date = new Date(seleccion.from);
        while (date <= seleccion.to) {
            fechas.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return fechas.map(d => d.toLocaleDateString("es-CL")).join(", ");
    };

    const limpiarSeleccion = () => {
        setSeleccion({ from: undefined, to: undefined });
        setMotivo("");
        setDetalle("");
        setFaltanDias(false);
    };

    const handleAgregarBloque = () => {
        if (!seleccion.from || !motivo) {
            setFaltanDias(true);
            return;
        }
        const fechas = [];
        let date = new Date(seleccion.from);
        const to = seleccion.to || seleccion.from;
        while (date <= to) {
            fechas.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        setBloques(prev => [
            ...prev,
            {
                dias: fechas,
                motivo,
                detalle: motivo === "Otro" ? detalle : ""
            }
        ]);
        limpiarSeleccion();
    };

    const handleQuitarBloque = (idx) => {
        setBloques(prev => prev.filter((_, i) => i !== idx));
    };

    const handleRegistrar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        if (!nuevoFuncionario) {
            setError("Debes seleccionar un funcionario.");
            setGuardando(false);
            return;
        }
        if (bloques.length === 0) {
            setError("Debes agregar al menos un grupo de días no disponibles.");
            setGuardando(false);
            return;
        }

        const dias = bloques.flatMap(b =>
            b.dias.map(d => ({
                fecha: d.toISOString().slice(0, 10),
                motivo: b.motivo,
                detalle: b.motivo === "Otro" ? b.detalle : ""
            }))
        );

        const dto = {
            idFuncionario: parseInt(nuevoFuncionario.value, 10),
            dias
        };

        try {
            await registrarDiaNoDisponibleGlobal(dto);
            setNuevoFuncionario(null);
            setBloques([]);
            setError(null);
            setFaltanDias(false);
            if (onGuardado) onGuardado();
            if (onHide) onHide();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Error al registrar días no disponibles");
        } finally {
            setGuardando(false);
        }
    };

    const disableSubmit = guardando || !nuevoFuncionario || bloques.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900">Registrar Novedades / Días No Disponibles</h3>
                    <button onClick={onHide} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800">
                             <AlertCircle className="shrink-0 mt-0.5" size={18} />
                             <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleRegistrar}>
                        <div className="grid md:grid-cols-12 gap-6 mb-6">
                            <div className="md:col-span-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Funcionario</label>
                                <AsyncFuncionarioSelect
                                    value={nuevoFuncionario}
                                    onChange={setNuevoFuncionario}
                                    user={user}
                                />
                            </div>
                            <div className="md:col-span-4 flex items-end">
                                <button
                                    type="submit"
                                    disabled={disableSubmit}
                                    className="w-full flex items-center justify-center gap-2 bg-pdi-base hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                                >
                                     {guardando ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Guardar Registros
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                         <div className="border-t border-gray-100 pt-6">
                             <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CalendarIcon size={18} className="text-gray-400"/>
                                Configurar Bloques
                            </h4>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Selecciona un rango de fechas:</label>
                                    <div className="border border-gray-200 rounded-xl p-2 bg-white inline-block shadow-sm">
                                        <DayPicker
                                            mode="range"
                                            selected={seleccion}
                                            onSelect={setSeleccion}
                                            styles={{
                                                head_cell: { color: '#6b7280', fontSize: '0.875rem' },
                                                day: { borderRadius: '0.5rem' }
                                            }}
                                            modifiersClassNames={{
                                                selected: 'bg-pdi-base text-white hover:bg-blue-800',
                                                today: 'font-bold text-blue-600'
                                            }}
                                        />
                                    </div>
                                    
                                     {(seleccion.from || seleccion.to) ? (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex items-start gap-2">
                                            <Info size={16} className="mt-0.5 shrink-0" />
                                            <span><b>Fechas:</b> {getResumenSeleccion()}</span>
                                        </div>
                                    ) : faltanDias && (
                                         <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 flex items-start gap-2">
                                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                            <span>Selecciona fechas y motivo para continuar.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo</label>
                                        <select
                                            value={motivo}
                                            onChange={e => setMotivo(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none mb-3"
                                        >
                                            <option value="">Seleccione motivo...</option>
                                            {MOTIVOS.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        
                                        {motivo === "Otro" && (
                                            <input
                                                type="text"
                                                value={detalle}
                                                onChange={e => setDetalle(e.target.value)}
                                                placeholder="Especificar motivo"
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none mb-3"
                                                required
                                            />
                                        )}
                                        
                                        <button
                                            type="button"
                                            onClick={handleAgregarBloque}
                                            disabled={!seleccion.from || !motivo}
                                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Plus size={16} /> Agregar Bloque
                                        </button>
                                     </div>

                                     {bloques.length > 0 && (
                                        <div className="max-h-[250px] overflow-y-auto border border-gray-100 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2">Fechas</th>
                                                        <th className="px-3 py-2">Motivo</th>
                                                        <th className="px-3 py-2 text-right">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {bloques.map((b, idx) => (
                                                        <tr key={idx} className="bg-white">
                                                            <td className="px-3 py-2 text-xs">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {b.dias.map(d => (
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600" key={d.toISOString()}>
                                                                            {d.toLocaleDateString("es-CL")}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-700">
                                                                <div className="font-medium">{b.motivo}</div>
                                                                {b.detalle && <div className="text-gray-400 text-xs">{b.detalle}</div>}
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuitarBloque(idx)}
                                                                    className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button onClick={onHide} disabled={guardando} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}