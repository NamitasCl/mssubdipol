// src/pages/ConfiguracionCalendarioPage.jsx
import {useEffect, useState} from 'react';
// import { useParams } from 'react-router-dom'; // Asumimos que tenemos el ID
import {
    asignarPlantilla,
    generarSlots,
    getCalendarioById,
    getDiasCalendario,
    getPlantillas,
    habilitarDias,
    resolverTurnos
} from '../../api/mockApi';
import CalendarioGrid from './components/CalendarioGrid';
import ConfiguracionToolbar from './components/ConfiguracionToolbar';

// --- Helpers de Fechas (Simplificado) ---
const getDiasDelMes = (fechaInicio, fechaFin) => {
    const dias = [];
    let fechaActual = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");

    while (fechaActual <= fin) {
        dias.push(fechaActual.toISOString().split('T')[0]); // Formato YYYY-MM-DD
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return dias;
};
// ----------------------------------------

export default function ConfiguracionCalendarioPage() {
    // const { id: calendarioId } = useParams(); // Así obtendrías el ID
    const calendarioId = 1; // ID Fijo para la demo

    const [calendario, setCalendario] = useState(null);
    const [diasHabilitados, setDiasHabilitados] = useState([]); // Los DiaCalendario de la BD
    const [plantillas, setPlantillas] = useState([]); // Lista de plantillas para el dropdown
    const [isLoading, setIsLoading] = useState(true);

    // Estado de la UI
    const [diasSeleccionados, setDiasSeleccionados] = useState(new Set()); // Set de fechas (YYYY-MM-DD)

    // Cargar todos los datos iniciales
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const [calData, diasData, plantillasData] = await Promise.all([
                    getCalendarioById(calendarioId),
                    getDiasCalendario(calendarioId),
                    getPlantillas() // Necesitamos las plantillas para el dropdown
                ]);
                setCalendario(calData);
                setDiasHabilitados(diasData);
                setPlantillas(plantillasData);
            } catch (err) {
                console.error("Error al cargar datos", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [calendarioId]);

    // --- Handlers de UI ---
    const handleToggleDia = (fecha) => {
        setDiasSeleccionados(prev => {
            const nuevaSeleccion = new Set(prev);
            if (nuevaSeleccion.has(fecha)) {
                nuevaSeleccion.delete(fecha);
            } else {
                nuevaSeleccion.add(fecha);
            }
            return nuevaSeleccion;
        });
    };

    // --- Handlers de Acciones (Toolbar) ---
    const handleHabilitar = async () => {
        const fechasAHabilitar = Array.from(diasSeleccionados);
        const nuevosDias = await habilitarDias(calendarioId, fechasAHabilitar);
        setDiasHabilitados(prev => [...prev, ...nuevosDias]);
        setDiasSeleccionados(new Set()); // Limpiar selección
    };

    const handleAsignar = async (plantillaId) => {
        // IDs de DiaCalendario (no fechas)
        const diaIdsParaAsignar = diasHabilitados
            .filter(dia => diasSeleccionados.has(dia.fecha))
            .map(dia => dia.id);

        const diasActualizados = await asignarPlantilla(diaIdsParaAsignar, plantillaId);

        // Actualizar el estado local
        setDiasHabilitados(prev =>
            prev.map(dia => {
                const actualizado = diasActualizados.find(d => d.id === dia.id);
                return actualizado ? actualizado : dia;
            })
        );
        setDiasSeleccionados(new Set());
    };

    const handleGenerarSlots = async () => {
        alert("Generando Slots... esto puede tardar.");
        const res = await generarSlots(calendarioId);
        alert(res.message);
    };

    const handleResolver = async () => {
        alert("Generando Turnos... llamando a OptaPlanner. Esto tardará más.");
        const res = await resolverTurnos(calendarioId);
        alert(res.message);
        // TODO: Redirigir a la vista de "Ver"
        // navigate(`/calendarios/${calendarioId}/ver`);
    };

    if (isLoading) return <div className="p-4">Cargando configuración...</div>;
    if (!calendario) return <div className="p-4 text-danger">Error: Calendario no encontrado.</div>;

    const todosLosDiasDelMes = getDiasDelMes(calendario.fechaInicio, calendario.fechaFin);

    return (
        <div className="container-fluid mt-4">
            <h1 className="h2 mb-4">Configurar: {calendario.nombre}</h1>

            <ConfiguracionToolbar
                plantillas={plantillas}
                onHabilitar={handleHabilitar}
                onAsignar={handleAsignar}
                onGenerarSlots={handleGenerarSlots}
                onResolver={handleResolver}
                seleccionCount={diasSeleccionados.size}
            />

            <CalendarioGrid
                diasDelMes={todosLosDiasDelMes}
                diasHabilitados={diasHabilitados} // { id, fecha, plantillaId }
                plantillas={plantillas} // Para buscar nombres { id, nombre }
                diasSeleccionados={diasSeleccionados} // Set de fechas
                onToggleDia={handleToggleDia}
            />
        </div>
    );
}