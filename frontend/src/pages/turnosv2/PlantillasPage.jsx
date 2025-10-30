// src/pages/PlantillasPage.jsx
import {useEffect, useState} from 'react';
import {createPlantilla, deletePlantilla, getPlantillas, updatePlantilla} from '../../api/mockApi';
import PlantillaList from './components/PlantillaList';
import PlantillaForm from './components/PlantillaForm';

export default function PlantillasPage() {
    const [plantillas, setPlantillas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

    // Cargar plantillas (lógica sin cambios)
    useEffect(() => {
        async function fetchPlantillas() {
            try {
                setIsLoading(true);
                const data = await getPlantillas();
                setPlantillas(data);
            } catch (err) {
                setError("Error al cargar plantillas");
            } finally {
                setIsLoading(false);
            }
        }

        fetchPlantillas();
    }, []);

    // --- Handlers para el Modal (lógica sin cambios) ---
    const handleOpenCreate = () => {
        setPlantillaSeleccionada(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (plantilla) => {
        setPlantillaSeleccionada(plantilla);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPlantillaSeleccionada(null);
    };

    // --- Handlers CRUD (lógica sin cambios) ---
    const handleSave = async (plantillaData) => {
        try {
            if (plantillaData.id) {
                const updated = await updatePlantilla(plantillaData);
                setPlantillas(plantillas.map(p => (p.id === updated.id ? updated : p)));
            } else {
                const created = await createPlantilla(plantillaData);
                setPlantillas([...plantillas, created]);
            }
            handleCloseModal();
        } catch (err) {
            console.error("Error al guardar:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta plantilla?")) {
            try {
                await deletePlantilla(id);
                setPlantillas(plantillas.filter(p => p.id !== id));
            } catch (err) {
                console.error("Error al eliminar:", err);
            }
        }
    };

    // --- Renderizado con Bootstrap ---
    if (isLoading) return <div className="p-4">Cargando...</div>;
    if (error) return <div className="p-4 text-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">Gestión de Plantillas</h1>
                <button
                    onClick={handleOpenCreate}
                    className="btn btn-primary" // Clase Bootstrap
                >
                    Nueva Plantilla
                </button>
            </div>

            <PlantillaList
                plantillas={plantillas}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
            />

            {/* El Modal del Formulario */}
            {isModalOpen && (
                <PlantillaForm
                    key={plantillaSeleccionada ? plantillaSeleccionada.id : 'nuevo'}
                    initialData={plantillaSeleccionada}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}