import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { Package, Hammer, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';
import AsyncUnidadesSelect from '../../components/ComponentesAsyncSelect/AsyncUnidadesSelect';

const InventarioList = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('recursos'); // 'recursos' or 'insumos'
    const [recursos, setRecursos] = useState([]);
    const [insumos, setInsumos] = useState([]);

    const [newRecurso, setNewRecurso] = useState({ nombre: '', tipo: '', cantidad: 1, estado: 'OPERATIVO', unidadObj: null });
    const [newInsumo, setNewInsumo] = useState({ nombre: '', tipo: '', cantidad: 0, unidad: '', fechaVencimiento: '', unidadObj: null });

    useEffect(() => {
        if (user?.nombreUnidad) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const params = { registeredBy: user.username || user.name }; // Filter by creator
            const [recRes, insRes] = await Promise.all([
                sgeApi.get('/recursos', { params }),
                sgeApi.get('/insumos', { params })
            ]);
            setRecursos(recRes.data);
            setInsumos(insRes.data);
        } catch (error) { console.error(error); }
    };

    const handleCreateRecurso = async (e) => {
        e.preventDefault();
        try {
            const unidadToSave = newRecurso.unidadObj ? newRecurso.unidadObj.label : user.nombreUnidad;
            await sgeApi.post('/recursos', {
                ...newRecurso,
                unidadDueña: unidadToSave,
                registeredBy: user.username || user.name
            });
            setNewRecurso({ nombre: '', tipo: '', cantidad: 1, estado: 'OPERATIVO', unidadObj: null });
            // If the unit matches the filter or we are admin, maybe refresh? 
            // Ideally we should ask if we want to refresh based on the selected unit. 
            // For now, let's refresh if it matches current user unit, otherwise just clear form.
            if (unidadToSave === user.nombreUnidad) fetchData();
            else alert("Recurso creado en otra unidad");
        } catch (error) { console.error(error); }
    };

    const handleCreateInsumo = async (e) => {
        e.preventDefault();
        try {
            const unidadToSave = newInsumo.unidadObj ? newInsumo.unidadObj.label : user.nombreUnidad;
            await sgeApi.post('/insumos', {
                ...newInsumo,
                unidadDueña: unidadToSave,
                registeredBy: user.username || user.name
            });
            setNewInsumo({ nombre: '', tipo: '', cantidad: 0, unidad: '', fechaVencimiento: '', unidadObj: null });
            if (unidadToSave === user.nombreUnidad) fetchData();
            else alert("Insumo creado en otra unidad");
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (type, id) => {
        try {
            await sgeApi.delete(`/${type}/${id}`);
            fetchData();
        } catch (error) { console.error(error); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package size={24} /> Gestión de Inventario
            </h2>

            {/* Tabs */}
            <div className="flex border-b">
                <button
                    onClick={() => setTab('recursos')}
                    className={`px-4 py-2 font-medium ${tab === 'recursos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><Hammer size={18} /> Equipamiento / Maquinaria</div>
                </button>
                <button
                    onClick={() => setTab('insumos')}
                    className={`px-4 py-2 font-medium ${tab === 'insumos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><Package size={18} /> Insumos / Provisiones</div>
                </button>
            </div>

            {/* RECURSOS CONTENT */}
            {tab === 'recursos' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold mb-4 flex items-center gap-2">Nuevo Equipo</h3>
                        <form onSubmit={handleCreateRecurso} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="text-xs text-gray-500">Unidad Dueña</label>
                                <AsyncUnidadesSelect
                                    user={user}
                                    value={newRecurso.unidadObj}
                                    onChange={(val) => setNewRecurso({ ...newRecurso, unidadObj: val })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500">Nombre</label>
                                <input placeholder="Ej: Generador Diesel 500W" value={newRecurso.nombre} onChange={e => setNewRecurso({ ...newRecurso, nombre: e.target.value })} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Tipo/Categoría</label>
                                <select
                                    value={newRecurso.tipo}
                                    onChange={e => setNewRecurso({ ...newRecurso, tipo: e.target.value })}
                                    className="border p-2 rounded w-full"
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Energía">Energía</option>
                                    <option value="Vehículos">Vehículos</option>
                                    <option value="Herramientas">Herramientas</option>
                                    <option value="Comunicaciones">Comunicaciones</option>
                                    <option value="Campamento">Campamento</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newRecurso.cantidad}
                                    onChange={e => setNewRecurso({ ...newRecurso, cantidad: parseInt(e.target.value) || 0 })}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Estado</label>
                                <select value={newRecurso.estado} onChange={e => setNewRecurso({ ...newRecurso, estado: e.target.value })} className="border p-2 rounded w-full">
                                    <option value="OPERATIVO">Operativo</option>
                                    <option value="MANTENCION">Mantención</option>
                                    <option value="BAJA">Baja</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2">
                                <Plus size={18} /> Agregar
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3">Cantidad</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recursos.map(r => (
                                    <tr key={r.id}>
                                        <td className="p-3 text-gray-500 text-sm">#{r.id}</td>
                                        <td className="p-3 font-medium">{r.nombre}</td>
                                        <td className="p-3">{r.tipo}</td>
                                        <td className="p-3 font-bold">{r.cantidad || 0}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${r.estado === 'OPERATIVO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {r.estado}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => handleDelete('recursos', r.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {recursos.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No hay equipos registrados.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* INSUMOS CONTENT */}
            {tab === 'insumos' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold mb-4 flex items-center gap-2">Nuevo Insumo</h3>
                        <form onSubmit={handleCreateInsumo} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="text-xs text-gray-500">Unidad Dueña</label>
                                <AsyncUnidadesSelect
                                    user={user}
                                    value={newInsumo.unidadObj}
                                    onChange={(val) => setNewInsumo({ ...newInsumo, unidadObj: val })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500">Nombre</label>
                                <input placeholder="Ej: Bidones de Agua" value={newInsumo.nombre} onChange={e => setNewInsumo({ ...newInsumo, nombre: e.target.value })} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Cantidad</label>
                                <input type="number" placeholder="0" value={newInsumo.cantidad} onChange={e => setNewInsumo({ ...newInsumo, cantidad: parseInt(e.target.value) })} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Unidad</label>
                                <input placeholder="Lts, Kg, Cajas" value={newInsumo.unidad} onChange={e => setNewInsumo({ ...newInsumo, unidad: e.target.value })} className="border p-2 rounded w-full" required />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2">
                                <Plus size={18} /> Agregar
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Cantidad</th>
                                    <th className="p-3">Unidad</th>
                                    <th className="p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {insumos.map(i => (
                                    <tr key={i.id}>
                                        <td className="p-3 text-gray-500 text-sm">#{i.id}</td>
                                        <td className="p-3 font-medium">{i.nombre}</td>
                                        <td className="p-3 font-bold text-blue-600">{i.cantidad}</td>
                                        <td className="p-3 text-gray-600">{i.unidad}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleDelete('insumos', i.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {insumos.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No hay insumos registrados.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventarioList;
