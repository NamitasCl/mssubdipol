import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    AlertCircle,
    Trash2,
    Edit3,
    Eye,
    Search,
    FileText,
    Calendar,
    User
} from "lucide-react";
import clsx from "clsx";

export default function AdminFormulariosPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formularios, setFormularios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
            headers: { Authorization: `Bearer ${user.token}` },
        })
            .then(res => res.json())
            .then(data => setFormularios(Array.isArray(data) ? data : []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [user]);

    const handleDelete = async (formId, formName) => {
        if (!window.confirm(`¿Eliminar "${formName}"?`)) return;

        setDeleting(formId);
        try {
            const res = await fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (res.ok) {
                setFormularios(prev => prev.filter(f => f.id !== formId));
            } else {
                alert("Error al eliminar.");
            }
        } catch {
            alert("Error de conexión.");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = formularios.filter(f =>
        f.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        f.descripcion?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <FileText size={24} className="text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Formularios</h1>
                        <p className="text-gray-500 text-sm">Administrar todos los formularios del sistema</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar formularios..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2 text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Creador</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Fecha Límite</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">
                                    No se encontraron formularios
                                </td>
                            </tr>
                        ) : (
                            filtered.map(form => (
                                <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-gray-800">{form.nombre}</div>
                                        <div className="text-xs text-gray-400 line-clamp-1">{form.descripcion || "-"}</div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User size={14} />
                                            ID: {form.idCreador || "-"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        {form.fechaLimite ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                {new Date(form.fechaLimite).toLocaleDateString("es-CL")}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={clsx(
                                            "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                                            form.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {form.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/formularios/verregistros`, { state: { formularioId: form.id, esCuotaPadre: true } })}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver registros"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/formularios/crear-formulario`, { state: { editFormId: form.id } })}
                                                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(form.id, form.nombre)}
                                                disabled={deleting === form.id}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                {deleting === form.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                {filtered.length} de {formularios.length} formularios
            </div>
        </div>
    );
}
