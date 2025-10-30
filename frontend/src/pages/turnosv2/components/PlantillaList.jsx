// src/components/PlantillaList.jsx

export default function PlantillaList({plantillas, onEdit, onDelete}) {
    return (
        <div className="card shadow-sm">
            <table className="table table-hover mb-0">
                <thead className="table-light">
                <tr>
                    <th scope="col" className="px-3">Nombre</th>
                    <th scope="col" className="text-end px-3">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {plantillas.length === 0 ? (
                    <tr>
                        <td colSpan="2" className="text-center text-muted p-4">
                            No hay plantillas creadas.
                        </td>
                    </tr>
                ) : (
                    plantillas.map((plantilla) => (
                        <tr key={plantilla.id}>
                            <td className="px-3 align-middle">
                                {plantilla.nombre}
                            </td>
                            <td className="text-end px-3">
                                <button
                                    onClick={() => onEdit(plantilla)}
                                    className="btn btn-outline-primary btn-sm me-2"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete(plantilla.id)}
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}