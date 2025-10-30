// src/components/Configuracion/ConfiguracionToolbar.jsx
import {useState} from 'react';

export default function ConfiguracionToolbar({
                                                 plantillas,
                                                 onHabilitar,
                                                 onAsignar,
                                                 onGenerarSlots,
                                                 onResolver,
                                                 seleccionCount
                                             }) {
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');

    const handleAsignarClick = () => {
        if (!plantillaSeleccionada) {
            alert("Por favor, seleccione una plantilla primero.");
            return;
        }
        onAsignar(parseInt(plantillaSeleccionada));
    };

    return (
        <div className="card shadow-sm mb-3">
            <div className="card-body">
                <div className="row g-2 align-items-center">

                    {/* Col 1: Habilitar Días */}
                    <div className="col-12 col-md-3">
                        <div className="d-grid gap-2">
                            <button
                                onClick={onHabilitar}
                                disabled={seleccionCount === 0}
                                className="btn btn-success"
                            >
                                Habilitar {seleccionCount > 0 ? `(${seleccionCount})` : ''} Días
                            </button>
                        </div>
                    </div>

                    {/* Col 2: Asignar Plantilla */}
                    <div className="col-12 col-md-5">
                        <div className="input-group">
                            <select
                                value={plantillaSeleccionada}
                                onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                                className="form-select"
                            >
                                <option value="" disabled>Seleccionar plantilla...</option>
                                {plantillas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAsignarClick}
                                disabled={seleccionCount === 0 || !plantillaSeleccionada}
                                className="btn btn-primary"
                            >
                                Asignar {seleccionCount > 0 ? `(${seleccionCount})` : ''}
                            </button>
                        </div>
                    </div>

                    {/* Col 3: Botones Mágicos */}
                    <div className="col-12 col-md-4">
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button
                                onClick={onGenerarSlots}
                                className="btn btn-outline-secondary"
                            >
                                1. Generar Slots
                            </button>
                            <button
                                onClick={onResolver}
                                className="btn btn-danger"
                            >
                                2. Generar Turnos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}