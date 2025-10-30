// src/components/Visualizacion/VistaPorDia.jsx
import {format} from 'date-fns';
import {es} from 'date-fns/locale';

// Helper para formatear nombre
const getNombreCompleto = (func) => {
    return `${func.nombres} ${func.apellidoPaterno} (${func.grado})`;
};

export default function VistaPorDia({fecha, asignaciones}) {

    // Formatear la fecha para que sea legible
    const fechaObj = new Date(fecha + "T00:00:00");
    const fechaFormateada = format(fechaObj, "EEEE, dd 'de' MMMM 'de' yyyy", {locale: es});

    return (
        <div className="card shadow-sm">
            {/* Encabezado del Día */}
            <div className="card-header">
                <h2 className="h5 mb-0 text-capitalize">{fechaFormateada}</h2>
            </div>

            {/* Lista de Asignaciones */}
            <ul className="list-group list-group-flush">
                {asignaciones.map(asig => (
                    <li key={asig.id}
                        className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                        {/* Rol */}
                        <div className="mb-2 mb-md-0">
                            <span className="badge bg-primary-subtle text-primary-emphasis fs-6">
                                {asig.slot.rolRequerido}
                            </span>
                        </div>

                        {/* Funcionario */}
                        <div className="text-md-end">
                            <span className="fw-medium">
                                {asig.funcionario ?
                                    getNombreCompleto(asig.funcionario) :
                                    <span className="text-danger">SIN ASIGNAR</span>
                                }
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}