import React, { useEffect, useState } from "react";
import { listarFuncionariosAportados, eliminarFuncionarioAportado } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { listarFuncionariosAportadosPaginado } from "../../api/diasNoDisponiblesGlobalesApi.js";
import { X, Trash2, UserX, AlertCircle, ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function ListaFuncionariosAportados({ show, onHide, calendarioId, idUnidad }) {
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarFuncionarios = (paginaSolicitada = 0) => {
        setLoading(true);
        listarFuncionariosAportadosPaginado(calendarioId, idUnidad, paginaSolicitada)
            .then(data => {
                setFuncionarios(data.content);
                setPagina(data.number);
                setTotalPaginas(data.totalPages);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar funcionarios");
                setLoading(false);
            });
    };

    useEffect(() => {
        if (show) cargarFuncionarios();
    }, [show]);

    const handleEliminar = (id) => {
        if (!window.confirm("¿Seguro que deseas quitar este funcionario del aporte?")) return;
        setLoading(true);
        eliminarFuncionarioAportado(id, user.idFuncionario)
            .then(() => {
                // Optimistically remove the item from the local list
                const updatedList = funcionarios.filter(f => f.id !== id);
                setFuncionarios(updatedList);
                
                // If we deleted the last item on the current page and it's not the first page,
                // go back one page. Otherwise, reload the current page to get fresh data.
                if (updatedList.length === 0 && pagina > 0) {
                    cargarFuncionarios(pagina - 1);
                } else {
                    cargarFuncionarios(pagina);
                }
            })
            .catch(() => {
                setError("No se pudo eliminar");
                setLoading(false);
            });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-pdi-base">
                            <Users size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Funcionarios Aportados</h3>
                    </div>
                    <button onClick={onHide} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-0 overflow-y-auto custom-scrollbar flex-1 relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
                            <div className="h-8 w-8 border-4 border-pdi-base border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {error && (
                        <div className="m-6 mb-0 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800">
                             <AlertCircle className="shrink-0 mt-0.5" size={18} />
                             <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {!loading && funcionarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <UserX size={32} className="text-gray-300" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Sin funcionarios</h4>
                            <p className="text-gray-500 text-sm">No se han aportado funcionarios todavía.</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3">Nombre Funcionario</th>
                                            <th className="px-4 py-3 text-right w-24">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {funcionarios.map(f => (
                                            <tr key={f.id} className="bg-white hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {f.nombreCompleto}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleEliminar(f.id)}
                                                        className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all custom-tooltip"
                                                        title="Quitar del aporte"
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

                {/* Footer / Pagination */}
                {funcionarios.length > 0 && (
                     <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">
                            Página {pagina + 1} de {totalPaginas}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => cargarFuncionarios(pagina - 1)}
                                disabled={pagina === 0}
                                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => cargarFuncionarios(pagina + 1)}
                                disabled={pagina + 1 >= totalPaginas}
                                className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}