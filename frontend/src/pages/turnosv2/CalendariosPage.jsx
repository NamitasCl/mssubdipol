// src/pages/CalendariosPage.jsx
import {useEffect, useState} from 'react';
import {createCalendario, getCalendarios} from '../../api/mockApi';
import CalendarioList from './components/CalendarioList';
import CalendarioForm from './components/CalendarioForm';
// import { useNavigate } from 'react-router-dom'; // Descomentar si usas react-router

export default function CalendariosPage() {
    const [calendarios, setCalendarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const navigate = useNavigate(); // Para redirigir

    useEffect(() => {
        async function fetchCalendarios() {
            try {
                setIsLoading(true);
                const data = await getCalendarios();
                setCalendarios(data);
            } catch (err) {
                setError("Error al cargar calendarios");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCalendarios();
    }, []);

    const handleOpenCreate = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async (calendarioData) => {
        try {
            const created = await createCalendario(calendarioData);
            setCalendarios([...calendarios, created]);
            handleCloseModal();
            // Redirigir a la página de configuración
            // navigate(`/calendarios/${created.id}/configurar`);
            alert(`Calendario "${created.nombre}" creado. Redirigiendo a configuración...`);
        } catch (err) {
            console.error("Error al guardar:", err);
        }
    };

    if (isLoading) return <div className="p-4">Cargando...</div>;
    if (error) return <div className="p-4 text-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">Dashboard de Calendarios</h1>
                <button
                    onClick={handleOpenCreate}
                    className="btn btn-primary"
                >
                    Nuevo Calendario
                </button>
            </div>

            <CalendarioList
                calendarios={calendarios}
            />

            {isModalOpen && (
                <CalendarioForm
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}