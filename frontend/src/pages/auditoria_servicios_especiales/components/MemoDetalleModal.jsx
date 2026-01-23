import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { colorEstado, esPersonaDetenida, estadoColors } from "../utils/auditoriaMemosUtils.js";
import HistorialRevisiones from "./HistorialRevisiones.jsx";
import { obtenerHistorialRevisiones } from "../../../api/nodosApi.js";

export default function MemoDetalleModal({
    selected,
    onHide,
    onAprobar,
    onObservar,
    onJenadep,
    user
}) {
    if (!selected) return null;

    const rolesPermitidosJenadep = ["ROLE_JENADEP", "ROLE_JEFE", "ROLE_ADMINISTRADOR"];
    const rolesPermitidosAuditoria = ["ROLE_REVISOR", "ROLE_JEFE", "ROLE_ADMINISTRADOR"];

    // Estados
    const [historialCount, setHistorialCount] = useState(0);
    const [latestObservation, setLatestObservation] = useState(null);
    const [activeTab, setActiveTab] = useState("personas");

    // Cargar historial
    useEffect(() => {
        if (selected && selected.id) {
            obtenerHistorialRevisiones(selected.id, user?.token)
                .then(data => {
                    const revs = Array.isArray(data) ? data : [];
                    setHistorialCount(revs.length);
                    const sorted = [...revs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    if (selected.estado === "PENDIENTE" || selected.estado === "OBSERVADO") {
                        const lastObs = sorted.find(r => r.observaciones && r.observaciones.trim() !== "");
                        setLatestObservation(lastObs || null);
                    } else {
                        setLatestObservation(null);
                    }
                })
                .catch(err => console.error("Error cargando historial count:", err));
        }
    }, [selected, user]);

    // Render helpers
    const TabButton = ({ id, label, icon, count, color = "blue" }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all w-full text-left bg-white
                ${activeTab === id
                    ? `text-${color}-600 bg-${color}-50 border-l-4 border-${color}-600 shadow-sm`
                    : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"}
            `}
        >
            <span className="text-lg">{icon}</span>
            <span className="flex-1">{label}</span>
            {count !== undefined && (
                <span className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${activeTab === id ? `bg-${color}-100 text-${color}-700` : "bg-gray-100 text-gray-500"}
                `}>
                    {count}
                </span>
            )}
        </button>
    );

    const EmptyState = ({ message }) => (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <span className="text-4xl mb-2 opacity-50">∅</span>
            <span className="text-sm">{message}</span>
        </div>
    );

    return (
        <Modal show={!!selected} onHide={onHide} size="xl" centered contentClassName="border-0 shadow-2xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Memo #{selected.folio || selected.id}
                        <span className="text-xs font-normal text-gray-400 border px-2 py-0.5 rounded">ID: {selected.id}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <i className="bi bi-geo-alt"></i>
                        <span>{selected.unidad}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium border border-gray-200">
                        {selected.tipo}
                    </span>
                    <span
                        className="px-3 py-1 text-white rounded-md text-sm font-medium shadow-sm"
                        style={{ backgroundColor: estadoColors[selected.estado] }}
                    >
                        {selected.estado === "SIN_REVISAR" ? "PENDIENTE REVISIÓN" : selected.estado}
                    </span>
                    <button onClick={onHide} className="ml-2 text-gray-400 hover:text-gray-600">
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>
            </div>

            {/* Body Pipeline */}
            <div className="bg-gray-50 flex flex-col lg:flex-row h-[75vh] overflow-hidden">

                {/* LEFT: Main Content (Relato) */}
                <div className="w-full lg:w-8/12 flex flex-col h-full border-r border-gray-200 bg-white">
                    {/* Alert Section */}
                    {latestObservation && (
                        <div className="m-4 mb-2 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md shadow-sm">
                            <div className="flex gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Requiere Corrección</h3>
                                    <div className="mt-2 text-gray-800 italic bg-white p-3 rounded border border-yellow-100 text-sm">
                                        "{latestObservation.observaciones}"
                                    </div>
                                    <div className="mt-2 text-xs text-right text-yellow-700">
                                        Por <strong>{latestObservation.nombreRevisor}</strong> • {new Date(latestObservation.createdAt).toLocaleString("es-CL")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-6 py-4 border-b bg-gray-50/50">
                        <span className="text-xl">📝</span>
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Relato del Hecho</h3>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30">
                        {selected.relato ? (
                            <div className="prose max-w-none text-gray-800 whitespace-pre-line leading-relaxed text-sm lg:text-base bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[500px]">
                                {selected.relato}
                            </div>
                        ) : (
                            <EmptyState message="Sin relato disponible" />
                        )}
                    </div>

                    <div className="px-6 py-3 bg-white border-t text-xs text-gray-500 flex justify-between">
                        <span><strong>Fecha del hecho:</strong> {selected.fecha}</span>
                        <span><strong>RUC:</strong> {selected.ruc}</span>
                    </div>
                </div>

                {/* RIGHT: Sidebar (Tabs & Data) */}
                <div className="w-full lg:w-4/12 flex flex-col h-full bg-gray-100 border-l border-gray-200 text-sm">
                    {/* Tabs Header */}
                    <div className="flex overflow-x-auto bg-white border-b shadow-sm no-scrollbar">
                        {/* We use a vertical layout for tabs within the sidebar if space permits, or horizontal if not. 
                             Actually, standard horizontal icons + text might be better for this narrow column? 
                             Or maybe just a clean list. Let's do horizontal scrollable tabs. 
                         */}
                        <nav className="flex lg:grid lg:grid-cols-3 w-full" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab("personas")}
                                className={`flex-1 py-3 text-center border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${activeTab === "personas" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                👥 Per ({selected.personas.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("armas")}
                                className={`flex-1 py-3 text-center border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${activeTab === "armas" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                🔫 Arm ({selected.armas.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("drogas")}
                                className={`flex-1 py-3 text-center border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${activeTab === "drogas" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                💊 Dro ({selected.drogas.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("especies")}
                                className={`flex-1 py-3 text-center border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${activeTab === "especies" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                📦 Esp ({selected.otrasEspecies.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("funcionarios")}
                                className={`flex-1 py-3 text-center border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${activeTab === "funcionarios" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                👮 Fun ({selected.funcionarios.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("historial")}
                                className={`flex-1 py-3 text-center border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${activeTab === "historial" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                🕒 Hist
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === "personas" && (
                            <div className="space-y-3">
                                {selected.personas.length === 0 ? <EmptyState message="No hay personas" /> : (
                                    selected.personas.map((p, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-gray-800 block truncate" title={p.nombre || "N/N"}>{p.nombre || "N/N"}</span>
                                                <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                                                    {p.estados?.map((e, i) => (
                                                        <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${esPersonaDetenida([e]) ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                                                            {e}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 flex flex-wrap gap-2 items-center">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">{p.rut || "S/RUT"}</span>
                                                <span className="text-gray-300">•</span>
                                                <span>{p.edad ? `${p.edad} años` : "S/Edad"}</span>
                                                <span className="text-gray-300">•</span>
                                                <span>{p.nacionalidad || "S/Nacionalidad"}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "armas" && (
                            <div className="space-y-3">
                                {selected.armas.length === 0 ? <EmptyState message="No hay armas" /> : (
                                    selected.armas.map((a, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                            <div className="font-bold text-gray-800 text-sm">{a.tipo || "Arma sin tipo"}</div>
                                            <div className="mt-1 text-xs text-gray-600 flex flex-col gap-1">
                                                <span><span className="font-semibold">Marca:</span> {a.marca || "—"}</span>
                                                <span><span className="font-semibold">Serie:</span> {a.serie || "—"}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "drogas" && (
                            <div className="space-y-3">
                                {selected.drogas.length === 0 ? <EmptyState message="No hay drogas" /> : (
                                    selected.drogas.map((d, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                            <div className="font-bold text-gray-800 text-sm">{d.tipo}</div>
                                            <div className="mt-1 text-xs text-gray-600">
                                                {d.cantidad} {d.unidad}
                                                {d.obs && <span className="block mt-1 italic text-gray-400">{d.obs}</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "especies" && (
                            <div className="space-y-3">
                                {selected.otrasEspecies.length === 0 ? <EmptyState message="No hay especies" /> : (
                                    selected.otrasEspecies.map((oe, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                            <div className="font-bold text-gray-800 text-sm">{oe.descripcion || "Especie"}</div>
                                            <div className="mt-1 text-xs text-gray-600 flex gap-3">
                                                <span>Cant: {oe.cantidad || "—"}</span>
                                                <span>Avalúo: {oe.avaluo || "—"}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "funcionarios" && (
                            <div className="space-y-3">
                                {selected.funcionarios.length === 0 ? <EmptyState message="No hay funcionarios" /> : (
                                    selected.funcionarios.map((f, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                            <div className="font-bold text-gray-800 text-sm">{f.nombre}</div>
                                            <div className="mt-1 text-[10px] text-gray-500 uppercase tracking-wide bg-gray-50 inline-block px-1 rounded">
                                                {f.responsabilidad || "Sin responsabilidad"}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "historial" && (
                            <div className="bg-white p-2 rounded-md shadow-sm h-full">
                                <HistorialRevisiones memoId={selected.id} simpleView={true} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-6 py-4 border-t flex justify-between items-center">
                <button
                    onClick={onHide}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                    Cancelar
                </button>
                <div className="flex gap-3">
                    {rolesPermitidosJenadep.some(valor => user.roles.includes(valor)) && (
                        <button
                            onClick={() => onJenadep?.(selected)}
                            className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all"
                        >
                            <span>🏛️</span> JENADEP
                        </button>
                    )}

                    {rolesPermitidosAuditoria.some(valor => user.roles.includes(valor)) && (
                        <>
                            <button
                                onClick={() => onObservar?.(selected)}
                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all"
                            >
                                <span>⚠️</span> Observar
                            </button>
                            <button
                                onClick={() => onAprobar?.(selected)}
                                className="bg-green-600 text-white hover:bg-green-700 px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                <span>✅</span> Aprobar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
