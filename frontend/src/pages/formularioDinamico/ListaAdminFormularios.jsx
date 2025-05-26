import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner, Modal } from "react-bootstrap";
import { useAuth } from "../../AuthContext.jsx";
import CrearEditarFormularioDinamico from "./CrearEditarFormularioDinamico.jsx"; // este lo creamos abajo

const doradoPDI = "#303030";

export default function ListaAdminFormularios() {
    const { user } = useAuth();
    const [formularios, setFormularios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formularioEdit, setFormularioEdit] = useState(null);

    const cargarFormularios = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Respuesta formularios: ", resp.data)
            setFormularios(resp.data);
        } catch {
            setFormularios([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarFormularios();
    }, []);

    // Eliminar formulario
    const eliminarFormulario = async (formulario) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el formulario "${formulario.nombre}"? Esta acción no se puede deshacer y eliminará todos los registros asociados a este formulario, no pudiendo ser recuperados.`)) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formulario.id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            cargarFormularios();
        } catch (err) {
            alert("Error al eliminar el formulario.");
        }
    };

// Inhabilitar/habilitar formulario (toggle)
    const toggleFormularioActivo = async (formulario) => {
        const nuevoEstado = !formulario.activo;
        const accion = nuevoEstado ? "habilitar" : "inhabilitar";
        if (!window.confirm(`¿Seguro que deseas ${accion} el formulario "${formulario.nombre}"?`)) return;
        try {
            await axios.put(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formulario.id}/estado`,
                { activo: nuevoEstado },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            cargarFormularios();
        } catch (err) {
            alert("Error al cambiar el estado del formulario.");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 style={{ color: "#FFC700", borderLeft: "5px solid #FFC700", paddingLeft: 12 }}>Formularios Disponibles</h4>
                <Button variant="warning" style={{ color: "#17355A", borderRadius: "1.2rem", fontWeight: 700 }}
                        onClick={() => { setFormularioEdit(null); setShowModal(true); }}>
                    Crear nuevo formulario
                </Button>
            </div>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover responsive
                       style={{
                           background: "rgba(34,41,56,0.97)",
                           borderRadius: "0.6rem",
                           overflow: "hidden",
                           border: `2px solid ${doradoPDI}`
                       }}>
                    <thead>
                    <tr style={{ background: doradoPDI, color: "#17355A" }}>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {formularios.map((f, i) => (
                        <tr key={f.id}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: 600, color: doradoPDI }}>{f.nombre}</td>
                            <td style={{ color: "#191b1d" }}>{f.descripcion}</td>
                            <td>{f.activo ? "Activo" : "Inactivo"}</td>
                            <td>
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    className="me-2"
                                    style={{ color: doradoPDI, borderColor: doradoPDI, borderRadius: "1rem" }}
                                    onClick={() => { setFormularioEdit(f); setShowModal(true); }}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant={f.activo ? "outline-secondary" : "outline-success"}
                                    size="sm"
                                    className="me-2"
                                    style={{ borderRadius: "1rem" }}
                                    onClick={() => toggleFormularioActivo(f)}
                                >
                                    {f.activo ? "Inhabilitar" : "Habilitar"}
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    style={{ borderRadius: "1rem" }}
                                    onClick={() => eliminarFormulario(f)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Body className="p-0" style={{ background: "transparent" }}>
                    <CrearEditarFormularioDinamico
                        user={user}
                        formulario={formularioEdit}
                        onSuccess={() => { setShowModal(false); cargarFormularios(); }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}