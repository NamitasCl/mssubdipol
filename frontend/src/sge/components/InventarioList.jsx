import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Hammer, Plus, Trash2 } from 'lucide-react';

const InventarioList = () => {
    const [tab, setTab] = useState('recursos'); // 'recursos' or 'insumos'
    const [recursos, setRecursos] = useState([]);
    const [insumos, setInsumos] = useState([]);

    const [newRecurso, setNewRecurso] = useState({ nombre: '', tipo: '', estado: 'OPERATIVO' });
    const [newInsumo, setNewInsumo] = useState({ nombre: '', tipo: '', cantidad: 0, unidad: '', fechaVencimiento: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recRes, insRes] = await Promise.all([
                axios.get('/api/recursos'),
                axios.get('/api/insumos')
            ]);
            setRecursos(recRes.data);
            setInsumos(insRes.data);
        } catch (error) { console.error(error); }
    };

    const handleCreateRecurso = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/recursos', newRecurso);
            setNewRecurso({ nombre: '', tipo: '', estado: 'OPERATIVO' });
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleCreateInsumo = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/insumos', newInsumo);
            setNewInsumo({ nombre: '', tipo: '', cantidad: 0, unidad: '', fechaVencimiento: '' });
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (type, id) => {
        try {
            await axios.delete(`/api/${type}/${id}`);
            fetchData();
        } catch (error) { console.error(error); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package size={24}/> Gestión de Inventario
            </h2>
            
            {/* Tabs */}
            <div className="flex border-b">
                <button 
                    onClick={() => setTab('recursos')}
                    className={`px-4 py-2 font-medium ${tab === 'recursos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><Hammer size={18}/> Equipamiento / Maquinaria</div>
                </button>
                <button 
                    onClick={() => setTab('insumos')}
                    className={`px-4 py-2 font-medium ${tab === 'insumos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2"><Package size={18}/> Insumos / Provisiones</div>
                </button>
            </div>

            {/* RECURSOS CONTENT */}
            {tab === 'recursos' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold mb-4 flex items-center gap-2">Nuevo Equipo</h3>
                        <form onSubmit={handleCreateRecurso} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="text-xs text-gray-500">Nombre</label>
                                <input placeholder="Ej: Generador Diesel 500W" value={newRecurso.nombre} onChange={e => setNewRecurso({...newRecurso, nombre: e.target.value})} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Tipo/Categoría</label>
                                <input placeholder="Ej: Energía, Herramienta" value={newRecurso.tipo} onChange={e => setNewRecurso({...newRecurso, tipo: e.target.value})} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Estado</label>
                                <select value={newRecurso.estado} onChange={e => setNewRecurso({...newRecurso, estado: e.target.value})} className="border p-2 rounded w-full">
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
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${r.estado === 'OPERATIVO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {r.estado}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => handleDelete('recursos', r.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {recursos.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No hay equipos registrados.</td></tr>}
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
                        <form onSubmit={handleCreateInsumo} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500">Nombre</label>
                                <input placeholder="Ej: Bidones de Agua" value={newInsumo.nombre} onChange={e => setNewInsumo({...newInsumo, nombre: e.target.value})} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Cantidad</label>
                                <input type="number" placeholder="0" value={newInsumo.cantidad} onChange={e => setNewInsumo({...newInsumo, cantidad: parseInt(e.target.value)})} className="border p-2 rounded w-full" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Unidad</label>
                                <input placeholder="Lts, Kg, Cajas" value={newInsumo.unidad} onChange={e => setNewInsumo({...newInsumo, unidad: e.target.value})} className="border p-2 rounded w-full" required />
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
                                            <button onClick={() => handleDelete('insumos', i.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
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
