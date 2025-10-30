// src/components/PlantillaForm.jsx
import {useEffect, useState} from 'react';
import {getRolesServicio} from '../../../api/mockApi';

const BLANK_REQUERIMIENTO = {rol: '', cantidad: 1};
const BLANK_PLANTILLA = {
    nombre: '',
    requerimientos: [{...BLANK_REQUERIMIENTO}]
};

export default function PlantillaForm({initialData, onSave, onClose}) {
    const [formData, setFormData] = useState(initialData ? {...initialData} : BLANK_PLANTILLA);
    const [roles, setRoles] = useState([]);

    // Cargar los roles (lógica sin cambios)
    useEffect(() => {
        getRolesServicio().then(setRoles);
    }, []);

    // --- Handlers del Formulario (lógica sin cambios) ---
    const handleNombreChange = (e) => {
        setFormData({...formData, nombre: e.target.value});
    };

    const handleReqChange = (index, field, value) => {
        const nuevosRequerimientos = [...formData.requerimientos];
        nuevosRequerimientos[index][field] = value;
        if (field === 'cantidad') {
            nuevosRequerimientos[index][field] = parseInt(value, 10) || 1;
        }
        setFormData({...formData, requerimientos: nuevosRequerimientos});
    };

    const handleAddReq = () => {
        setFormData({
            ...formData,
            requerimientos: [...formData.requerimientos, {...BLANK_REQUERIMIENTO}]
        });
    };

    const handleRemoveReq = (index) => {
        const nuevosRequerimientos = formData.requerimientos.filter((_, i) => i !== index);
        setFormData({...formData, requerimientos: nuevosRequerimientos});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            alert("El nombre es requerido");
            return;
        }
        onSave(formData);
    };

    return (
        // Fondo del Modal (Overlay)
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>

            {/* Contenedor del Modal */}
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>

                        {/* Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {initialData ? 'Editar' : 'Crear'} Plantilla
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Nombre */}
                            <div className="mb-3">
                                <label htmlFor="plantillaNombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    id="plantillaNombre"
                                    value={formData.nombre}
                                    onChange={handleNombreChange}
                                    className="form-control"
                                    required
                                />
                            </div>

                            {/* Requerimientos Dinámicos */}
                            <div className="mb-3">
                                <label className="form-label">Requerimientos</label>
                                {formData.requerimientos.map((req, index) => (
                                    <div key={index} className="input-group mb-2">
                                        <select
                                            value={req.rol}
                                            onChange={(e) => handleReqChange(index, 'rol', e.target.value)}
                                            className="form-select"
                                            required
                                        >
                                            <option value="" disabled>Seleccione un rol...</option>
                                            {roles.map(rol => (
                                                <option key={rol} value={rol}>{rol}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            value={req.cantidad}
                                            onChange={(e) => handleReqChange(index, 'cantidad', e.target.value)}
                                            className="form-control"
                                            style={{flex: '0 0 25%'}} // Ancho fijo
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveReq(index)}
                                            className="btn btn-outline-danger"
                                            disabled={formData.requerimientos.length <= 1}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddReq}
                                    className="btn btn-link btn-sm p-0"
                                >
                                    + Añadir Requerimiento
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Guardar
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}