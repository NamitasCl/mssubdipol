import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard.jsx";
import AsignacionTurnosMensual from "./pages/turnos/AsignacionTurnosMensual.jsx";
import {RestrictedAreaJefe} from "./components/RestrictedAreaJefe.jsx";
import {Jefe} from "./pages/turnos/Jefe.jsx";
import LoginForm from "./LoginForm.jsx";
import {RestrictedAreaAdmin} from "./components/RestrictedAreaAdmin.jsx";
import Admin from "./pages/admin/Admin.jsx";
import {RestrictedAreaSubJefe} from "./components/RestrictedAreaSubJefe.jsx";
import {RestrictedAreaSecuin} from "./components/RestrictedAreaSecuin.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import ModificarAsignacionesUnidad from "./pages/turnos/ModificarAsignacionesUnidad.jsx";
import PaginaEnConstruccion from "./pages/PaginaEnConstruccion.jsx";
import VistaCalendarioTurnosFiltros from "./pages/turnos/VistaCalendarioTurnosFiltros.jsx";
import DashboardPrincipal from "./DashboardPrincipal.jsx";
import ServiciosEspecialesLayout from "./pages/formularioDinamico/ServiciosEspecialesLayout.jsx";
import './assets/App.css';
import ListaFormulariosDisponibles from "./pages/formularioDinamico/ListaFormulariosDisponibles.jsx";
import FormBuilderApp from "./pages/formularioDinamico/FormBuilderApp.jsx";
import FormularioDinamicoPage from "./pages/formularioDinamico/FormularioDinamicoPage.jsx";
import VistaRegistrosFormulario from "./pages/formularioDinamico/VistaRegistrosFormulario.jsx";
import GestionTurnosPage from "./pages/turnos/GestionTurnosPage.jsx";
import {UnitDepartmentManagement} from "./pages/turnos/UnitDepartmentManagement.jsx";
import CalendarioPage from "./pages/calendarios/CalendarioPage.jsx";
import MisCalendariosParaAportar from "./pages/calendarios/MisCalendariosParaAportar.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import PlantillaTurnoBuilder from "./pages/calendarios/PlantillaTurnoBuilder.jsx";



export default function App() {
    return (
        <Router basename="/turnos">
            <Routes>
                <Route path="/admin" element={<RestrictedAreaAdmin><AdminLayout /></RestrictedAreaAdmin>}>
                    <Route index element={<Admin />} />
                    <Route path="plantillas" element={<PlantillaTurnoBuilder />} />
                    <Route path="listas">

                    </Route>
                </Route>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/enconstruccion" element={<PaginaEnConstruccion />} />
                <Route path="/" element={<AuthGuard><DashboardPrincipal /></AuthGuard>} />
                <Route path="/formularios" element={<AuthGuard><ServiciosEspecialesLayout /></AuthGuard>}>
                    <Route index element={<ListaFormulariosDisponibles />} />
                    <Route path="crear-formulario" element={<FormBuilderApp />} />
                    <Route path="formulario/:id" element={<FormularioDinamicoPage />} />
                    <Route path="verregistros" element={<VistaRegistrosFormulario />} />
                </Route>
                <Route path="/layout" element={<AuthGuard><Layout /></AuthGuard>}>
                    <Route index element={<Dashboard />} />
                    <Route path="configuraunidades" element={<RestrictedAreaSecuin component={UnitDepartmentManagement} />} />
                    <Route path="gestion" element={<RestrictedAreaSecuin component={GestionTurnosPage} />} />
                    <Route path="asignacionunidad" element={<MisCalendariosParaAportar />} />
                    <Route path="modificaturnosunidad" element={<RestrictedAreaSubJefe component={ModificarAsignacionesUnidad} />} />
                    <Route path="calendario" element={<VistaCalendarioTurnosFiltros />} />
                    <Route path="calendarios" element={<CalendarioPage />} />
                    <Route path="disponibles" element={<RestrictedAreaSecuin component={AsignacionTurnosMensual} />} />
                    <Route path="jefe" element={<RestrictedAreaJefe component={Jefe} />} />
                    <Route path="plantillas" element={<PlantillaTurnoBuilder />} />
                </Route>
            </Routes>
        </Router>
    );
}