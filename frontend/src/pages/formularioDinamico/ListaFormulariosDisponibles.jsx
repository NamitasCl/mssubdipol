import React, { useEffect, useState } from "react";
import {
    FolderOpen,
    Globe,
    ListChecks,
    Share2,
    UserCircle,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useAuth } from "../../components/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DelegarCuotaFormulario from "./DelegarCuotaFormulario";

/* ==================================================================== */
/*                           COMPONENTE                                 */
/* ==================================================================== */

export default function ListaFormulariosDisponibles() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formularios, setFormularios] = useState([]);
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ---------- modal delegar ---------- */
    const [showDelegar, setShowDelegar] = useState(false);
    const [cuotaADistribuir, setCuotaADistribuir] = useState(null);

    /* ===================== FETCH DATOS ===================== */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const [formsRes, cuotasRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).then((r) => r.json()),
                    fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/mis`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).then((r) => r.json()),
                ]);

                setFormularios(formsRes);
                setCuotas(cuotasRes);
            } catch (e) {
                setError(e.message || "Error de red");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, showDelegar]);

    /* ====================== HELPERS/DERIVADOS ====================== */

    const formulariosActivos = formularios.filter(f => f.activo);

    /** Buscar metadata del formulario por ID */
    const buscarFormularioPorId = (id) =>
        formularios.find((f) => String(f.id) === String(id)) || {};

    /** IDs con cuota asignada (para no duplicar) */
    const idsConCuota = new Set(cuotas.map((c) => String(c.formularioId)));

    /* ---------- 1) Formularios públicos ---------- */
    const formulariosPublicos = formulariosActivos.filter(f =>
        f.visibilidad?.some(v => v.tipoDestino === "publica")
    );

    const formulariosPublicosSinCuota = formulariosPublicos.filter(
        f => !idsConCuota.has(String(f.id))
    );

    /* ---------- 2) Formularios privados ---------- */
    const formulariosPrivados = formulariosActivos.filter(f =>
        f.visibilidad?.some(
            v =>
                (v.tipoDestino === "usuario" &&
                    String(v.valorDestino) === String(user.idFuncionario)) ||
                (v.tipoDestino === "unidad" &&
                    (
                        (v.valorDestinoSiglas &&
                            String(v.valorDestinoSiglas) === String(user.siglasUnidad)) ||
                        (v.valorDestino &&
                            user.idUnidad &&
                            String(v.valorDestino) === String(user.idUnidad))
                    )
                )
        )
    );


    /* ---------- 3) Evitar duplicados (público y/o con cuota) ---------- */
    const idsFormulariosMostrados = new Set([
        ...idsConCuota,
        ...formulariosPublicos.map((f) => String(f.id)),
    ]);
    const soloPrivados = formulariosPrivados.filter(
        (f) => !idsFormulariosMostrados.has(String(f.id))
    );

    /* ---------- util ---------- */
    const esCreador = (f) =>
        String(f.idCreador) === String(user.idFuncionario);

    const handleAbrirDelegar = (cuota) => {
        setCuotaADistribuir(cuota);
        setShowDelegar(true);
    };
    const handleCerrarDelegar = () => {
        setShowDelegar(false);
        setCuotaADistribuir(null);
    };


    /* =============================== RENDER =============================== */
    return (
        <div className="p-2 space-y-8">
            
            {/* Header Section */}
            <div>
                 <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <ListChecks size={24} />
                    </div>
                    <span>Tareas y Cuotas Asignadas</span>
                </h2>
                <p className="text-gray-500 mt-1 ml-12">Gestione las asignaciones de formularios para su unidad y personal.</p>
            </div>


            {/* ------------------ loading / error ------------------ */}
            {loading && (
                <div className="flex justify-center my-12">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3">
                    <AlertCircle className="text-red-500" />
                    <span className="text-red-700 font-medium">{error}</span>
                </div>
            )}

            {/* ================================================================= */}
            {/*                     SECCIÓN CUOTAS / TAREAS                       */}
            {/* ================================================================= */}
            
            {!loading && cuotas.length === 0 && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
                    <p className="text-blue-700 font-medium">No tienes tareas asignadas por el momento.</p>
                </div>
            )}

            {!loading && cuotas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cuotas.map((cuota) => {
                        const form = buscarFormularioPorId(cuota.formularioId);
                        const nombre = cuota.formularioNombre || form.nombre || "Formulario";
                        const descripcion = form.descripcion || "";
                        const avance = cuota.avance ?? 0;
                        const total = cuota.cuotaAsignada ?? 1;
                        const completada = avance >= total;
                        const esCuotaPadre = !cuota.cuotaPadreId;
                        const idUnidad = cuota.idUnidad ?? null;
                        const idFuncionario = cuota.idFuncionario ?? null;

                        return (
                            <div 
                                key={cuota.id} 
                                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 overflow-hidden flex flex-col ${completada ? 'border-emerald-500' : 'border-blue-500'}`}
                            >
                                <div className={`p-5 flex-grow ${completada ? 'bg-emerald-50/30' : 'bg-blue-50/10'}`}>
                                    
                                    {/* Header Card */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                                            <FolderOpen size={20} className={completada ? 'text-emerald-500' : 'text-blue-500'} />
                                            <span className="line-clamp-1">{nombre}</span>
                                        </div>
                                        {esCreador(form) && (
                                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                                Creador
                                            </span>
                                        )}
                                    </div>

                                    {descripcion && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{descripcion}</p>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 mb-4">
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-gray-500">Progreso</span>
                                            <span className={completada ? 'text-emerald-600' : 'text-blue-600'}>{avance} / {total}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className={`h-2.5 rounded-full transition-all duration-500 ${completada ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${Math.min((avance / total) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        {completada && (
                                            <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                <CheckCircle2 size={12} /> ¡Completado!
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Footer Info */}
                                    <div>
                                         <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                                            Unidad: {user.siglasUnidad}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                                    {!completada && (
                                        <button
                                            onClick={() => navigate(`/formularios/formulario/${cuota.formularioId}`, { state: { cuotaId: cuota.id, idUnidad, idFuncionario } })}
                                            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 shadow-sm transition-colors"
                                        >
                                            Completar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/formularios/verregistros`, { state: { formularioId: cuota.formularioId, cuotaId: cuota.id, esCuotaPadre, idUnidad, idFuncionario } })}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors"
                                    >
                                        Registros
                                    </button>

                                    <button
                                        onClick={() => handleAbrirDelegar(cuota)}
                                        className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 shadow-sm transition-colors flex items-center gap-1"
                                        title="Distribuir/delegar cuota"
                                    >
                                        <Share2 size={14} /> Distribuir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* ================================================================= */}
            {/*                    SECCIÓN FORMULARIOS PRIVADOS                   */}
            {/* ================================================================= */}
            {soloPrivados.length > 0 && (
                <div className="mt-12">
                     <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                        <UserCircle size={20} className="text-purple-500" /> 
                        Asignados Directamente
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {soloPrivados.map((f) => (
                            <div 
                                key={f.id} 
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-grow bg-purple-50/10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                                            <FolderOpen size={20} className="text-purple-500" />
                                            <span className="line-clamp-1">{f.nombre}</span>
                                        </div>
                                        {esCreador(f) && (
                                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                                Creador
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{f.descripcion}</p>
                                </div>

                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-2 justify-end">
                                    <button
                                        onClick={() => navigate(`/formularios/formulario/${f.id}`)}
                                        className="px-3 py-1.5 bg-white border border-purple-200 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 shadow-sm transition-colors"
                                    >
                                        Completar
                                    </button>

                                    <button
                                        onClick={() => navigate(`/formularios/verregistros`, { state: { formularioId: f.id, esCuotaPadre: true } })}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors"
                                    >
                                        Registros
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/*                     SECCIÓN FORMULARIOS PÚBLICOS                  */}
            {/* ================================================================= */}
            {formulariosPublicosSinCuota.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                        <Globe size={20} className="text-emerald-500" /> 
                        Formularios Públicos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {formulariosPublicosSinCuota.map((f) => (
                             <div 
                                key={f.id} 
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-emerald-500 overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-grow bg-emerald-50/10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                                            <FolderOpen size={20} className="text-emerald-500" />
                                            <span className="line-clamp-1">{f.nombre}</span>
                                        </div>
                                        {esCreador(f) && (
                                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                                Creador
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{f.descripcion}</p>
                                    
                                     <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                                        Público
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-2 justify-end">
                                    <button
                                        onClick={() => navigate(`/formularios/formulario/${f.id}`)}
                                        className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-50 shadow-sm transition-colors"
                                    >
                                        Completar
                                    </button>

                                    <button
                                        onClick={() => navigate(`/formularios/verregistros`, { state: { formularioId: f.id, esCuotaPadre: true } })}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors"
                                    >
                                        Registros
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ---------------- MODAL DELEGAR ---------------- */}
            {/* Note: DelegarCuotaFormulario still needs refactor to remove Bootstrap if heavily contained there */}
            <DelegarCuotaFormulario
                show={!!cuotaADistribuir}
                cuota={cuotaADistribuir}
                formulario={buscarFormularioPorId(cuotaADistribuir?.formularioId)}
                onClose={handleCerrarDelegar}
                onDelegado={handleCerrarDelegar}
            />
        </div>
    );
}