import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sgeApi from '../../api/sgeApi';
import { Users, FileSpreadsheet, Search, ArrowLeft, MapPin, Phone } from 'lucide-react';

const AfectadosList = () => {
    const navigate = useNavigate();
    const [afectados, setAfectados] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [selectedEvento, setSelectedEvento] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEventos();
        // Initial fetch will happen after events are loaded or independently
        fetchAfectados();
    }, []);

    const fetchEventos = async () => {
        try {
            const res = await sgeApi.get('/eventos');
            // Show all events, even inactive ones might have legacy records
            setEventos(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAfectados = async (eventoId = '') => {
        setLoading(true);
        try {
            const url = eventoId ? `/familia-afectada?eventoId=${eventoId}` : '/familia-afectada';
            const res = await sgeApi.get(url);
            setAfectados(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching afectados", error);
            setLoading(false);
        }
    };

    const handleEventoChange = (e) => {
        const newVal = e.target.value;
        setSelectedEvento(newVal);
        fetchAfectados(newVal);
    };

    const handleDownloadExcel = async () => {
        try {
            const url = selectedEvento
                ? `/familia-afectada/export?eventoId=${selectedEvento}`
                : '/familia-afectada/export';

            const response = await sgeApi.get(url, {
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', 'Reporte_Afectados.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading excel", error);
            alert("Error al descargar el archivo Excel.");
        }
    };

    const filteredAfectados = afectados.filter(f =>
        f.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.funcionarioNombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando registros...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate('/sge/familiares')}
                        className="text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-1 text-sm transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver al Registro
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Users className="text-blue-600" />
                        Reporte General de Afectados
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Visualización consolidada de familias afectadas ({afectados.length} registros).
                    </p>
                </div>

                <div className="flex gap-2">
                    <select
                        className="rounded-lg border-gray-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                        value={selectedEvento}
                        onChange={handleEventoChange}
                    >
                        <option value="">Todos los Eventos</option>
                        {eventos.map(e => (
                            <option key={e.id} value={e.id}>{e.descripcion}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleDownloadExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 font-bold whitespace-nowrap"
                    >
                        <FileSpreadsheet size={20} />
                        Descargar Excel
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, RUT o funcionario..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Afectado / RUT</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Parentesco</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bien Afectado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Funcionario Resp.</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto / Dirección</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAfectados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : (
                                filteredAfectados.map((fam) => (
                                    <tr key={fam.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{fam.nombreCompleto}</div>
                                            <div className="text-xs text-gray-500">{fam.rut}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded text-xs font-bold uppercase">
                                                {fam.parentesco}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{fam.tipoBienAfectado}</div>
                                            {fam.detalle && (
                                                <div className="text-xs text-gray-400 max-w-[200px] truncate" title={fam.detalle}>
                                                    {fam.detalle}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-blue-600 font-medium">{fam.funcionarioNombre}</div>
                                            <div className="text-xs text-gray-400">{fam.funcionarioRut}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Phone size={12} className="text-gray-400" /> {fam.telefono}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1" title={fam.direccion}>
                                                <MapPin size={12} className="text-gray-400" />
                                                <span className="truncate max-w-[150px]">{fam.direccion}</span>
                                            </div>
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

export default AfectadosList;
