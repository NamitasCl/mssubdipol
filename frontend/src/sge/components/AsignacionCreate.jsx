import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck, CheckCircle, Package, Users, Wallet, Shield, Search, ArrowRight, UserPlus, X } from 'lucide-react';

const AsignacionCreate = () => {
  const { despliegueId } = useParams();
  const navigate = useNavigate();
  const [despliegue, setDespliegue] = useState(null);
  
  // Data State
  const [vehiculos, setVehiculos] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Form State
  const [assignType, setAssignType] = useState('vehiculo'); // vehiculo, recurso, insumo, personal
  const [selectedId, setSelectedId] = useState(''); // Stores Sigla or ID
  const [cantidad, setCantidad] = useState(0); // For Insumos
  const [unidadOrigen, setUnidadOrigen] = useState('');
  
  // Crew State (for Vehicle or Personal)
  const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load Deployment
    axios.get(`/api/despliegues/${despliegueId}`).then(res => {
         setDespliegue(res.data);
    });

    // Load All Stock
    axios.get('/api/vehiculos').then(res => setVehiculos(res.data.filter(v => v.estado === 'OPERATIVO')));
    axios.get('/api/recursos').then(res => setRecursos(res.data.filter(r => r.estado === 'OPERATIVO')));
    axios.get('/api/insumos').then(res => setInsumos(res.data));
    axios.get('/api/funcionarios').then(res => setFuncionarios(res.data.filter(f => f.estado === 'DISPONIBLE')));
  }, [despliegueId]);

  const handleFuncionarioToggle = (id) => {
      setSelectedFuncionarios(prev => 
          prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assignType !== 'personal' && !selectedId) return;
    if (assignType === 'personal' && selectedFuncionarios.length === 0) {
        alert("Debe seleccionar al menos un funcionario");
        return;
    }

    try {
        const payload = {
            despliegue: { id: despliegueId },
            unidadOrigen: unidadOrigen,
            fechaAsignacion: new Date().toISOString(),
            funcionarios: selectedFuncionarios.map(id => ({ id }))
        };

        // Attach specific foreign key based on type
        if (assignType === 'vehiculo') {
            payload.vehiculo = { sigla: selectedId };
        } else if (assignType === 'recurso') {
            payload.recurso = { id: selectedId };
        } else if (assignType === 'insumo') {
            payload.insumo = { id: selectedId };
            payload.cantidadAsignada = cantidad;
        }

        await axios.post('/api/asignaciones', payload);
        alert('Recurso asignado correctamente');
        if (despliegue && despliegue.evento) {
            navigate(`/despliegues/${despliegueId}`);
        } else {
            navigate('/despliegues');
        }

    } catch (error) {
        console.error("Error creating assignment", error);
        alert('Error al asignar recurso');
    }
  };

  if (!despliegue) return <div className="p-8 text-center text-gray-500">Cargando protocolo de asignación...</div>;

  // Filter items based on type and search
  const filteredItems = () => {
      const lowerSearch = searchTerm.toLowerCase();
      switch(assignType) {
          case 'vehiculo': return vehiculos.filter(v => v.sigla.toLowerCase().includes(lowerSearch) || v.tipo.toLowerCase().includes(lowerSearch));
          case 'recurso': return recursos.filter(r => r.nombre.toLowerCase().includes(lowerSearch));
          case 'insumo': return insumos.filter(i => i.nombre.toLowerCase().includes(lowerSearch));
          case 'personal': return []; // Personal handled separately in crew section
          default: return [];
      }
  };

  const getStepDescription = () => {
      switch(assignType) {
          case 'vehiculo': return "Seleccione el móvil táctico o de transporte";
          case 'recurso': return "Seleccione equipamiento especializado";
          case 'insumo': return "Seleccione consumibles o pertrechos";
          case 'personal': return "Constituya el equipo humano";
          default: return "";
      }
  };

  const selectedItemData = () => {
      if (!selectedId) return null;
      if (assignType === 'vehiculo') return vehiculos.find(v => v.sigla === selectedId);
      if (assignType === 'recurso') return recursos.find(r => r.id === parseInt(selectedId));
      if (assignType === 'insumo') return insumos.find(i => i.id === parseInt(selectedId));
      return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-l-4 border-emerald-600 p-6 rounded-lg shadow-sm flex justify-between items-center">
             <div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs mb-1">
                    <Package size={14} /> Logística Operativa
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Asignación de Recursos</h1>
                <p className="text-gray-500">Destino: <strong>{despliegue.descripcion}</strong></p>
             </div>
             <button onClick={() => navigate(`/despliegues/${despliegueId}`)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
             </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar: Type Selector */}
            <div className="lg:col-span-3 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Categoría</h3>
                {[
                    { id: 'vehiculo', icon: <Truck size={18}/>, label: 'Vehículos' },
                    { id: 'personal', icon: <Users size={18}/>, label: 'Personal Táctico' },
                    { id: 'recurso', icon: <Wallet size={18}/>, label: 'Equipamiento' },
                    { id: 'insumo', icon: <Package size={18}/>, label: 'Insumos' },
                ].map(type => (
                    <button
                        key={type.id}
                        onClick={() => { 
                            setAssignType(type.id); 
                            setSelectedId(''); 
                            setSelectedFuncionarios([]);
                            setSearchTerm('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                            assignType === type.id 
                            ? 'bg-emerald-600 text-white shadow-md transform translate-x-1' 
                            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                        }`}
                    >
                        {type.icon}
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Center Area: Selection */}
            <div className="lg:col-span-9 space-y-6">
                
                {/* Step 1: Resource Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-200">1</span> 
                            {getStepDescription()}
                        </h3>
                        {assignType !== 'personal' && (
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400"/>
                                <input 
                                    type="text" 
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-emerald-500 w-48"
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        {assignType !== 'personal' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                {filteredItems().map(item => {
                                    const id = item.sigla || item.id;
                                    const isSelected = selectedId === id;
                                    return (
                                        <div 
                                            key={id}
                                            onClick={() => setSelectedId(id)}
                                            className={`
                                                cursor-pointer p-4 rounded-lg border-2 transition-all relative
                                                ${isSelected 
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                                                    : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{item.sigla || item.nombre}</h4>
                                                    <p className="text-xs text-gray-500">{item.tipo}</p>
                                                    {item.capacidad && <p className="text-xs text-blue-600 mt-1">Capacidad: {item.capacidad} pax</p>}
                                                    {item.cantidad !== undefined && <p className="text-xs text-orange-600 mt-1">Stock: {item.cantidad} {item.unidad}</p>}
                                                </div>
                                                {isSelected && <CheckCircle size={20} className="text-emerald-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredItems().length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-400 italic">
                                        No se encontraron recursos disponibles.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-100 text-center">
                                <Users size={48} className="mx-auto text-blue-300 mb-2"/>
                                <p className="text-blue-800 font-medium">Configuración de Equipo Humano</p>
                                <p className="text-blue-600 text-sm">Seleccione el personal en la sección de Tripulación / Equipo abajo.</p>
                            </div>
                        )}

                        {/* Insumo Quantity */}
                        {assignType === 'insumo' && selectedId && (
                            <div className="mt-6 pt-4 border-t border-gray-100 animate-fade-in">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad a Despachar</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        value={cantidad} 
                                        onChange={e => setCantidad(parseInt(e.target.value))}
                                        className="w-32 p-2 border rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none" 
                                    />
                                    <span className="text-gray-500">{selectedItemData()?.unidad}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2: Crew / Personnel */}
                {(assignType === 'vehiculo' || assignType === 'personal') && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                             <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold border border-blue-200">
                                    {assignType === 'vehiculo' ? '2' : '1'}
                                </span> 
                                {assignType === 'vehiculo' ? 'Tripulación Asignada (Opcional)' : 'Selección de Personal'}
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                 <div className="text-sm text-gray-500">
                                    {selectedFuncionarios.length} funcionarios seleccionados
                                    {assignType === 'vehiculo' && selectedItemData() && (
                                        <span className={`ml-2 font-bold ${selectedFuncionarios.length > selectedItemData().capacidad ? 'text-red-500' : 'text-green-600'}`}>
                                            (Capacidad Móvil: {selectedItemData().capacidad})
                                        </span>
                                    )}
                                 </div>
                                 <div className="relative">
                                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400"/>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar funcionario..."
                                        // Simple local filter for this functional mockup
                                        onChange={(e) => {
                                             const term = e.target.value.toLowerCase();
                                             // In a real app we might filter the list below
                                        }}
                                        className="pl-8 pr-3 py-1.5 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 w-48"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                                {funcionarios.map(f => {
                                    const isSelected = selectedFuncionarios.includes(f.id);
                                    return (
                                        <div 
                                            key={f.id}
                                            onClick={() => handleFuncionarioToggle(f.id)}
                                            className={`
                                                cursor-pointer p-3 rounded-lg border flex items-center gap-3 transition-colors
                                                ${isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
                                            `}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {f.nombre.charAt(0)}{f.apellido.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-sm truncate text-gray-800">{f.grado} {f.apellido}</p>
                                                <p className="text-xs text-gray-500 truncate">{f.nombre}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                     </div>
                )}

                {/* Final Step: Origin & Submit */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row items-end gap-4">
                         <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Unidad de Origen / Despacho</label>
                            <input 
                                type="text" 
                                value={unidadOrigen} 
                                onChange={e => setUnidadOrigen(e.target.value)}
                                placeholder="Ej: Logística Central, Brigada Antinarcóticos..."
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                            />
                         </div>
                         <button 
                            onClick={handleSubmit}
                            disabled={ !selectedId && assignType !== 'personal' }
                            className={`
                                w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1
                                ${ (!selectedId && assignType !== 'personal') ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700' }
                            `}
                        >
                            <UserPlus size={20} />
                            Confirmar Asignación
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AsignacionCreate;
