// src/components/CalendarioForm.jsx
import {useEffect, useState} from 'react';
import {getUnidades} from '../../../api/mockApi';

export default function CalendarioForm({onSave, onClose}) {
    const [nombre, setNombre] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [unidades, setUnidades] = useState([]); // Lista de todas las unidades
    const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]); // IDs [1, 2]

    useEffect(() => {
        getUnidades().then(setUnidades);
    }, []);

    const handleUnidadChange = (id) => {
        setUnidadesSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            nombre,
            fechaInicio,
            fechaFin,
            unidadParticipantes: unidadesSeleccionadas
        });
    };

    return (
        // Fondo del Modal (Overlay)
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>

                        <div className="modal-header">
                            <h5 className="modal-title">Crear Nuevo Calendario</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="calNombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    id="calNombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="row g-2 mb-3">
                                <div className="col">
                                    <label htmlFor="calInicio" className="form-label">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        id="calInicio"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="col">
                                    <label htmlFor="calFin" className="form-label">Fecha Fin</label>
                                    <input
                                        type="date"
                                        id="calFin"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Unidades Participantes</label>
                                <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                    {unidades.map(u => (
                                        <div key={u.id} className="form-check">
                                            <input
                                                type="checkbox"
                                                id={`unidad-${u.id}`}
                                                checked={unidadesSeleccionadas.includes(u.id)}
                                                onChange={() => handleUnidadChange(u.id)}
                                                className="form-check-input"
                                            />
                                            <label htmlFor={`unidad-${u.id}`} className="form-check-label">
                                                {u.nombre} ({u.siglas})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" onClick={onClose} className="btn btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Crear y Configurar
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}