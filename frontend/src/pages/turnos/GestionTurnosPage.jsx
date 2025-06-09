import React, { useState, useEffect } from "react";
import { Tabs, Tab, Spinner } from "react-bootstrap";
import CrearCalendarioTurnos from "./CrearCalendarioTurnos";
import EditarCalendarioTurnos from "./EditarCalendarioTurnos";
import AbrirCerrarCalendarioTurnos from "./AbrirCerrarCalendarioTurnos";
import axios from "axios";
import {useAuth} from "../../components/contexts/AuthContext.jsx";

// Este componente centraliza la gestión de sub-vistas de "Gestión de turnos"
export default function GestionTurnosPage() {
    const {user} = useAuth();
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCalendario, setSelectedCalendario] = useState(null);

    const fetchCalendarios = async () => {
        if (!user?.idFuncionario) return;
        console.log("User id: ", user.idFuncionario)
        setLoading(true);
        try {
            const resp = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/mis-calendarios`, {params: {userid: user.idFuncionario}});
            setCalendarios(resp.data || []);
            // Selecciona el primero por defecto
            if (resp.data && resp.data.length > 0) {
                setSelectedCalendario(resp.data[0]);
            }
        } catch {
            setCalendarios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarios();
    }, []);

    const handleRefresh = () => {
        fetchCalendarios();
    };

    return (
        <div>
            <Tabs defaultActiveKey="crear" id="gestion-turnos-tabs" className="mb-3" justify>
                <Tab eventKey="crear" title="Crear calendario">
                    <CrearCalendarioTurnos onCalendarioCreado={handleRefresh} />
                </Tab>
                <Tab eventKey="editar" title="Editar calendario" disabled={calendarios.length === 0}>
                    {loading ? <Spinner /> : (
                        selectedCalendario &&
                        <EditarCalendarioTurnos
                            calendario={selectedCalendario}
                            onCalendarioEditado={handleRefresh}
                        />
                    )}
                </Tab>
                <Tab eventKey="abrir-cerrar" title="Abrir/Cerrar calendario" disabled={calendarios.length === 0}>
                    {loading ? <Spinner /> : (
                        selectedCalendario &&
                        <AbrirCerrarCalendarioTurnos
                            calendario={selectedCalendario}
                            onEstadoCambiado={handleRefresh}
                        />
                    )}
                </Tab>
            </Tabs>
            {/* Lista simple para elegir otro calendario cuando hay más de uno */}
            {calendarios.length > 1 && (
                <div className="mb-3">
                    <b>Selecciona un calendario:</b>
                    <select
                        className="form-select mt-2"
                        value={selectedCalendario?.id || ""}
                        onChange={e => setSelectedCalendario(
                            calendarios.find(c => c.id === Number(e.target.value))
                        )}
                    >
                        {calendarios.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.nombreCalendario} ({c.mes}/{c.anio})
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
