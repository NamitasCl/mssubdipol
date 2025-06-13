import React, { useEffect, useState } from "react";
import { DayPicker as Calendar } from "react-day-picker";
import { Button, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
    listAvailability,
    addAvailability,
} from "../../api/turnosApi.js";
import {useAuth} from "../../components/contexts/AuthContext.jsx";

export default function AvailabilityPage() {
    const { id: calendarId } = useParams();
    const { user } = useAuth();
    const staffId = user.idFuncionario; // TODO: id del usuario autenticado
    const [busy, setBusy] = useState(false);
    const [dates, setDates] = useState([]);
    const [error, setError] = useState(null);

    const load = async () => {
        setBusy(true);
        try {
            const res = await listAvailability(calendarId);
            setDates(res.data.map((a) => new Date(a.date)));
        } catch {
            setError("Error al cargar");
        }
        setBusy(false);
    };
    useEffect(() => { load(); }, [calendarId]);

    const toggle = (day) => {
        const ts = day.setHours(0, 0, 0, 0);
        const exists = dates.some((d) => d.setHours(0, 0, 0, 0) === ts);
        if (exists) setDates(dates.filter((d) => d.setHours(0, 0, 0, 0) !== ts));
        else setDates([...dates, new Date(ts)]);
    };

    const save = async () => {
        setBusy(true);
        await Promise.all(
            dates.map((d) =>
                addAvailability({
                    calendarId,
                    staffId,
                    date: d.toISOString().slice(0, 10),
                })
            )
        );
        setBusy(false);
        alert("Guardado");
    };

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <h4 className="mb-3">Indisponibilidad personal</h4>
            {busy && <Spinner />}
            <Calendar mode="multiple" selected={dates} onSelect={toggle} />
            <Button className="mt-3" onClick={save} disabled={busy}>
                Guardar cambios
            </Button>
        </div>
    );
}