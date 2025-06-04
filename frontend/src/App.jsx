import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/turnos/Dashboard.jsx";
import GestionTurnos from "./pages/turnos/GestionTurnos.jsx";
import UnitAssignmentView from "./pages/turnos/UnitAssignmentView.jsx";
import AsignacionTurnosMensual from "./pages/turnos/AsignacionTurnosMensual.jsx";
import {RestrictedAreaJefe} from "./components/RestrictedAreaJefe.jsx";
import {Jefe} from "./pages/turnos/Jefe.jsx";
import LoginForm from "./LoginForm.jsx";
import {RestrictedAreaAdmin} from "./components/RestrictedAreaAdmin.jsx";
import Admin from "./pages/turnos/Admin.jsx";
import {RestrictedAreaSubJefe} from "./components/RestrictedAreaSubJefe.jsx";
import {RestrictedAreaSecuin} from "./components/RestrictedAreaSecuin.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import ModificarAsignacionesUnidad from "./pages/turnos/ModificarAsignacionesUnidad.jsx";
import PaginaEnConstruccion from "./pages/PaginaEnConstruccion.jsx";
import VistaCalendarioTurnosFiltros from "./pages/turnos/VistaCalendarioTurnosFiltros.jsx";
import DashboardPrincipal from "./pages/formularioDinamico/DashboardPrincipal.jsx";

import ServiciosEspecialesLayout from "./pages/formularioDinamico/ServiciosEspecialesLayout.jsx";
import './assets/App.css';
import ListaFormulariosDisponibles from "./pages/formularioDinamico/ListaFormulariosDisponibles.jsx";
import FormBuilderApp from "./pages/formularioDinamico/FormBuilderApp.jsx";
import FormularioDinamicoPage from "./pages/formularioDinamico/FormularioDinamicoPage.jsx";
import VistaRegistrosFormulario from "./pages/formularioDinamico/VistaRegistrosFormulario.jsx";
import PaginaTurnos from "./pages/turnos/PaginaTurnos.jsx";


export default function App() {
    return (
        <Router basename="/turnos/">
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/enconstruccion" element={<PaginaEnConstruccion />} />
                <Route path="/" element={<AuthGuard><DashboardPrincipal /></AuthGuard>} />
                <Route path="/servicios-especiales" element={<AuthGuard><ServiciosEspecialesLayout /></AuthGuard>}>
                    <Route index element={<ListaFormulariosDisponibles />} />
                    <Route path="crear-formulario" element={<FormBuilderApp />} />
                    <Route path="formulario/:id" element={<FormularioDinamicoPage />} />
                    <Route path="verregistros" element={<VistaRegistrosFormulario />} />
                </Route>
                <Route path="/layout" element={<AuthGuard><PaginaTurnos /></AuthGuard>}>
                    <Route index element={<Dashboard />} />
                    {/*<Route path="turnos" element={<RestrictedAreaSecuin component={GestionTurnos} />} />*/}
                    <Route path="turnos" element={<RestrictedAreaSecuin component={GestionTurnos} />} />
                    <Route path="asignacionunidad" element={<RestrictedAreaSubJefe component={UnitAssignmentView} />} />
                    <Route path="modificaturnosunidad" element={<RestrictedAreaSubJefe component={ModificarAsignacionesUnidad} />} />
                    <Route path="calendario" element={<VistaCalendarioTurnosFiltros />} />
                    <Route path="disponibles" element={<RestrictedAreaSecuin component={AsignacionTurnosMensual} />} />
                    <Route path="jefe" element={<RestrictedAreaJefe component={Jefe} />} />
                    <Route path="admin" element={<RestrictedAreaAdmin component={Admin} />} />
                </Route>
            </Routes>
        </Router>
    );
}