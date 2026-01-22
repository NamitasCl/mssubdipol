import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Download, AlertTriangle, Users, Truck } from 'lucide-react';

const Dashboard = () => {
    // Mock data for initial render (since backend might not be running)
    const [kpis, setKpis] = useState({
        totalFuncionarios: 120,
        vehiculosTerreno: 45,
        alertasAbastecimiento: 3
    });

    const regionData = [
        { name: 'RM', funcionarios: 50 },
        { name: 'Valparaíso', funcionarios: 30 },
        { name: 'Biobío', funcionarios: 40 },
    ];

    const espData = [
        { name: 'Bomberos', value: 60 },
        { name: 'Médicos', value: 30 },
        { name: 'Drones', value: 30 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    const handleDownloadReport = () => {
        window.location.href = 'http://localhost:8080/api/reports/deployments/excel';
    };

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Funcionarios Desplegados</p>
                        <p className="text-2xl font-bold">{kpis.totalFuncionarios}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                        <Truck size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Vehículos en Terreno</p>
                        <p className="text-2xl font-bold">{kpis.vehiculosTerreno}</p>
                    </div>
                </div>

                <div className={`bg-white p-6 rounded-lg shadow-md flex items-center ${kpis.alertasAbastecimiento > 0 ? 'border-l-4 border-red-500' : ''}`}>
                    <div className="p-3 bg-red-100 rounded-full text-red-600 mr-4">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Alertas de Abastecimiento</p>
                        <p className={`text-2xl font-bold ${kpis.alertasAbastecimiento > 0 ? 'text-red-600' : 'text-gray-900'}`}>{kpis.alertasAbastecimiento}</p>
                    </div>
                </div>
            </div>

            {/* Charts & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deployment by Region */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Distribución por Región</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="funcionarios" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Specialties */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Especialidades en Terreno</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={espData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {espData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Actions Table/Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Gestión de Reportes</h3>
                    <button 
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Download size={20} />
                        Descargar Reporte Excel
                    </button>
                </div>
                <p className="text-gray-600">
                    Descargue el reporte detallado de todos los despliegues activos, incluyendo logística y personal.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
