import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import GestionUnidades from "./pages/GestionUnidades";
import GestionTurnos from "./GestionTurnos.jsx";
import UnitAssignmentView from "./UnitAssignmentView.jsx";
import AsignacionTurnosMensual from "./pages/AsignacionTurnosMensual.jsx";
import {RestrictedAreaJefe} from "./components/RestrictedAreaJefe.jsx";
import {Jefe} from "./Jefe.jsx";
import LoginForm from "./LoginForm.jsx";
import {RestrictedAreaAdmin} from "./components/RestrictedAreaAdmin.jsx";
import Admin from "./Admin.jsx";
import {RestrictedAreaSubJefe} from "./components/RestrictedAreaSubJefe.jsx";
import {RestrictedAreaSecuin} from "./components/RestrictedAreaSecuin.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import ModificarAsignacionesUnidad from "./pages/ModificarAsignacionesUnidad.jsx";
import PaginaEnConstruccion from "./pages/PaginaEnConstruccion.jsx";
import VistaCalendarioTurnosFiltros from "./pages/VistaCalendarioTurnosFiltros.jsx";
import DashboardPrincipal from "./pages/DashboardPrincipal.jsx";

import ServiciosEspecialesLayout from "./pages/ServiciosEspecialesLayout.jsx";
import './assets/App.css';
import ListaFormulariosDisponibles from "./pages/formularioDinamico/ListaFormulariosDisponibles.jsx";
import FormBuilderApp from "./pages/formularioDinamico/FormBuilderApp.jsx";
import FormularioDinamicoPage from "./pages/formularioDinamico/FormularioDinamicoPage.jsx";
import VistaRegistrosFormulario from "./pages/formularioDinamico/VistaRegistrosFormulario.jsx";


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
                <Route path="/layout" element={<AuthGuard><Layout /></AuthGuard>}>
                    <Route index element={<Dashboard />} />
                    <Route path="unidades" element={<GestionUnidades />} />
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