import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuth } from "./AuthContext";
import {
    Row,
    Col,
    Card,
    Button,
    Alert,
    Spinner,
    Form
} from "react-bootstrap";
import { FaUserShield, FaUserMinus } from "react-icons/fa";

export function Jefe() {
    const { user } = useAuth();
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [subjefeActual, setSubjefeActual] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    const fetchSubjefeActual = async () => {
        if (!user?.siglasUnidad) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_AUTH_API_URL}/subjefe/${user.siglasUnidad}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
            setSubjefeActual({
                label: `${res.data.nombre} ${res.data.apellidoPaterno} ${res.data.apellidoMaterno}`,
                value: res.data.idFun,
            });
        } catch {
            setSubjefeActual(null);
        }
    };

    useEffect(() => {
        fetchSubjefeActual();
    }, [user]);

    const loadFuncionarios = async (inputValue, callback) => {
        if (!user?.siglasUnidad) return callback([]);

        try {
            const res = await axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/porunidad`, {
                params: {
                    unidad: user.siglasUnidad,
                    term: inputValue
                },
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            const opciones = res.data.map(funcionario => ({
                label: `${funcionario.nombreFun} ${funcionario.apellidoPaternoFun} ${funcionario.apellidoMaternoFun}`,
                value: funcionario.idFun,
                username: funcionario.username
            }));

            callback(opciones);
        } catch (err) {
            console.error("Error al buscar funcionarios:", err);
            callback([]);
        }
    };

    const handleGuardar = async () => {
        if (!selectedFuncionario) {
            setMensaje("Debes seleccionar un funcionario para asignarlo como Subjefe.");
            return;
        }

        console.log("Selected Funcionario:", selectedFuncionario);

        try {
            setCargando(true);
            await axios.post(
                `${import.meta.env.VITE_AUTH_API_URL}/modificar`,
                {
                    idFun: selectedFuncionario.value,
                    roles: ["ROLE_SUBJEFE"]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMensaje("Subjefe asignado correctamente.");
            fetchSubjefeActual();
        } catch (err) {
            console.error(err);
            setMensaje("Error al asignar el rol.");
        } finally {
            setCargando(false);
        }
    };

    const handleQuitar = async () => {
        if (!subjefeActual) {
            setMensaje("No hay subjefe asignado.");
            return;
        }

        try {
            setCargando(true);
            await axios.post(`${import.meta.env.VITE_AUTH_API_URL}/modificar`,
                {
                    idFun: subjefeActual.value,
                    roles: ["ROLE_FUNCIONARIO"]
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            setMensaje("Subjefe eliminado correctamente.");
            fetchSubjefeActual();
            setSelectedFuncionario(null);
        } catch (err) {
            console.error(err);
            setMensaje("Error al quitar el rol.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-3">
            <Card className="shadow-sm rounded-4">
                <Card.Body>
                    <h5 className="fw-bold mb-2">Administrar Subjefe de Unidad</h5>
                    <p className="text-muted mb-4">
                        Unidad actual: <strong>{user?.siglasUnidad}</strong>
                    </p>

                    {subjefeActual ? (
                        <Alert variant="success">
                            Subjefe actual asignado: <strong>{subjefeActual.label}</strong>
                        </Alert>
                    ) : (
                        <Alert variant="warning" className="text-center">
                            No hay subjefe asignado actualmente.
                        </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Seleccionar funcionario</Form.Label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadFuncionarios}
                            onChange={setSelectedFuncionario}
                            value={selectedFuncionario}
                            isClearable
                            placeholder="Buscar funcionario para asignar como Subjefe..."
                        />
                    </Form.Group>

                    <Row className="mt-3">
                        <Col md="auto">
                            <Button onClick={handleGuardar} disabled={cargando} className="rounded-pill px-4">
                                {cargando ? <Spinner size="sm" /> : <><FaUserShield className="me-2" />Asignar Subjefe</>}
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button variant="outline-danger" onClick={handleQuitar} disabled={cargando} className="rounded-pill px-4">
                                {cargando ? <Spinner size="sm" /> : <><FaUserMinus className="me-2" />Quitar Subjefe</>}
                            </Button>
                        </Col>
                    </Row>

                    {mensaje && (
                        <Alert className="mt-4" variant="info">
                            {mensaje}
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}