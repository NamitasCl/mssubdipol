import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { obtenerSolicitudesPendientes, aprobarSolicitud, rechazarSolicitud } from "../../api/solicitudCambioApi.js";
import { 
    CheckCircle, XCircle, AlertCircle, Clock, Calendar, User, 
    Loader2, RefreshCw, MessageSquare, ArrowRight
} from "lucide-react";
import clsx from "clsx";

export default function AprobacionCambios() {
    const { user } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(null);
    const [observacion, setObservacion] = useState("");
    const [modalSolicitud, setModalSolicitud] = useState(null);
    const [modalAccion, setModalAccion] = useState(null); // "aprobar" | "rechazar"

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await obtenerSolicitudesPendientes();
            setSolicitudes(data || []);
        } catch (err) {
            console.error("Error cargando solicitudes:", err);
            setError("Error al cargar las solicitudes pendientes.");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = (sol) => {
        setModalSolicitud(sol);
        setModalAccion("aprobar");
        setObservacion("");
    };

    const handleRechazar = (sol) => {
        setModalSolicitud(sol);
        setModalAccion("rechazar");
        setObservacion("");
    };

    const confirmarAccion = async () => {
        if (!modalSolicitud) return;

        setProcesando(modalSolicitud.id);
        try {
            if (modalAccion === "aprobar") {
                await aprobarSolicitud(modalSolicitud.id, observacion, user.idFuncionario, user.nombreCompleto);
            } else {
                await rechazarSolicitud(modalSolicitud.id, observacion, user.idFuncionario, user.nombreCompleto);
            }
            setModalSolicitud(null);
            setModalAccion(null);
            cargarSolicitudes();
        } catch (err) {
            console.error("Error procesando solicitud:", err);
            setError("Error al procesar la solicitud.");
        } finally {
            setProcesando(null);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString("es-CL", {
            weekday: "short", day: "numeric", month: "short"
        });
    };

    const getTipoLabel = (tipo) => {
        const tipos = {
            PERMUTA: { label: "Permuta", bg: "bg-purple-100 text-purple-700" },
            DEVOLUCION: { label: "Devolución", bg: "bg-blue-100 text-blue-700" },
            CESION: { label: "Cesión", bg: "bg-amber-100 text-amber-700" }
        };
        return tipos[tipo] || { label: tipo, bg: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                                </div>
                                Aprobación de Cambios de Turno
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Revisa y decide sobre las solicitudes de cambio pendientes
                            </p>
                        </div>
                        <button
                            onClick={cargarSolicitudes}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                            Actualizar
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 flex gap-4">
                        <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <span className="text-2xl font-bold text-yellow-700">{solicitudes.length}</span>
                            <span className="text-sm text-yellow-600 ml-2">Pendientes</span>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Lista de Solicitudes */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : solicitudes.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700">Sin solicitudes pendientes</h3>
                        <p className="text-gray-500 mt-1">Todas las solicitudes han sido procesadas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {solicitudes.map((sol) => (
                            <div
                                key={sol.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* Header row */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", getTipoLabel(sol.tipoCambio).bg)}>
                                                {getTipoLabel(sol.tipoCambio).label}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                Solicitud #{sol.id}
                                            </span>
                                        </div>

                                        {/* User info */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-800">
                                                {sol.nombreFuncionarioSolicitante}
                                            </span>
                                        </div>

                                        {/* Turno info */}
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">{sol.nombreServicioOriginal}</span>
                                                <span className="text-gray-400 mx-2">•</span>
                                                <span className="text-gray-600">{formatFecha(sol.fechaSlotOriginal)}</span>
                                                {sol.recintoOriginal && (
                                                    <>
                                                        <span className="text-gray-400 mx-2">•</span>
                                                        <span className="text-gray-500">{sol.recintoOriginal}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Motivo */}
                                        {sol.motivo && (
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="italic">"{sol.motivo}"</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleAprobar(sol)}
                                            disabled={procesando === sol.id}
                                            className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => handleRechazar(sol)}
                                            disabled={procesando === sol.id}
                                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Confirmación */}
            {modalSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className={clsx(
                            "px-6 py-4 border-b",
                            modalAccion === "aprobar" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                        )}>
                            <h2 className="text-lg font-bold text-gray-800">
                                {modalAccion === "aprobar" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700">
                                {modalAccion === "aprobar" 
                                    ? `¿Confirmas aprobar el cambio de turno de ${modalSolicitud.nombreFuncionarioSolicitante}?`
                                    : `¿Confirmas rechazar la solicitud de ${modalSolicitud.nombreFuncionarioSolicitante}?`
                                }
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observación (opcional)
                                </label>
                                <textarea
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    placeholder="Agrega una nota para el solicitante..."
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setModalSolicitud(null); setModalAccion(null); }}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarAccion}
                                    disabled={procesando}
                                    className={clsx(
                                        "flex-1 py-2.5 px-4 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
                                        modalAccion === "aprobar" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                    )}
                                >
                                    {procesando ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : modalAccion === "aprobar" ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Confirmar Aprobación
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            Confirmar Rechazo
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
