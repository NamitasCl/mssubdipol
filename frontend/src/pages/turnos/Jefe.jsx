import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { Shield, UserMinus, UserCheck, AlertCircle, CheckCircle } from "lucide-react";

export function Jefe() {
    const { user } = useAuth();
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [subjefeActual, setSubjefeActual] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [messageType, setMessageType] = useState("info"); // info, success, error

    const fetchSubjefeActual = async () => {
        if (!user?.siglasUnidad) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_ROLES_API_URL}/subjefe/${user.siglasUnidad}`);
            setSubjefeActual({
                label: `${res.data.nombre} ${res.data.apellidoPaterno} ${res.data.apellidoMaterno}`,
                value: res.data.idFun,
            });
        } catch {
            setSubjefeActual(null);
        }
    };

    useEffect(() => {
        fetchSubjefeActual();
    }, [user]);

    const loadFuncionarios = async (inputValue, callback) => {
        if (!user?.siglasUnidad) return callback([]);

        try {
            const res = await axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/porunidad`, {
                params: {
                    unidad: user.siglasUnidad,
                    term: inputValue
                }
            });

            const opciones = res.data.map(funcionario => ({
                label: `${funcionario.nombreFun} ${funcionario.apellidoPaternoFun} ${funcionario.apellidoMaternoFun}`,
                value: funcionario.idFun,
                username: funcionario.username
            }));

            callback(opciones);
        } catch (err) {
            console.error("Error al buscar funcionarios:", err);
            callback([]);
        }
    };

    const handleGuardar = async () => {
        if (!selectedFuncionario) {
            setMensaje("Debes seleccionar un funcionario para asignarlo como Subjefe.");
            setMessageType("error");
            return;
        }

        try {
            setCargando(true);
            await axios.post(
                `${import.meta.env.VITE_AUTH_API_URL}/modificar`,
                {
                    idFun: selectedFuncionario.value,
                    roles: ["ROLE_SUBJEFE"]
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            setMensaje("Subjefe asignado correctamente.");
            setMessageType("success");
            fetchSubjefeActual();
            setSelectedFuncionario(null);
        } catch (err) {
            console.error(err);
            setMensaje("Error al asignar el rol.");
            setMessageType("error");
        } finally {
            setCargando(false);
        }
    };

    const handleQuitar = async () => {
        if (!subjefeActual) {
            setMensaje("No hay subjefe asignado.");
            setMessageType("info");
            return;
        }

        try {
            setCargando(true);
            await axios.post(`${import.meta.env.VITE_AUTH_API_URL}/modificar`,
                {
                    idFun: subjefeActual.value,
                    roles: ["ROLE_FUNCIONARIO"]
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            setMensaje("Subjefe eliminado correctamente.");
            setMessageType("success");
            fetchSubjefeActual();
            setSelectedFuncionario(null);
        } catch (err) {
            console.error(err);
            setMensaje("Error al quitar el rol.");
            setMessageType("error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
             <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold text-pdi-base mb-2">Administración de Unidad</h2>
                <p className="text-gray-500">Gestina las autoridades y roles de tu unidad operativa ({user?.siglasUnidad}).</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-pdi-base shadow-sm">
                                <Shield size={32} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Subjefe de Unidad</h3>
                                <p className="text-sm text-gray-500 max-w-md">
                                    El subjefe tiene permisos para gestionar turnos y aprobaciones en ausencia del jefe.
                                </p>
                            </div>
                        </div>

                         <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${subjefeActual ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-amber-50 border-amber-100 text-amber-800"}`}>
                            {subjefeActual ? (
                                <>
                                    <CheckCircle size={20} className="shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Asignado a</p>
                                        <p className="font-semibold">{subjefeActual.label}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={20} className="shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Estado</p>
                                        <p className="font-semibold">Sin asignar</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                     <div className="grid md:grid-cols-3 gap-8">
                        {/* Area de Asignación */}
                        <div className="md:col-span-2 space-y-6">
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevo Subjefe</label>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadFuncionarios}
                                    onChange={setSelectedFuncionario}
                                    value={selectedFuncionario}
                                    isClearable
                                    placeholder="Buscar por nombre..."
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            padding: '4px',
                                            borderRadius: '0.75rem',
                                            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                                            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                                            '&:hover': {
                                                borderColor: '#d1d5db'
                                            }
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: '0.75rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            zIndex: 50
                                        })
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                    Busca y selecciona un funcionario de la lista para otorgarle permisos.
                                </p>
                            </div>
                        </div>

                         {/* Acciones */}
                        <div className="md:col-span-1 flex flex-col justify-end gap-3">
                            <button
                                onClick={handleGuardar}
                                disabled={cargando || !selectedFuncionario}
                                className="w-full flex items-center justify-center gap-2 bg-pdi-base hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                            >
                                {cargando ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                ) : (
                                    <>
                                        <UserCheck size={18} />
                                        Asignar Cargo
                                    </>
                                )}
                            </button>

                             <button
                                onClick={handleQuitar}
                                disabled={cargando || !subjefeActual}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-rose-600 px-4 py-3 rounded-xl font-medium transition-all active:scale-95"
                            >
                                <UserMinus size={18} />
                                Revocar Cargo
                            </button>
                        </div>
                    </div>

                    {/* Mensajes Feedback */}
                    {mensaje && (
                        <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                            messageType === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 
                            messageType === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                            'bg-blue-50 text-blue-800 border border-blue-100'
                        }`}>
                            {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{mensaje}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}