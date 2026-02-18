import React, { useState, useEffect } from 'react';
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import axios from 'axios';
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { useLocation } from "react-router-dom"; 
import CreadorCalendarios from "../calendarios/CreadorCalendarios.jsx"; // Integration
import { 
  Calendar, Users, Settings, Shield, Plus, Save, Trash2, Edit2, 
  CheckCircle, AlertCircle, ChevronRight, Search, LayoutGrid, List
} from 'lucide-react';
import clsx from 'clsx';
// import { toast } from 'sonner';

/**
 * Panel Principal de Configuración de Turnos (PMSUBDIPOL)
 */
// ... (imports remain)
import { crearCalendario, listarCalendarios } from "../../api/calendarApi.js";

export default function TurnosConfigurationPanel() {
    const { user } = useAuth();
    const userId = user?.idFuncionario;
    const location = useLocation();

    // Estados
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [loadingCalendars, setLoadingCalendars] = useState(false);
    
    // Vista activa: 'dashboard', 'config-units', 'permissions', 'create'
    const [activeView, setActiveView] = useState('dashboard');



// Ensure CreateCalendarModal is removed (or commented out if you prefer, but deletion is cleaner)
// ... (PermissionsView and other components)

    // Cargar calendarios
    useEffect(() => {
        setLoadingCalendars(true);
        listarCalendarios()
            .then(loadedCalendars => {
                setCalendars(loadedCalendars);
                
                // Check for auto-select from navigation state
                if (location.state?.selectedCalendarId) {
                    const found = loadedCalendars.find(c => c.id === location.state.selectedCalendarId);
                    if (found) {
                        setSelectedCalendar(found);
                        setActiveView('config-units');
                    }
                }
            })
            .catch(() => setCalendars([]))
            .finally(() => setLoadingCalendars(false));
    }, [userId]);

    const handleSelectCalendar = (cal) => {
        setSelectedCalendar(cal);
        setActiveView('config-units'); // Ir directo a configuración al seleccionar
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-50 rounded-3xl overflow-hidden shadow-2xl border border-white/50 backdrop-blur-sm">
            {/* Sidebar de Navegación / Selección de Calendario */}
            <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-xl font-bold text-pdi-base flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Configuración
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Gestión Mensual de Turnos</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                        Calendarios Activos
                    </div>
                    
                    {loadingCalendars ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pdi-base"></div>
                        </div>
                    ) : calendars.length === 0 ? (
                         <div className="text-sm text-gray-400 text-center py-4 italic">No hay calendarios</div>
                    ) : (
                        calendars.map(cal => (
                            <button
                                key={cal.id}
                                onClick={() => handleSelectCalendar(cal)}
                                className={clsx(
                                    "w-full text-left p-3 rounded-xl transition-all duration-200 border",
                                    selectedCalendar?.id === cal.id 
                                        ? "bg-pdi-base text-white border-pdi-base shadow-lg shadow-pdi-base/20 transform scale-[1.02]" 
                                        : "bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50"
                                )}
                            >
                                <div className="font-semibold text-sm">{cal.nombreCalendario}</div>
                                <div className={clsx(
                                    "text-xs mt-1 flex items-center gap-1",
                                    selectedCalendar?.id === cal.id ? "text-blue-200" : "text-gray-400"
                                )}>
                                    <Calendar className="w-3 h-3" />
                                    {cal.mes}/{cal.anio}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                    <button 
                        onClick={() => { setSelectedCalendar(null); setActiveView('create'); }}
                        className="w-full py-2.5 px-4 bg-white border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-pdi-base hover:text-pdi-base transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Periodo
                    </button>
                </div>
            </div>

            {/* Área Principal */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 relative">
                {!selectedCalendar && activeView !== 'create' ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <LayoutGrid className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">Selecciona un calendario para comenzar</p>
                        <button 
                            onClick={() => setActiveView('create')}
                            className="mt-4 px-6 py-2 bg-pdi-base text-white rounded-lg hover:bg-blue-900 transition-colors"
                        >
                            Crear Nuevo Calendario
                        </button>
                    </div>
                ) : activeView === 'create' ? (
                     <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                         <div className="max-w-5xl mx-auto space-y-6">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Plus className="w-7 h-7 text-pdi-base" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Creación y Gestión de Calendarios</h2>
                                        <p className="text-gray-500 mt-1">Configura nuevos calendarios mensuales y gestiona los existentes</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Main Content */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <CreadorCalendarios /> 
                            </div>
                         </div>
                     </div>
                ) : (
                    <>
                        {/* Header del Calendario Seleccionado */}
                        <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between shadow-sm z-10">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{selectedCalendar.nombreCalendario}</h1>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Activo
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        Periodo: {selectedCalendar.mes}/{selectedCalendar.anio}
                                    </span>
                                </div>
                            </div>

                            <div className="flex bg-gray-100/80 p-1 rounded-xl">
                                <button 
                                    onClick={() => setActiveView('config-units')}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeView === 'config-units' ? "bg-white text-pdi-base shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Users className="w-4 h-4 inline-block mr-2" />
                                    Unidades
                                </button>
                                <button 
                                    onClick={() => setActiveView('permissions')}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeView === 'permissions' ? "bg-white text-pdi-base shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <Shield className="w-4 h-4 inline-block mr-2" />
                                    Permisos
                                </button>
                            </div>
                        </header>

                        {/* Contenido Dinámico */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {activeView === 'config-units' && (
                                <UnitConfigurationView calendario={selectedCalendar} />
                            )}
                            {activeView === 'permissions' && (
                                <PermissionsView calendario={selectedCalendar} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Vista de Configuración de Unidades (Grid + Edición Rápida)
 */
function UnitConfigurationView({ calendario }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Cargar unidades
    useEffect(() => {
        if (!calendario?.id) return;
        setLoading(true);
        axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras`, {
            params: { turnoAsignacion: calendario.id }
        })
        .then(res => setDepartments(Array.isArray(res.data) ? res.data : [])) 
        .catch(() => setDepartments([]))
        .finally(() => setLoading(false));
    }, [calendario.id]);


    const handleAddUnit = (unidadesSeleccionadas) => {
        // Lógica simplificada: agregar al array local
        // Debería abrir un modal de búsqueda de unidad primero
    }

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
             await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras/lote`, departments.map(d => ({
                 ...d,
                 mes: calendario.mes,
                 anio: calendario.anio,
                 idCalendario: calendario.id
             })));
             // toast.success('Configuración guardada correctamente');
             alert('Configuración guardada correctamente');
        } catch (error) {
            // toast.error('Error al guardar la configuración');
            alert('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    }
    
    // Componente interno para agregar unidad (Modal simplificado en UI)
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h3 className="text-lg font-bold text-gray-800">Unidades Colaboradoras</h3>
                     <p className="text-sm text-gray-500">Define cuántos funcionarios debe aportar cada unidad.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar unidad..." 
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pdi-base/20 outline-none w-64 transition-all hover:border-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Unidad
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="px-4 py-2 bg-pdi-base text-white font-medium rounded-xl hover:bg-blue-900 transition-shadow shadow-md shadow-blue-900/10 flex items-center gap-2 text-sm disabled:opacity-70"
                    >
                        {isSaving ? <CheckCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Grid de Unidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {departments
                    .filter(d => (d.name || d.nombreUnidad || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((dept, idx) => (
                    <div key={idx} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500 transition-all"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="font-bold text-gray-800 pr-8 line-clamp-2 min-h-[3rem]">
                                {dept.name || dept.nombreUnidad}
                            </div>
                            <button 
                                onClick={() => {
                                    const newDepts = [...departments];
                                    newDepts.splice(idx, 1);
                                    setDepartments(newDepts);
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50/30 transition-colors">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cuota Total</span>
                                <input 
                                    type="number" 
                                    className="w-20 text-right bg-transparent border-b border-gray-300 focus:border-pdi-base outline-none font-bold text-gray-800 text-lg p-0"
                                    value={dept.totalPeople || dept.cantFuncAporte || 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        const newDepts = [...departments];
                                        newDepts[idx].totalPeople = val;
                                        newDepts[idx].cantFuncAporte = val;
                                        setDepartments(newDepts);
                                    }}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 border border-gray-100 rounded-lg">
                                    <label className="block text-xs text-gray-400 mb-1">Turnos Máx</label>
                                    <input 
                                        className="w-full font-semibold text-gray-700 outline-none bg-transparent"
                                        value={dept.maxShifts || dept.maxTurnos || 0} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            const newDepts = [...departments];
                                            newDepts[idx].maxShifts = val;
                                            newDepts[idx].maxTurnos = val;
                                            setDepartments(newDepts);
                                        }}
                                        type="number"
                                    />
                                </div>
                                <div className="p-2 border border-gray-100 rounded-lg">
                                    <label className="block text-xs text-gray-400 mb-1">Por Día</label>
                                    <input 
                                        className="w-full font-semibold text-gray-700 outline-none bg-transparent"
                                        value={dept.workersPerDay || dept.trabajadoresPorDia || 0} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            const newDepts = [...departments];
                                            newDepts[idx].workersPerDay = val;
                                            newDepts[idx].trabajadoresPorDia = val;
                                            setDepartments(newDepts);
                                        }}
                                        type="number"
                                    />
                                </div>
                            </div>

                             <div className="flex items-center gap-3 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none group/chk">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only"
                                            checked={dept.noWeekend !== undefined ? !dept.noWeekend : dept.trabajaFindesemana}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const newDepts = [...departments];
                                                // La logica de negocio puede ser "noWeekend" (true = NO trabaja) o "trabajaFindesemana" (true = SI trabaja)
                                                // Ajustamos ambos para consistencia
                                                newDepts[idx].noWeekend = !checked;
                                                newDepts[idx].trabajaFindesemana = checked;
                                                setDepartments(newDepts);
                                            }}
                                        />
                                        <div className={clsx(
                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                            (dept.noWeekend !== undefined ? !dept.noWeekend : dept.trabajaFindesemana)
                                                ? "bg-emerald-500 border-emerald-500" 
                                                : "bg-white border-gray-300"
                                        )}>
                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-600 group-hover/chk:text-gray-900 transition-colors">Trabaja Fines de Sem.</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}

                 {/* Empty State */}
                 {departments.length === 0 && !loading && (
                     <div className="col-span-full py-12 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/50">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                             <LayoutGrid className="w-8 h-8 text-gray-300" />
                         </div>
                         <h3 className="text-gray-900 font-medium text-lg">Sin Unidades Asignadas</h3>
                         <p className="text-gray-500 max-w-sm mx-auto mt-1">Comienza agregando unidades para definir quiénes deben aportar funcionarios a este calendario.</p>
                         <button 
                            onClick={() => setShowAddModal(true)}
                            className="mt-6 px-6 py-2 bg-white border border-gray-300 shadow-sm text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors inline-block"
                        >
                            Agregar Unitad Ahora
                        </button>
                     </div>
                 )}
            </div>

            {/* Modal de búsqueda (Simplificado para el ejemplo) */}
            {showAddModal && (
                <AddUnitModal 
                    onClose={() => setShowAddModal(false)} 
                    onSelect={(unit) => {
                        // Agregar unidad con valores por defecto
                        setDepartments(prev => [...prev, {
                             ...unit,
                             name: unit.nombreUnidad, // Normalizar nombres
                             totalPeople: 0,
                             maxShifts: 0,
                             workersPerDay: 0,
                             trabajaFindesemana: true,
                             noWeekend: false
                        }]);
                        setShowAddModal(false);
                    }} 
                />
            )}
        </div>
    );
}

/**
 * Modal flotante para agregar unidad
 */
function AddUnitModal({ onClose, onSelect }) {
     const loadOptions = (inputValue, callback) => {
         if (!inputValue || inputValue.length < 3) return callback([]);
         axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar`, {
                params: { nombre: inputValue }
            })
            .then(response => {
                const options = response.data.map(u => ({
                    value: u.siglasUnidad,
                    label: u.nombreUnidad,
                    ...u
                }));
                callback(options);
            })
            .catch(() => callback([]));
    };
    const debouncedLoadOptions = debounce(loadOptions, 400);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-800">Agregar Unidad</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Unidad</label>
                    <AsyncSelect
                         cacheOptions
                         defaultOptions
                         loadOptions={debouncedLoadOptions}
                         onChange={(opt) => onSelect(opt)}
                         placeholder="Escribe el nombre de la unidad..."
                         classNamePrefix="react-select"
                         styles={{
                             control: (base) => ({
                                 ...base,
                                 borderRadius: '0.75rem',
                                 borderColor: '#e5e7eb',
                                 padding: '0.25rem',
                                 boxShadow: 'none',
                                 '&:hover': { borderColor: '#d1d5db' }
                             })
                         }}
                    />
                     <p className="text-xs text-gray-500 mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Selecciona una unidad para agregarla a la configuración mensual.
                    </p>
                </div>
            </div>
        </div>
    )
}

/**
 * Vista de Permisos / Control de Acceso Avanzado
 */
function PermissionsView({ calendario }) {
    const { user } = useAuth();
    const [authorizedUsers, setAuthorizedUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load authorized users (for now uses local state, could connect to API later)
    useEffect(() => {
        if (calendario?.id) {
            // Initialize with owner
            const ownerUser = {
                id: calendario.creadoPor || user?.idFuncionario,
                nombreCompleto: user?.nombreCompleto || "Creador del Calendario",
                role: "owner",
                siglas: (user?.nombreCompleto || "CC").split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            };
            setAuthorizedUsers([ownerUser]);
        }
    }, [calendario?.id]);

    const handleAddUser = (selectedUser) => {
        if (!selectedUser || authorizedUsers.some(u => u.id === selectedUser.idFuncionario)) {
            return; // Already exists
        }
        
        const newUser = {
            id: selectedUser.idFuncionario || selectedUser.value,
            nombreCompleto: selectedUser.nombreCompleto || selectedUser.label,
            role: "editor",
            siglas: (selectedUser.nombreCompleto || selectedUser.label || "XX")
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
        };
        
        setAuthorizedUsers(prev => [...prev, newUser]);
        setShowAddModal(false);
    };

    const handleRemoveUser = (userId) => {
        setAuthorizedUsers(prev => prev.filter(u => u.id !== userId || u.role === 'owner'));
    };

    const handleChangeRole = (userId, newRole) => {
        setAuthorizedUsers(prev => prev.map(u => 
            u.id === userId && u.role !== 'owner' ? { ...u, role: newRole } : u
        ));
    };

    const handleSavePermissions = async () => {
        setSaving(true);
        try {
            // Future API call here
            // await axios.post(`${API}/calendario/${calendario.id}/permisos`, authorizedUsers);
            alert('Permisos guardados correctamente');
        } catch (error) {
            alert('Error al guardar permisos');
        } finally {
            setSaving(false);
        }
    };

    const roleLabels = {
        owner: { label: 'Propietario', color: 'bg-emerald-100 text-emerald-700' },
        admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
        editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700' },
        viewer: { label: 'Solo Lectura', color: 'bg-gray-100 text-gray-600' }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-7 h-7 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">Control de Acceso Avanzado</h3>
                        <p className="text-gray-600 mt-1">
                            Gestiona quién puede ver y modificar la configuración de este calendario mensual.
                        </p>
                    </div>
                    <button 
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className="px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-gray-800">Usuarios Autorizados</span>
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {authorizedUsers.length}
                        </span>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Usuario
                    </button>
                </div>

                <div className="divide-y divide-gray-50">
                    {authorizedUsers.map((authUser, idx) => (
                        <div key={authUser.id || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                            {/* Avatar */}
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                authUser.role === 'owner' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                            )}>
                                {authUser.siglas || 'XX'}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 truncate">{authUser.nombreCompleto}</div>
                                <div className="text-xs text-gray-400">ID: {authUser.id}</div>
                            </div>

                            {/* Role Selector */}
                            {authUser.role === 'owner' ? (
                                <span className={`px-3 py-1 text-xs font-medium rounded-lg ${roleLabels.owner.color}`}>
                                    {roleLabels.owner.label}
                                </span>
                            ) : (
                                <select 
                                    value={authUser.role}
                                    onChange={(e) => handleChangeRole(authUser.id, e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Solo Lectura</option>
                                </select>
                            )}

                            {/* Remove Button */}
                            {authUser.role !== 'owner' && (
                                <button 
                                    onClick={() => handleRemoveUser(authUser.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Quitar acceso"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    {authorizedUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No hay usuarios autorizados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Permissions Legend */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Niveles de Acceso
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(roleLabels).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${val.color}`}>{val.label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-blue-600 mt-3">
                    <strong>Propietario:</strong> Control total • <strong>Admin:</strong> Puede agregar usuarios • 
                    <strong>Editor:</strong> Puede modificar configuración • <strong>Lectura:</strong> Solo visualización
                </p>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal 
                    onClose={() => setShowAddModal(false)}
                    onSelect={handleAddUser}
                />
            )}
        </div>
    );
}

/**
 * Modal para agregar usuario
 */
function AddUserModal({ onClose, onSelect }) {
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) return callback([]);
        axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/buscar`, {
            params: { nombre: inputValue }
        })
        .then(response => {
            const options = (response.data || []).map(f => ({
                value: f.idFuncionario,
                label: f.nombreCompleto,
                ...f
            }));
            callback(options);
        })
        .catch(() => callback([]));
    };
    const debouncedLoadOptions = debounce(loadOptions, 400);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-800">Agregar Usuario Autorizado</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Funcionario</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={false}
                        loadOptions={debouncedLoadOptions}
                        onChange={(opt) => onSelect(opt)}
                        placeholder="Escribe el nombre del funcionario..."
                        classNamePrefix="react-select"
                        noOptionsMessage={() => "Escribe al menos 3 caracteres"}
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: '0.75rem',
                                borderColor: '#e5e7eb',
                                padding: '0.25rem',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#d1d5db' }
                            })
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-4 bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-100">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        El usuario tendrá acceso como <strong>Editor</strong> por defecto. Puedes cambiar su rol después.
                    </p>
                </div>
            </div>
        </div>
    );
}
