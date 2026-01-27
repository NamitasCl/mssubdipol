import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

const AdminLists = () => {
    const [selectedList, setSelectedList] = useState('tipo-vehiculo');
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [editingItem, setEditingItem] = useState(null); // { id, nombre }
    const [loading, setLoading] = useState(false);

    const listTypes = [
        { id: 'tipo-vehiculo', label: 'Tipos de Vehículo', endpoint: '/tipos-vehiculos' },
        { id: 'tipo-evento', label: 'Tipos de Evento', endpoint: '/tipos-eventos' },
        { id: 'tipo-recurso', label: 'Tipos de Recurso', endpoint: '/tipos-recursos' },
        { id: 'tipo-especialidad', label: 'Tipos de Especialidad', endpoint: '/tipos-especialidades' }
    ];

    useEffect(() => {
        if (selectedList) fetchItems();
    }, [selectedList]);

    const fetchItems = async () => {
        setLoading(true);
        const config = listTypes.find(t => t.id === selectedList);
        try {
            const res = await sgeApi.get(config.endpoint);
            setItems(res.data);
        } catch (error) {
            console.error("Error fetching items", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const config = listTypes.find(t => t.id === selectedList);
        try {
            await sgeApi.post(config.endpoint, { nombre: newItem });
            setNewItem('');
            fetchItems();
        } catch (error) {
            alert("Error al crear item");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que desea eliminar este item?")) return;
        const config = listTypes.find(t => t.id === selectedList);
        try {
            await sgeApi.delete(`${config.endpoint}/${id}`);
            fetchItems();
        } catch (error) {
            alert("Error al eliminar item");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manejador de Listas del Sistema</h1>

            <div className="flex gap-4">
                <div className="w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione Lista</label>
                    <div className="space-y-2">
                        {listTypes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedList(t.id)}
                                className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedList === t.id ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-700">
                            {listTypes.find(t => t.id === selectedList)?.label}
                        </h2>
                    </div>

                    <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Nuevo nombre..."
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                            <Plus size={18} /> Agregar
                        </button>
                    </form>

                    {loading ? <p>Cargando...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Nombre</th>
                                        <th className="p-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map(item => (
                                        <tr key={item.id}>
                                            <td className="p-3 text-gray-500 text-sm">#{item.id}</td>
                                            <td className="p-3 font-medium">{item.nombre}</td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-400">Sin registros</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLists;
