import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Spinner, Alert } from "react-bootstrap";
import { listarFuncionariosAportados, eliminarFuncionarioAportado } from "../../api/funcionariosAporteApi";

export default function ListaFuncionariosAportados({ show, onHide, calendarioId, idUnidad }) {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarFuncionarios = () => {
        setLoading(true);
        listarFuncionariosAportados(calendarioId, idUnidad)
            .then(data => {
                setFuncionarios(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar funcionarios");
                setLoading(false);
            });
    };

    useEffect(() => {
        if (show) cargarFuncionarios();
        // eslint-disable-next-line
    }, [show]);

    const handleEliminar = (id) => {
        if (!window.confirm("¿Seguro que deseas quitar este funcionario del aporte?")) return;
        setLoading(true);
        // El backend espera el usuario en header. Adaptar según tu AuthContext.
        const usuario = localStorage.getItem("usuario") || 1; // O usa tu contexto
        eliminarFuncionarioAportado(id, usuario)
            .then(() => cargarFuncionarios())
            .catch(() => {
                setError("No se pudo eliminar");
                setLoading(false);
            });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Funcionarios Aportados</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && <Spinner />}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && (
                    <>
                        {funcionarios.length === 0 ? (
                            <Alert variant="info">No hay funcionarios aportados todavía.</Alert>
                        ) : (
                            <Table striped bordered>
                                <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {funcionarios.map(f => (
                                    <tr key={f.id}>
                                        <td>{f.nombreCompleto || f.nombre}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleEliminar(f.id)}
                                            >
                                                Quitar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}