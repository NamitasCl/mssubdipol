import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { Card, Container, Row, Col, Form, Button, Badge, Alert, Spinner, Table } from "react-bootstrap";
import axios from "axios";

const rolesDisponibles = [
    { value: "ROLE_JEFE", label: "Jefe de Unidad" },
    { value: "ROLE_SUBJEFE", label: "Subjefe de Unidad" },
    { value: "ROLE_ADMINISTRADOR", label: "Administrador del Sistema" },
    { value: "ROLE_SECUIN", label: "Encargado de Turnos (SECUIN)" },
];

export default function Admin() {
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [funcionariosConRoles, setFuncionariosConRoles] = useState([]);

    const loadFuncionarios = async (inputValue, callback) => {
        if (inputValue.length < 2) return callback([]);
        try {
            const res = await axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/search`, {
                params: { term: inputValue },
            });
            const options = res.data.map((f) => ({
                label: f.nombreCompleto,
                value: f.idFun,
                funcionario: f,
            }));
            callback(options);
        } catch (error) {
            callback([]);
        }
    };

    const fetchFuncionariosConRoles = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_AUTH_API_URL}/asignados`);
            setFuncionariosConRoles(res.data);
        } catch (err) {
            console.error("Error al obtener funcionarios con roles:", err);
        }
    };

    useEffect(() => {
        fetchFuncionariosConRoles();
    }, []);

    const handleGuardar = async () => {
        if (!selectedFuncionario || selectedRoles.length === 0) {
            setMensaje("Debes seleccionar un funcionario y al menos un rol.");
            return;
        }
        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_AUTH_API_URL}/modificar`, {
                idFun: selectedFuncionario.value,
                roles: selectedRoles.map((r) => r.value),
            });
            setMensaje("Roles asignados correctamente.");
            fetchFuncionariosConRoles();
        } catch (err) {
            setMensaje("Error al asignar roles.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuitarRoles = async () => {
        if (!selectedFuncionario) {
            setMensaje("Debes seleccionar un funcionario para quitarle los roles.");
            return;
        }
        try {
            setLoading(true);
            console.log("Seleccionado:", selectedFuncionario);
            console.log("Quitar roles de:", selectedFuncionario.value);
            await axios.post(`${import.meta.env.VITE_AUTH_API_URL}/modificar`, {
                idFun: selectedFuncionario.value,
                roles: ["ROLE_FUNCIONARIO"],
            });
            setSelectedRoles([]);
            setMensaje("Roles eliminados. Funcionario vuelve a ser básico.");
            fetchFuncionariosConRoles();
        } catch (err) {
            setMensaje("Error al quitar roles.");
        } finally {
            setLoading(false);
        }
    };

    const filtrados = funcionariosConRoles.filter(f =>
        f.roles.some(r => ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_SECUIN", "ROLE_ADMINISTRADOR"].includes(r))
    );

    return (
        <Container className="mt-4">
            <h3 className="mb-4">Administración de Roles</h3>
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Buscar Funcionario</Form.Label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadFuncionarios}
                                onChange={setSelectedFuncionario}
                                value={selectedFuncionario}
                                isClearable
                                placeholder="Nombre del funcionario..."
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Asignar Roles</Form.Label>
                            <Form.Select
                                multiple
                                value={selectedRoles.map((r) => r.value)}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions).map((opt) =>
                                        rolesDisponibles.find((r) => r.value === opt.value)
                                    );
                                    setSelectedRoles(selected);
                                }}
                            >
                                {rolesDisponibles.map((rol) => (
                                    <option key={rol.value} value={rol.value}>{rol.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2">
                        <Button variant="primary" onClick={handleGuardar} disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Guardar Roles"}
                        </Button>
                        <Button variant="outline-danger" onClick={handleQuitarRoles} disabled={loading || !selectedFuncionario}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Quitar Roles y Reestablecer"}
                        </Button>
                    </div>

                    {mensaje && <Alert className="mt-3" variant="info">{mensaje}</Alert>}
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Header className="bg-light">
                    <strong>Funcionarios con roles especiales (Jefe, Subjefe, Secuin)</strong>
                </Card.Header>
                <Card.Body>
                    {filtrados.length === 0 ? (
                        <p className="text-muted">No hay funcionarios con esos roles actualmente.</p>
                    ) : (
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Roles Asignados</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtrados.map((f, i) => (
                                <tr key={i}>
                                    <td>{f.nombreCompleto}</td>
                                    <td>{f.roles.join(", ")}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}