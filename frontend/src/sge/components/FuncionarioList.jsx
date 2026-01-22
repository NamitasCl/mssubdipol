import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, UserPlus, FileBadge, MapPin, Search, Filter, Mail, Phone, Shield } from 'lucide-react';
import AsyncFuncionarioSelect from '../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx';
import { useAuth } from '../../components/contexts/AuthContext.jsx';

const ESPECIALIDADES = [
    "AUDITOR", "ENFERMERO", "PARAMEDICO", "MEDICO", "ABOGADO", 
    "PSICOLOGO", "KINESIOLOGO", "INGENIERO", "TECNICO", "BOMBERO", "DRON", "OTRO"
];

const FuncionarioList = () => {
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);

    // Initial State
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        // Editable fields
        telefono: '',
        correo: '',
        especialidades: [],
        // Read-only Institutional fields (from CommonServices)
        // subdireccion: '', // Removed
        region: '',
        jefatura: '',
        // prefectura: '', // Removed
        unidad: '',
        grado: ''
    });

    useEffect(() => {
        fetchFuncionarios();
    }, []);

    const fetchFuncionarios = async () => {
        try {
            const res = await axios.get('/api/funcionarios');
            setFuncionarios(res.data);
        } catch (error) { console.error("Error", error); }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEsp = (e) => {
         const options = Array.from(e.target.selectedOptions, option => option.value);
         setFormData({ ...formData, especialidades: options });
    }

    // Auto-fill logic from CommonServices data
    const handleFuncionarioSelected = (option) => {
        setSelectedFuncionario(option);
        if (option && option.f) {
            const f = option.f;
            setFormData(prev => ({
                ...prev,
                rut: f.rut || '',
                nombre: f.nombreCompleto || '',
                
                // Institutional Data (Read-only)
                // subdireccion: f.subdireccion || '', // Removed per request
                region: f.region || '',
                jefatura: f.jefatura || '', // Now mapped to Unit Reporta from backend
                // prefectura: f.prefectura || '', // Removed per request
                unidad: f.nombreUnidad || f.unidad || '',
                grado: f.grado || '',
                
                // Keep previous contact info if editing, or reset if new
                // telefono: prev.telefono, 
                // correo: prev.correo
            }));
        } else {
             // Reset if cleared
             setFormData(prev => ({
                 ...prev,
                 rut: '', nombre: '', region: '', jefatura: '', 
                 unidad: '', grado: ''
             }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/funcionarios', formData);
            // Reset form
            setFormData({
                rut: '', nombre: '', telefono: '', correo: '', especialidades: [],
                subdireccion: '', region: '', jefatura: '', prefectura: '', unidad: '', grado: ''
            });
            setSelectedFuncionario(null);
            fetchFuncionarios();
        } catch (error) { console.error("Error creating", error); }
    };

    const handleDelete = async (id) => {
         try { await axios.delete(`/api/funcionarios/${id}`); fetchFuncionarios(); } 
         catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Funcionarios</h1>
                    <p className="text-gray-500 mt-1">Administración de la dotación y personal activo</p>
                </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-primary-900 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <UserPlus size={20} className="text-secondary-400"/> 
                        Registro de Personal
                    </h2>
                </div>
                
                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Identification & Auto-fill */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                             <label className="block text-sm font-bold text-gray-700 mb-2">Buscar Funcionario (Institucional)</label>
                             <AsyncFuncionarioSelect 
                                value={selectedFuncionario}
                                onChange={handleFuncionarioSelected}
                                user={user}
                             />
                             <p className="text-xs text-gray-500 mt-2">
                                * La búsqueda obtendrá automáticamente los datos institucionales.
                             </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Read-only Personal Data */}
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">R.U.T</label>
                                <input name="rut" value={formData.rut} className="w-full bg-gray-50 border-gray-200 text-gray-600 rounded-lg cursor-not-allowed" readOnly />
                            </div>
                            <div className="md:col-span-8">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                                <input name="nombre" value={formData.nombre} className="w-full bg-gray-50 border-gray-200 text-gray-600 rounded-lg cursor-not-allowed" readOnly />
                            </div>
                        </div>

                        {/* Section 2: Contact & Extras (Editable) */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Mail size={16} /> Información de Contacto y Habilidades
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input name="telefono" value={formData.telefono} onChange={handleInput} placeholder="+56 9 ..." 
                                            className="w-full pl-9 border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-3 text-gray-400"/>
                                        <input name="correo" type="email" value={formData.correo} onChange={handleInput} placeholder="funcionario@investigaciones.cl" 
                                            className="w-full pl-9 border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Especialidades</label>
                                     <select multiple name="especialidades" value={formData.especialidades} onChange={handleEsp} 
                                        className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 h-[42px] text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                         {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                                     </select>
                                     <p className="text-[10px] text-gray-400 mt-1">Ctrl+Click para múltiple</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Institutional Data (Read-Only) */}
                        <div>
                             <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Shield size={16} /> Datos Institucionales (Automáticos)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-5 rounded-xl border border-gray-200/60">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Unidad</label>
                                    <input name="unidad" value={formData.unidad} className="w-full bg-white border-gray-200 text-gray-700 font-medium rounded-md py-1.5 px-3 text-sm cursor-not-allowed shadow-sm" readOnly />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Grado</label>
                                    <input name="grado" value={formData.grado} className="w-full bg-white border-gray-200 text-gray-700 font-medium rounded-md py-1.5 px-3 text-sm cursor-not-allowed shadow-sm" readOnly />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Región</label>
                                    <input name="region" value={formData.region} className="w-full bg-white border-gray-200 text-gray-700 rounded-md py-1.5 px-3 text-sm cursor-not-allowed" readOnly />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Jefatura</label>
                                    <input name="jefatura" value={formData.jefatura} className="w-full bg-white border-gray-200 text-gray-700 rounded-md py-1.5 px-3 text-sm cursor-not-allowed" readOnly />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button type="submit" disabled={!formData.rut} className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                                <Plus size={20}/> Registrar Funcionario
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileBadge size={20} className="text-primary-600"/> 
                        Dotación Actual
                    </h2>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-3 border-b border-gray-100">Grado</th>
                                <th className="px-6 py-3 border-b border-gray-100">Funcionario</th>
                                <th className="px-6 py-3 border-b border-gray-100">Unidad</th>
                                <th className="px-6 py-3 border-b border-gray-100">Contacto</th>
                                <th className="px-6 py-3 border-b border-gray-100 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {funcionarios.map(f => (
                                <tr key={f.rut} className="hover:bg-blue-50/50 transition-colors group text-sm">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-primary-900 bg-blue-50 px-2 py-1 rounded border border-blue-100 text-xs">
                                            {f.grado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{f.nombre}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{f.rut}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-800 font-medium">{f.unidad}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Shield size={10} /> {f.prefectura}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                         {f.correo && <div className="text-xs flex items-center gap-1 mb-1"><Mail size={10}/> {f.correo}</div>}
                                         {f.telefono && <div className="text-xs flex items-center gap-1"><Phone size={10}/> {f.telefono}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(f.rut)} 
                                            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {funcionarios.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        No hay funcionarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FuncionarioList;
