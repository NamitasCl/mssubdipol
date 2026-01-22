import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FuncionarioList from './components/FuncionarioList';
import VehiculoList from './components/VehiculoList';
import DespliegueList from './components/DespliegueList';
import EventoList from './components/EventoList';
import EventoCreate from './components/EventoCreate';
import EventoDetail from './components/EventoDetail';
import DespliegueCreate from './components/DespliegueCreate';
import AsignacionCreate from './components/AsignacionCreate';
import DespliegueDetail from './components/DespliegueDetail';

import InventarioList from './components/InventarioList';
import EventReport from './components/EventReport';

function SGEApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Eventos Routes */}
        <Route path="eventos" element={<EventoList />} />
        <Route path="eventos/new" element={<EventoCreate />} />
        <Route path="eventos/:id" element={<EventoDetail />} />
        <Route path="eventos/:id/reporte" element={<EventReport />} />
        <Route path="eventos/:eventId/despliegues/new" element={<DespliegueCreate />} />
        
        {/* Despliegues Routes */}
        <Route path="despliegues" element={<DespliegueList />} />
        <Route path="despliegues/:id" element={<DespliegueDetail />} />
        <Route path="despliegues/:despliegueId/asignar" element={<AsignacionCreate />} />

        <Route path="inventario" element={<InventarioList />} />

        <Route path="funcionarios" element={<FuncionarioList />} />
        <Route path="vehiculos" element={<VehiculoList />} />
      </Routes>
    </Layout>
  );
}

export default SGEApp;
