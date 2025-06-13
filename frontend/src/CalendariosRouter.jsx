// src/pages/turnos/CalendariosRouter.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import CalendariosPage from "./pages/calendarios/CalendariosPage.jsx";
import AvailabilityPage from "./pages/calendarios/AvailabilityPage.jsx";
import ScheduleGeneratePage from "./pages/calendarios/ScheduleGeneratePage.jsx";

export default function CalendariosRouter() {
    return (
        <Routes>
            <Route index element={<CalendariosPage />} />
            <Route path=":id/indisponibilidad" element={<AvailabilityPage />} />
            <Route path=":id/generar" element={<ScheduleGeneratePage />} />
            {/*<Route path="reportes" element={<ReportsPage/>}/>*/}
        </Routes>
    );
}
