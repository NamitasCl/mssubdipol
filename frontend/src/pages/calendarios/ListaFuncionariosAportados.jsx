import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Spinner, Alert } from "react-bootstrap";
import { listarFuncionariosAportados, eliminarFuncionarioAportado } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import {listarFuncionariosAportadosPaginado} from "../../api/diasNoDisponiblesGlobalesApi.js";

export default function ListaFuncionariosAportados({ show, onHide, calendarioId, idUnidad }) {
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarFuncionarios = (paginaSolicitada = 0) => {
        setLoading(true);
        listarFuncionariosAportadosPaginado(calendarioId, idUnidad, paginaSolicitada)
            .then(data => {
                setFuncionarios(data.content);
                setPagina(data.number);
                setTotalPaginas(data.totalPages);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar funcionarios");
                setLoading(false);
            });
    };

    useEffect(() => {
        if (show) cargarFuncionarios();
    }, [show]);

    const handleEliminar = (id) => {
        if (!window.confirm("¿Seguro que deseas quitar este funcionario del aporte?")) return;
        setLoading(true);
        eliminarFuncionarioAportado(id, user.idFuncionario)
            .then(() => cargarFuncionarios(pagina)) // recargar misma página
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
                            <>
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
                                            <td>{f.nombreCompleto}</td>
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

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => cargarFuncionarios(pagina - 1)}
                                        disabled={pagina === 0}
                                    >
                                        Anterior
                                    </Button>
                                    <span>Página {pagina + 1} de {totalPaginas}</span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => cargarFuncionarios(pagina + 1)}
                                        disabled={pagina + 1 >= totalPaginas}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </>
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