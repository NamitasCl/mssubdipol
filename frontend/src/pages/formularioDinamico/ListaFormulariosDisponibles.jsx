import React, { useEffect, useState } from "react";
import {
    FolderOpen,
    Globe,
    ListChecks,
    Share2,
    UserCircle,
    CheckCircle2,
    AlertCircle,
    Loader2,
    PlusCircle,
    Edit3,
    Trash2,
    Eye,
    Users,
    Building2,
    ChevronRight,
    BarChart3
} from "lucide-react";
import { useAuth } from "../../components/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DelegarCuotaFormulario from "./DelegarCuotaFormulario";
import clsx from "clsx";

export default function ListaFormulariosDisponibles() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formularios, setFormularios] = useState([]);
    const [misFormularios, setMisFormularios] = useState([]);
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delegation modal state
    const [showDelegar, setShowDelegar] = useState(false);
    const [cuotaADistribuir, setCuotaADistribuir] = useState(null);
    const [deleting, setDeleting] = useState(null); // Track which form is being deleted

    // Fetch data
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const [formsRes, misFormsRes, cuotasRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).then(r => r.json()),
                    fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/creador/${user.idFuncionario}`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).then(r => r.json()),
                    fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/mis`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).then(r => r.json()),
                ]);

                setFormularios(formsRes);
                setMisFormularios(Array.isArray(misFormsRes) ? misFormsRes : []);
                setCuotas(cuotasRes);
            } catch (e) {
                setError(e.message || "Error de red");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, showDelegar]);

    // Helpers
    const buscarFormularioPorId = (id) =>
        formularios.find((f) => String(f.id) === String(id)) || {};

    const idsConCuota = new Set(cuotas.map((c) => String(c.formularioId)));
    const idsMisFormularios = new Set(misFormularios.map((f) => String(f.id)));

    // Public forms (not created by me, no quota)
    const formulariosPublicos = formularios.filter(f =>
        f.activo &&
        !idsMisFormularios.has(String(f.id)) &&
        !idsConCuota.has(String(f.id)) &&
        f.visibilidad?.some(v => v.tipoDestino === "publica")
    );

    // Private forms assigned to me/my unit (not created by me, no quota)
    const formulariosPrivados = formularios.filter(f =>
        f.activo &&
        !idsMisFormularios.has(String(f.id)) &&
        !idsConCuota.has(String(f.id)) &&
        f.visibilidad?.some(v =>
            (v.tipoDestino === "usuario" && String(v.valorDestino) === String(user.idFuncionario)) ||
            (v.tipoDestino === "unidad" && (
                (v.valorDestinoSiglas && String(v.valorDestinoSiglas) === String(user.siglasUnidad)) ||
                (v.valorDestino && user.idUnidad && String(v.valorDestino) === String(user.idUnidad))
            ))
        )
    );

    const handleAbrirDelegar = (cuota) => {
        setCuotaADistribuir(cuota);
        setShowDelegar(true);
    };

    const handleCerrarDelegar = () => {
        setShowDelegar(false);
        setCuotaADistribuir(null);
    };

    // Delete form handler
    const handleDeleteForm = async (formId, formName) => {
        if (!window.confirm(`¿Estás seguro de eliminar el formulario "${formName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        setDeleting(formId);
        try {
            const res = await fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (res.ok) {
                setMisFormularios(prev => prev.filter(f => f.id !== formId));
                setFormularios(prev => prev.filter(f => f.id !== formId));
            } else if (res.status === 403) {
                alert("No tienes permisos para eliminar este formulario.");
            } else {
                alert("Error al eliminar el formulario.");
            }
        } catch {
            alert("Error de conexión al eliminar.");
        } finally {
            setDeleting(null);
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3">
                <AlertCircle className="text-red-500" />
                <span className="text-red-700 font-medium">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* ================================================================= */}
            {/*                    SECTION 1: MIS FORMULARIOS                     */}
            {/* ================================================================= */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <FolderOpen size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Mis Formularios</h2>
                            <p className="text-sm text-gray-500">Formularios que has creado</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/formularios/crear-formulario")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Nuevo Formulario
                    </button>
                </div>

                {misFormularios.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                        <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No has creado ningún formulario aún.</p>
                        <button
                            onClick={() => navigate("/formularios/crear-formulario")}
                            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                        >
                            Crear mi primer formulario
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {misFormularios.map((form) => {
                            const totalCuotas = cuotas
                                .filter(c => String(c.formularioId) === String(form.id))
                                .reduce((sum, c) => sum + (c.cuotaAsignada || 0), 0);

                            return (
                                <div
                                    key={form.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{form.nombre}</h3>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                                form.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                            )}>
                                                {form.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{form.descripcion || "Sin descripción"}</p>

                                        {/* Visibility badges */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {form.visibilidad?.map((v, i) => (
                                                <span key={i} className={clsx(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                    v.tipoDestino === "publica" ? "bg-emerald-50 text-emerald-700" :
                                                        v.tipoDestino === "unidad" ? "bg-blue-50 text-blue-700" :
                                                            "bg-purple-50 text-purple-700"
                                                )}>
                                                    {v.tipoDestino === "publica" ? <Globe size={12} /> :
                                                        v.tipoDestino === "unidad" ? <Building2 size={12} /> :
                                                            <UserCircle size={12} />}
                                                    {v.valorDestinoNombre || v.tipoDestino}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <BarChart3 size={14} />
                                                {totalCuotas} cuotas asignadas
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-2">
                                        <button
                                            onClick={() => navigate(`/formularios/verregistros`, { state: { formularioId: form.id, esCuotaPadre: true } })}
                                            className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Eye size={16} />
                                            Ver Registros
                                        </button>
                                        <button
                                            onClick={() => navigate(`/formularios/crear-formulario`, { state: { editFormId: form.id } })}
                                            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteForm(form.id, form.nombre)}
                                            disabled={deleting === form.id}
                                            className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            {deleting === form.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ================================================================= */}
            {/*                   SECTION 2: TAREAS ASIGNADAS                    */}
            {/* ================================================================= */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <ListChecks size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Tareas Asignadas</h2>
                        <p className="text-sm text-gray-500">Cuotas de registros que debes completar o distribuir</p>
                    </div>
                </div>

                {cuotas.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                        <ListChecks size={40} className="text-blue-300 mx-auto mb-3" />
                        <p className="text-blue-700">No tienes tareas asignadas por el momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {cuotas.map((cuota) => {
                            const form = buscarFormularioPorId(cuota.formularioId);
                            const nombre = cuota.formularioNombre || form.nombre || "Formulario";
                            const descripcion = form.descripcion || "";
                            const avance = cuota.avance ?? 0;
                            const total = cuota.cuotaAsignada ?? 1;
                            const completada = avance >= total;
                            const progreso = Math.min((avance / total) * 100, 100);
                            const esCuotaPadre = !cuota.cuotaPadreId;

                            return (
                                <div
                                    key={cuota.id}
                                    className={clsx(
                                        "bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all overflow-hidden",
                                        completada ? "border-emerald-500" : "border-blue-500"
                                    )}
                                >
                                    <div className={clsx("p-5", completada ? "bg-emerald-50/30" : "")}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-gray-800 line-clamp-1">{nombre}</h3>
                                            {completada && (
                                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                                    <CheckCircle2 size={14} />
                                                    Completado
                                                </span>
                                            )}
                                        </div>

                                        {descripcion && (
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{descripcion}</p>
                                        )}

                                        {/* Progress bar */}
                                        <div className="bg-gray-100 rounded-lg p-3 mb-4">
                                            <div className="flex justify-between text-xs font-medium mb-1.5">
                                                <span className="text-gray-500">Progreso</span>
                                                <span className={completada ? "text-emerald-600" : "text-blue-600"}>
                                                    {avance} / {total}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={clsx(
                                                        "h-2 rounded-full transition-all duration-500",
                                                        completada ? "bg-emerald-500" : "bg-blue-500"
                                                    )}
                                                    style={{ width: `${progreso}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Assignment info */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Building2 size={14} />
                                            <span>Asignado a: {cuota.nombreUnidad || cuota.nombreFuncionario || user.siglasUnidad}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
                                        {!completada && (
                                            <button
                                                onClick={() => navigate(`/formularios/formulario/${cuota.formularioId}`, {
                                                    state: { cuotaId: cuota.id, idUnidad: cuota.idUnidad, idFuncionario: cuota.idFuncionario }
                                                })}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                Completar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/formularios/verregistros`, {
                                                state: { formularioId: cuota.formularioId, cuotaId: cuota.id, esCuotaPadre, idUnidad: cuota.idUnidad, idFuncionario: cuota.idFuncionario }
                                            })}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Registros
                                        </button>
                                        <button
                                            onClick={() => handleAbrirDelegar(cuota)}
                                            className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                        >
                                            <Share2 size={14} />
                                            Distribuir
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ================================================================= */}
            {/*                 SECTION 3: FORMULARIOS DISPONIBLES               */}
            {/* ================================================================= */}
            {(formulariosPublicos.length > 0 || formulariosPrivados.length > 0) && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Globe size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Formularios Disponibles</h2>
                            <p className="text-sm text-gray-500">Formularios públicos o asignados a tu unidad</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[...formulariosPublicos, ...formulariosPrivados].map((f) => (
                            <div
                                key={f.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{f.nombre}</h3>
                                        {f.visibilidad?.some(v => v.tipoDestino === "publica") && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                                <Globe size={12} />
                                                Público
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{f.descripcion || "Sin descripción"}</p>
                                </div>
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/formularios/formulario/${f.id}`)}
                                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <ChevronRight size={16} />
                                        Completar
                                    </button>
                                    <button
                                        onClick={() => navigate(`/formularios/verregistros`, { state: { formularioId: f.id, esCuotaPadre: true } })}
                                        className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Delegation Modal */}
            {showDelegar && cuotaADistribuir && (
                <DelegarCuotaFormulario
                    show={true}
                    cuota={cuotaADistribuir}
                    formulario={buscarFormularioPorId(cuotaADistribuir?.formularioId)}
                    onClose={handleCerrarDelegar}
                    onDelegado={handleCerrarDelegar}
                />
            )}
        </div>
    );
}