import React, { useState } from "react";
import { useAuth } from "../../components/contexts/AuthContext";
import {
    Search,
    RefreshCw,
    Loader2,
    Users,
    AlertCircle,
    CheckCircle2,
    User,
    Building2,
    BadgeCheck
} from "lucide-react";
import clsx from "clsx";

export default function AdminFuncionarios() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [syncResult, setSyncResult] = useState(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/search?term=${encodeURIComponent(searchTerm)}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const data = await res.json();
            setFuncionarios(Array.isArray(data) ? data : []);
        } catch {
            setError("Error al buscar funcionarios");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/test-cron`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const ok = await res.json();
            setSyncResult(ok ? "success" : "error");
        } catch {
            setSyncResult("error");
        } finally {
            setSyncing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Users size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Funcionarios</h1>
                        <p className="text-gray-500 text-sm">Buscar y sincronizar datos de funcionarios</p>
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={clsx(
                        "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                        syncing
                            ? "bg-gray-100 text-gray-400"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    )}
                >
                    <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                    {syncing ? "Sincronizando..." : "Sincronizar Base"}
                </button>
            </div>

            {/* Sync Result */}
            {syncResult && (
                <div className={clsx(
                    "mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium",
                    syncResult === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                    {syncResult === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {syncResult === "success" ? "Sincronización completada correctamente" : "Error en la sincronización"}
                </div>
            )}

            {/* Search */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o RUT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !searchTerm.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    Buscar
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2 text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Results */}
            {funcionarios.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Funcionario</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Grado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Unidad</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Región</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {funcionarios.map((func, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{func.nombreCompleto}</div>
                                                <div className="text-xs text-gray-400">{func.siglasUnidad}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{func.grado || func.siglasCargo || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{func.nombreUnidad || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        <span className="text-sm text-gray-500">{func.region || "-"}</span>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                                            {func.idFun}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty state */}
            {funcionarios.length === 0 && !loading && searchTerm && (
                <div className="text-center py-12 text-gray-400">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No se encontraron funcionarios</p>
                </div>
            )}

            {/* Initial state */}
            {funcionarios.length === 0 && !searchTerm && (
                <div className="text-center py-12 text-gray-400">
                    <Search size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Ingresa un término de búsqueda para comenzar</p>
                </div>
            )}

            {/* Stats */}
            {funcionarios.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                    {funcionarios.length} resultados encontrados
                </div>
            )}
        </div>
    );
}
