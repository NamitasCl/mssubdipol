import React, { useState, useEffect } from 'react';
import sgeApi from '../../api/sgeApi';
import { RefreshCw, ToggleLeft, ToggleRight, Save } from 'lucide-react';

const AdminModules = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        setLoading(true);
        try {
            const res = await sgeApi.get('/modules');
            setModules(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (mod) => {
        const updated = { ...mod, enabled: !mod.enabled };
        try {
            await sgeApi.put(`/modules/${mod.moduleKey}`, updated);
            setModules(modules.map(m => m.moduleKey === mod.moduleKey ? updated : m));
        } catch (error) {
            alert("Error updating module");
        }
    };

    const handleRolesUpdate = async (mod, rolesString) => {
        // Simple comma separated parser
        const roles = rolesString.split(',').map(r => r.trim()).filter(r => r);
        const updated = { ...mod, authorizedRoles: roles };
        try {
            await sgeApi.put(`/modules/${mod.moduleKey}`, updated);
            setModules(modules.map(m => m.moduleKey === mod.moduleKey ? updated : m));
        } catch (error) {
            alert("Error updating roles");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Administración de Módulos (Dashboard)</h1>
                <button onClick={fetchModules} className="text-blue-600 hover:text-blue-800"><RefreshCw size={20} /></button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Módulo</th>
                            <th className="p-4">Ruta</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Roles Permitidos (CSV)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {modules.map(mod => (
                            <tr key={mod.moduleKey} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${mod.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {mod.title}
                                    </div>
                                    <div className="text-xs text-gray-500">{mod.description}</div>
                                </td>
                                <td className="p-4 font-mono text-sm text-blue-600">{mod.route}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggle(mod)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold transition ${mod.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {mod.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        {mod.enabled ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <RolesEditor mod={mod} onSave={handleRolesUpdate} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RolesEditor = ({ mod, onSave }) => {
    const [val, setVal] = useState(mod.authorizedRoles.join(', '));
    const [changed, setChanged] = useState(false);

    useEffect(() => { setVal(mod.authorizedRoles.join(', ')); setChanged(false); }, [mod]);

    const handleChange = (e) => {
        setVal(e.target.value);
        setChanged(true);
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={val}
                onChange={handleChange}
                className="border rounded p-1 text-sm w-full"
            />
            {changed && (
                <button
                    onClick={() => onSave(mod, val)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    <Save size={16} />
                </button>
            )}
        </div>
    );
};

export default AdminModules;
