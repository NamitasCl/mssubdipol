import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { obtenerMisTurnos, obtenerHistorialSolicitudes } from "../../api/solicitudCambioApi.js";
import { 
    Calendar, Clock, MapPin, User, AlertCircle, ChevronLeft, ChevronRight,
    CheckCircle, XCircle, Loader2, RefreshCw, Filter
} from "lucide-react";
import clsx from "clsx";
import SolicitudCambioModal from "./SolicitudCambioModal.jsx";

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function MisTurnos() {
    const { user } = useAuth();
    const [turnos, setTurnos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Filtros
    const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());
    const [vistaActiva, setVistaActiva] = useState("turnos"); // turnos | historial
    
    // Modal de solicitud
    const [showSolicitudModal, setShowSolicitudModal] = useState(false);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

    useEffect(() => {
        if (user?.idFuncionario) {
            cargarDatos();
        }
    }, [user?.idFuncionario, mesActual, anioActual]);

    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            const [turnosData, historialData] = await Promise.all([
                obtenerMisTurnos(user.idFuncionario, mesActual, anioActual),
                obtenerHistorialSolicitudes(user.idFuncionario)
            ]);
            setTurnos(turnosData || []);
            setHistorial(historialData || []);
        } catch (err) {
            console.error("Error cargando datos:", err);
            setError("Error al cargar tus turnos. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleMesAnterior = () => {
        if (mesActual === 1) {
            setMesActual(12);
            setAnioActual(anioActual - 1);
        } else {
            setMesActual(mesActual - 1);
        }
    };

    const handleMesSiguiente = () => {
        if (mesActual === 12) {
            setMesActual(1);
            setAnioActual(anioActual + 1);
        } else {
            setMesActual(mesActual + 1);
        }
    };

    const handleSolicitarCambio = (turno) => {
        setTurnoSeleccionado(turno);
        setShowSolicitudModal(true);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "-";
        const d = new Date(fecha);
        const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        return `${dias[d.getDay()]} ${d.getDate()}`;
    };

    const formatHora = (hora) => {
        if (!hora) return "-";
        return hora.substring(0, 5);
    };

    const getEstadoBadge = (estado) => {
        const estilos = {
            PENDIENTE: "bg-yellow-100 text-yellow-800",
            APROBADA: "bg-green-100 text-green-800",
            RECHAZADA: "bg-red-100 text-red-800",
            CANCELADA: "bg-gray-100 text-gray-600"
        };
        return estilos[estado] || "bg-gray-100 text-gray-600";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                Mis Turnos
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Consulta tus turnos asignados y solicita cambios
                            </p>
                        </div>
                        <button
                            onClick={cargarDatos}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                            Actualizar
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6 border-b border-gray-100 pb-1">
                        <button
                            onClick={() => setVistaActiva("turnos")}
                            className={clsx(
                                "px-4 py-2 rounded-t-lg font-medium transition-colors",
                                vistaActiva === "turnos"
                                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            📅 Turnos Asignados
                        </button>
                        <button
                            onClick={() => setVistaActiva("historial")}
                            className={clsx(
                                "px-4 py-2 rounded-t-lg font-medium transition-colors",
                                vistaActiva === "historial"
                                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            📋 Historial de Solicitudes
                            {historial.filter(h => h.estado === "PENDIENTE").length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    {historial.filter(h => h.estado === "PENDIENTE").length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Vista de Turnos */}
                {vistaActiva === "turnos" && (
                    <>
                        {/* Navegación de Mes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                            <button
                                onClick={handleMesAnterior}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-800">
                                {MESES[mesActual - 1]} {anioActual}
                            </h2>
                            <button
                                onClick={handleMesSiguiente}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Lista de Turnos */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : turnos.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700">Sin turnos asignados</h3>
                                <p className="text-gray-500 mt-1">No tienes turnos asignados para este mes.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {turnos.map((turno) => (
                                    <div
                                        key={turno.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                                                        {formatFecha(turno.fecha)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="font-medium">
                                                            {formatHora(turno.horaInicio)} - {formatHora(turno.horaFin)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-gray-800">{turno.nombreServicio}</h3>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                    {turno.recinto && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {turno.recinto}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        {turno.rolRequerido?.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSolicitarCambio(turno)}
                                                className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                                            >
                                                Solicitar Cambio
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Vista de Historial */}
                {vistaActiva === "historial" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Historial de Solicitudes</h3>
                        </div>
                        {historial.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No has realizado solicitudes de cambio.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {historial.map((sol) => (
                                    <div key={sol.id} className="p-4 hover:bg-gray-50/50">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", getEstadoBadge(sol.estado))}>
                                                        {sol.estado}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {sol.tipoCambio?.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">
                                                    <strong>Turno:</strong> {sol.nombreServicioOriginal} - {formatFecha(sol.fechaSlotOriginal)}
                                                </p>
                                                {sol.motivo && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        <strong>Motivo:</strong> {sol.motivo}
                                                    </p>
                                                )}
                                                {sol.observacionAprobador && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        <strong>Respuesta:</strong> {sol.observacionAprobador}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm text-gray-400">
                                                {sol.fechaSolicitud && new Date(sol.fechaSolicitud).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Solicitud */}
            {showSolicitudModal && turnoSeleccionado && (
                <SolicitudCambioModal
                    turno={turnoSeleccionado}
                    onClose={() => {
                        setShowSolicitudModal(false);
                        setTurnoSeleccionado(null);
                    }}
                    onSuccess={() => {
                        setShowSolicitudModal(false);
                        setTurnoSeleccionado(null);
                        cargarDatos();
                    }}
                />
            )}
        </div>
    );
}
