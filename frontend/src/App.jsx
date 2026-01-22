import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard.jsx";
import AsignacionTurnosMensual from "./pages/turnos/AsignacionTurnosMensual.jsx";
import { RestrictedAreaJefe } from "./components/RestrictedAreaJefe.jsx";
import { Jefe } from "./pages/turnos/Jefe.jsx";
import LoginForm from "./LoginForm.jsx";
import { RestrictedAreaAdmin } from "./components/RestrictedAreaAdmin.jsx";
import Admin from "./pages/admin/Admin.jsx";
import { RestrictedAreaSubJefe } from "./components/RestrictedAreaSubJefe.jsx";
import { RestrictedAreaSecuin } from "./components/RestrictedAreaSecuin.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import ModificarAsignacionesUnidad from "./pages/calendarios/ModificarAsignacionesUnidad.jsx";
import PaginaEnConstruccion from "./pages/PaginaEnConstruccion.jsx";
import VistaCalendarioTurnosFiltros from "./pages/calendarios/VistaCalendarioTurnosFiltros.jsx";
import DashboardPrincipal from "./DashboardPrincipal.jsx";
import ServiciosEspecialesLayout from "./pages/formularioDinamico/ServiciosEspecialesLayout.jsx";
import './assets/App.css';
import ListaFormulariosDisponibles from "./pages/formularioDinamico/ListaFormulariosDisponibles.jsx";
import FormBuilderApp from "./pages/formularioDinamico/FormBuilderApp.jsx";
import FormularioDinamicoPage from "./pages/formularioDinamico/FormularioDinamicoPage.jsx";
import VistaRegistrosFormulario from "./pages/formularioDinamico/VistaRegistrosFormulario.jsx";
import { UnitDepartmentManagement } from "./pages/turnos/UnitDepartmentManagement.jsx";
import CalendarioPage from "./pages/calendarios/CalendarioPage.jsx";
import MisCalendariosParaAportar from "./pages/calendarios/MisCalendariosParaAportar.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import PlantillaTurnoBuilder from "./pages/calendarios/PlantillaTurnoBuilder.jsx";
import GrafoIndex from "./pages/grafos/GrafoIndex.jsx";
import PanelAdministracionAportes from "./pages/admin/PanelAdministracionAportes.jsx";
import AuditoriaMemos from "./pages/auditoria_servicios_especiales/AuditoriaMemos.jsx";
import TablaJose from "./pages/TablaJose.jsx";
import ServiciosMasivosRHF from "./pages/desarrollo/masivos/ServiciosMasivosRHF.jsx";
import FormulariosV2Page from "./pages/formulariosv2/FormulariosV2Page.jsx";
import SGEApp from "./sge/SGEApp.jsx";



export default function App() {
    return (
        <Router basename="/turnos">
            <Routes>
                <Route path="/jose" element={<TablaJose />} />
                <Route path="/masivos" element={<ServiciosMasivosRHF />} />
                <Route path="/formulariosv2" element={<FormulariosV2Page />} />

                {/*<Route path="/dev" element={<DevLayout/>}>
                     Ruta para la gestión de plantillas
                     URL final: /dev/plantillas
                    <Route path="plantillas" element={<PlantillasPage/>}/>

                     Ruta para el dashboard de calendarios
                     URL final: /dev/calendarios
                    <Route path="calendarios" element={<CalendariosPage/>}/>

                     Ruta para la página de configuración (con ID dinámico)
                     URL final: /dev/calendarios/1/configurar
                    <Route
                        path="calendarios/:id/configurar"
                        element={<ConfiguracionCalendarioPage/>}
                    />

                     Ruta para la página de visualización (con ID dinámico)
                     URL final: /dev/calendarios/1/ver
                    <Route
                        path="calendarios/:id/ver"
                        element={<VisualizacionCalendarioPage/>}
                    />

                     Esta es la ruta "index" del grupo /dev.
            Si un usuario va a /dev o /dev/, será redirigido
            automáticamente a /dev/calendarios.

                    <Route index element={<Navigate to="calendarios" replace/>}/>
                </Route>*/}
                <Route path="/admin" element={<RestrictedAreaAdmin><AdminLayout /></RestrictedAreaAdmin>}>
                    <Route index element={<Admin />} />
                    <Route path="plantillas" element={<PlantillaTurnoBuilder />} />
                    <Route path="listas"></Route>
                    <Route path="aportefuncionarios" element={<PanelAdministracionAportes />} />
                </Route>
                <Route path="/auditoria" element={<AuditoriaMemos />} />
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
                    <Route path="configuraunidades"
                        element={<RestrictedAreaSecuin component={UnitDepartmentManagement} />} />
                    <Route path="gestion" element={<RestrictedAreaSecuin component={CalendarioPage} />} />
                    <Route path="asignacionunidad" element={<MisCalendariosParaAportar />} />
                    <Route path="modificaturnosunidad"
                        element={<RestrictedAreaSubJefe component={ModificarAsignacionesUnidad} />} />
                    <Route path="calendario" element={<VistaCalendarioTurnosFiltros />} />
                    <Route path="calendarios" element={<CalendarioPage />} />
                    <Route path="disponibles" element={<RestrictedAreaSecuin component={AsignacionTurnosMensual} />} />
                    <Route path="jefe" element={<RestrictedAreaJefe component={Jefe} />} />
                    <Route path="plantillas" element={<PlantillaTurnoBuilder />} />
                </Route>
                <Route path="/grafos" element={<GrafoIndex />} />
                <Route path="/sge/*" element={<AuthGuard><SGEApp /></AuthGuard>} />
            </Routes>
        </Router>
    );
}