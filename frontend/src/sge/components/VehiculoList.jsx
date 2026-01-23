import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

const VehiculoList = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [newVehiculo, setNewVehiculo] = useState({ sigla: '', tipo: '', capacidad: 0, estado: 'OPERATIVO' });

    useEffect(() => {
        fetchVehiculos();
    }, []);

    const fetchVehiculos = async () => {
        try {
            const res = await axios.get('/api/vehiculos');
            setVehiculos(res.data);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    const handleInput = (e) => {
        setNewVehiculo({ ...newVehiculo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/vehiculos', newVehiculo);
            setNewVehiculo({ sigla: '', tipo: '', capacidad: 0, estado: 'OPERATIVO' });
            fetchVehiculos();
        } catch (error) {
            console.error("Error creating vehicle", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/vehiculos/${id}`);
            fetchVehiculos();
        } catch (error) {
           console.error("Error deleting", error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Nuevo Vehículo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sigla / Patente</label>
                            <input 
                                name="sigla" 
                                value={newVehiculo.sigla} 
                                onChange={handleInput} 
                                placeholder="Ej: PDI-1234" 
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                required 
                            />
                            <p className="text-xs text-gray-500 mt-1">Identificador único del vehículo.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo</label>
                            <input 
                                name="tipo" 
                                value={newVehiculo.tipo} 
                                onChange={handleInput} 
                                placeholder="Ej: Camioneta 4x4, Zodiak, Helicóptero" 
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad de Personas</label>
                            <input 
                                type="number" 
                                name="capacidad" 
                                value={newVehiculo.capacidad} 
                                onChange={handleInput} 
                                min="0"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Operativo</label>
                            <select 
                                name="estado" 
                                value={newVehiculo.estado} 
                                onChange={handleInput} 
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="OPERATIVO">Operativo - Disponible para uso</option>
                                <option value="MANTENCION">En Mantención - No disponible</option>
                                <option value="BAJA">De Baja - Fuera de servicio</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow font-medium flex items-center gap-2"
                        >
                            <Plus size={20}/> Registrar Nuevo Vehículo
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Flota Vehicular</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border-b">Sigla</th>
                                <th className="p-3 border-b">Tipo</th>
                                <th className="p-3 border-b">Capacidad</th>
                                <th className="p-3 border-b">Estado</th>
                                <th className="p-3 border-b">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehiculos.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No hay vehículos registrados.</td></tr>
                            ) : (
                                vehiculos.map(v => (
                                    <tr key={v.sigla} className="hover:bg-gray-50">
                                        <td className="p-3 border-b font-bold">{v.sigla}</td>
                                        <td className="p-3 border-b">{v.tipo}</td>
                                        <td className="p-3 border-b">{v.capacidad}</td>
                                        <td className="p-3 border-b">
                                            <span className={`px-2 py-1 rounded text-xs ${v.estado === 'OPERATIVO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {v.estado}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <button onClick={() => handleDelete(v.sigla)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VehiculoList;
