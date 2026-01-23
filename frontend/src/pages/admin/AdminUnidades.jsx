import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/contexts/AuthContext";
import {
    Search,
    RefreshCw,
    Loader2,
    Building2,
    AlertCircle,
    CheckCircle2,
    MapPin,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import clsx from "clsx";

export default function AdminUnidades() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [unidades, setUnidades] = useState([]);
    const [allUnidades, setAllUnidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [syncResult, setSyncResult] = useState(null);
    const [expandedRegions, setExpandedRegions] = useState({});

    // Load all unidades on mount
    useEffect(() => {
        const fetchUnidades = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                const data = await res.json();
                setAllUnidades(Array.isArray(data) ? data : []);
            } catch {
                setError("Error al cargar unidades");
            } finally {
                setLoading(false);
            }
        };
        fetchUnidades();
    }, [user.token]);

    const loadAllUnidades = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const data = await res.json();
            setAllUnidades(Array.isArray(data) ? data : []);
        } catch {
            setError("Error al cargar unidades");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setUnidades([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar?nombre=${encodeURIComponent(searchTerm)}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const data = await res.json();
            setUnidades(Array.isArray(data) ? data : []);
        } catch {
            setError("Error al buscar unidades");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/actualizarbase`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setSyncResult(res.ok ? "success" : "error");
            if (res.ok) loadAllUnidades();
        } catch {
            setSyncResult("error");
        } finally {
            setSyncing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const toggleRegion = (region) => {
        setExpandedRegions(prev => ({
            ...prev,
            [region]: !prev[region]
        }));
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <Building2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Unidades</h1>
                        <p className="text-gray-500 text-sm">Buscar y sincronizar datos de unidades</p>
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
                    {syncResult === "success" ? "Sincronización completada" : "Error en la sincronización"}
                </div>
            )}

            {/* Search */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de unidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !searchTerm.trim()}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

            {/* Search Results */}
            {unidades.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Resultados de búsqueda</h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Unidad</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sigla</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Región</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {unidades.map((u, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Building2 size={16} className="text-emerald-500" />
                                                <span className="font-medium text-gray-800">{u.nombreUnidad}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                                                {u.siglasUnidad}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={14} />
                                                {u.nombreRegion || "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                                                {u.idUnidad}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Hierarchical View */}
            {allUnidades.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Estructura Jerárquica</h3>
                    <div className="space-y-2">
                        {allUnidades.map((region, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleRegion(region.nombreRegion)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin size={18} className="text-blue-500" />
                                        <span className="font-medium text-gray-800">{region.nombreRegion || "Sin Región"}</span>
                                        <span className="text-xs text-gray-400">
                                            ({region.hijos?.reduce((sum, j) => sum + (j.nietos?.length || 0), 0) || 0} unidades)
                                        </span>
                                    </div>
                                    {expandedRegions[region.nombreRegion] ? (
                                        <ChevronDown size={18} className="text-gray-400" />
                                    ) : (
                                        <ChevronRight size={18} className="text-gray-400" />
                                    )}
                                </button>
                                {expandedRegions[region.nombreRegion] && region.hijos && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                        {region.hijos.map((jef, jIdx) => (
                                            <div key={jIdx} className="mb-3 last:mb-0">
                                                <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                                    <Building2 size={14} />
                                                    {jef.nombreHijo || "Sin nombre"}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                                                    {jef.nietos?.map((u, uIdx) => (
                                                        <div key={uIdx} className="text-sm text-gray-500 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                                            {u.nombreUnidad}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && allUnidades.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                </div>
            )}
        </div>
    );
}
