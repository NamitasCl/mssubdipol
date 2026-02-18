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
    const [availableRoles, setAvailableRoles] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState(new Set());
    const [savingRoles, setSavingRoles] = useState(false);
    const [roleMessage, setRoleMessage] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);

    // Fetch roles on mount
    React.useEffect(() => {
        fetch(`${import.meta.env.VITE_ROLES_API_URL}/listar`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => res.json())
            .then(data => setAvailableRoles(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error fetching roles:", err));
    }, [user.token]);

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

    const handleEditRole = (func) => {
        setEditingUser(func);
        setRoleMessage(null);
        // Should ideally fetch current roles for this user, but for now we start empty or assume default?
        // Actually, we should PROBABLY fetch the specific user roles if possible, or maybe the search result includes them?
        // The search result does NOT include roles currently.
        // We can fetch them or just let the user set new ones overwriting old ones?
        // Better to fetch current roles.
        // Let's quickly search if we can get them.
        // For now, let's start with empty set or maybe we can fetch them on open.
        
        // Fetch user roles
        fetch(`${import.meta.env.VITE_ROLES_API_URL}/asignados`, {
             headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(data => {
            // This endpoint returns ALL users with roles, which is inefficient but existing.
            // Let's filter client side for now as per available endpoints.
            // API returns: { nombreCompleto, idFuncionario, roles: ["ROLE_..."] }
            const userWithRoles = data.find(u => u.idFuncionario === func.idFun);
            
            if(userWithRoles && userWithRoles.roles) {
                 // roles is already an array of strings ["ROLE_A", "ROLE_B"]
                 setSelectedRoles(new Set(userWithRoles.roles)); 
            } else {
                 setSelectedRoles(new Set());
            }
        })
        .catch((e) => {
            console.error("Error fetching user roles:", e);
            setSelectedRoles(new Set());
        });
    };

    const toggleRole = (roleName) => {
        const newRoles = new Set(selectedRoles);
        if (newRoles.has(roleName)) {
            newRoles.delete(roleName);
        } else {
            newRoles.add(roleName);
        }
        setSelectedRoles(newRoles);
    };

    const saveRoles = async () => {
        if (!editingUser) return;
        setSavingRoles(true);
        setRoleMessage(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_ROLES_API_URL}/modificar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    idFun: editingUser.idFun,
                    roles: Array.from(selectedRoles)
                })
            });
            if (res.ok) {
                setRoleMessage({ type: 'success', text: 'Roles actualizados correctamente' });
                setTimeout(() => {
                    setEditingUser(null);
                    handleSearch(); // Refresh list potentially
                }, 1500);
            } else {
                throw new Error("Error al guardar roles");
            }
        } catch (e) {
            setRoleMessage({ type: 'error', text: 'Error al guardar los roles' });
        } finally {
            setSavingRoles(false);
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
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
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
                                    <td className="px-4 py-4 text-right">
                                        <button 
                                            onClick={() => handleEditRole(func)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                            title="Cambiar Roles"
                                        >
                                            <BadgeCheck size={18} />
                                        </button>
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

            {/* Role Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Asignar Roles</h3>
                                <p className="text-sm text-gray-500 mt-1">{editingUser.nombreCompleto}</p>
                            </div>
                            <button 
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            {availableRoles.map(roleName => {
                                const formatRoleName = (role) => {
                                    const mapping = {
                                        "ROLE_JEFE": "Jefe de Unidad",
                                        "ROLE_SUBJEFE": "Subjefe de Unidad",
                                        "ROLE_FUNCIONARIO": "Funcionario",
                                        "ROLE_ADMINISTRADOR": "Administrador del Sistema",
                                        "ROLE_TURNOS": "Encargado de Turnos",
                                        "ROLE_TURNOS_RONDA": "Supervisor de Ronda",
                                        "ROLE_REVISOR": "Revisor",
                                        "ROLE_JENADEP": "JENADEP",
                                        "ROLE_DIRECTOR": "Director",
                                        "ROLE_PM_SUB": "PM Subrogante",
                                        "ROLE_PM_REG": "PM Regional"
                                    };
                                    return mapping[role] || role.replace("ROLE_", "").replace(/_/g, " ");
                                };

                                return (
                                <label key={roleName} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={selectedRoles.has(roleName)}
                                        onChange={() => toggleRole(roleName)}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="font-medium text-gray-700">{formatRoleName(roleName)}</span>
                                </label>
                                );
                            })}
                        </div>

                        {roleMessage && (
                            <div className={clsx(
                                "mb-4 p-3 rounded-lg text-sm font-medium",
                                roleMessage.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            )}>
                                {roleMessage.text}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={saveRoles}
                                disabled={savingRoles}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {savingRoles && <Loader2 size={16} className="animate-spin" />}
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
