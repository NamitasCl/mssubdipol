// src/pages/VisualizacionCalendarioPage.jsx
import {useEffect, useState} from 'react';
// import { useParams } from 'react-router-dom';
import {getAsignaciones, getCalendarioById} from '../../api/mockApi';
import VistaPorDia from './components/VistaPorDia';

// Helper para agrupar por fecha
const agruparAsignacionesPorFecha = (asignaciones) => {
    return asignaciones.reduce((acc, asig) => {
        const fecha = asig.slot.fecha;
        if (!acc[fecha]) {
            acc[fecha] = [];
        }
        acc[fecha].push(asig);
        return acc;
    }, {});
};

export default function VisualizacionCalendarioPage() {
    // const { id: calendarioId } = useParams();
    const calendarioId = 1; // ID Fijo para la demo

    const [calendario, setCalendario] = useState(null);
    const [asignacionesAgrupadas, setAsignacionesAgrupadas] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const [calData, asigData] = await Promise.all([
                    getCalendarioById(calendarioId),
                    getAsignaciones(calendarioId)
                ]);

                setCalendario(calData);
                setAsignacionesAgrupadas(agruparAsignacionesPorFecha(asigData));

            } catch (err) {
                console.error("Error al cargar datos", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [calendarioId]);

    if (isLoading) return <div className="p-4">Cargando turnos resueltos...</div>;
    if (!calendario) return <div className="p-4 text-danger">Error: Calendario no encontrado.</div>;

    const fechasOrdenadas = Object.keys(asignacionesAgrupadas).sort();

    return (
        <div className="container mt-4">
            <h1 className="h2 mb-1">Turnos Resueltos: {calendario.nombre}</h1>
            <p className="h5 text-muted mb-4">Estado: {calendario.estado}</p>

            <div className="d-grid gap-3">
                {fechasOrdenadas.length === 0 ? (
                    <p>No hay turnos generados para este calendario.</p>
                ) : (
                    fechasOrdenadas.map(fecha => (
                        <VistaPorDia
                            key={fecha}
                            fecha={fecha}
                            asignaciones={asignacionesAgrupadas[fecha]}
                        />
                    ))
                )}
            </div>
        </div>
    );
}