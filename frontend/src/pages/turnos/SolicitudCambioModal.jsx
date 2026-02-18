import React, { useState } from "react";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { crearSolicitudCambio } from "../../api/solicitudCambioApi.js";
import { X, Calendar, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

const TIPOS_CAMBIO = [
    { value: "PERMUTA", label: "Permuta", desc: "Intercambias turno con otro funcionario" },
    { value: "DEVOLUCION", label: "Devolución", desc: "Otro funcionario toma tu turno y te devuelve después" },
    { value: "CESION", label: "Cesión", desc: "Cedes tu turno sin devolución" }
];

export default function SolicitudCambioModal({ turno, onClose, onSuccess }) {
    const { user } = useAuth();
    const [tipoCambio, setTipoCambio] = useState("CESION");
    const [motivo, setMotivo] = useState("");
    const [funcionarioReemplazo, setFuncionarioReemplazo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!motivo.trim()) {
            setError("Debes indicar un motivo para el cambio");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await crearSolicitudCambio({
                idSlotOriginal: turno.id,
                tipoCambio,
                motivo,
                idFuncionarioReemplazo: funcionarioReemplazo?.id || null,
                nombreFuncionarioReemplazo: funcionarioReemplazo?.nombre || null
            }, user.idFuncionario, user.nombreCompleto);

            onSuccess?.();
        } catch (err) {
            console.error("Error creando solicitud:", err);
            setError(err.response?.data?.message || "Error al crear la solicitud. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString("es-CL", {
            weekday: "long", day: "numeric", month: "long"
        });
    };

    const formatHora = (hora) => hora?.substring(0, 5) || "-";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Solicitar Cambio de Turno</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Turno Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">{turno.nombreServicio}</h3>
                            <p className="text-sm text-gray-500">
                                {formatFecha(turno.fecha)} • {formatHora(turno.horaInicio)} - {formatHora(turno.horaFin)}
                            </p>
                            {turno.recinto && (
                                <p className="text-xs text-gray-400 mt-0.5">{turno.recinto}</p>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Tipo de Cambio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Cambio
                        </label>
                        <div className="grid gap-2">
                            {TIPOS_CAMBIO.map((tipo) => (
                                <button
                                    key={tipo.value}
                                    type="button"
                                    onClick={() => setTipoCambio(tipo.value)}
                                    className={clsx(
                                        "text-left p-3 rounded-xl border transition-all",
                                        tipoCambio === tipo.value
                                            ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                    )}
                                >
                                    <div className="font-medium text-gray-800">{tipo.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{tipo.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Motivo del Cambio <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Explica brevemente por qué necesitas el cambio..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all resize-none"
                            required
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 px-4 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Solicitud"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
