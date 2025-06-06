import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import {useAuth} from "../../components/contexts/AuthContext.jsx";

// Estado inicial del formulario
const initialForm = {
    regionPolicial: '',
    brigada: '',
    nombreServicio: '',
    fechaHoraInicio: '',
    fechaHoraTermino: '',
    siglaCarro: '',
    esCorporativo: false,
    idJefeMaquina: null,
    telefonoJefeMaquina: ''
};

const FormularioServicioEspecialModal = ({ show, onHide, onSuccess }) => {
    const {user} = useAuth();
    const [form, setForm] = useState(initialForm);
    const [jefeMaquina, setJefeMaquina] = useState(null);
    const [nombreUnidad, setNombreUnidad] = useState(null)
    const [regionPolicial, setRegionPolicial] = useState(null)
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);

    // --- LOADERS ---
    // Buscar funcionarios
    const loadFuncionarios = async (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            callback([]);
            return;
        }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/search?term=${encodeURIComponent(inputValue)}`);
            const options = data.map(f => ({
                value: f.idFun,
                label: `${f.nombreCompleto} (${f.siglasCargo})`,
                data: f
            }));
            callback(options);
        } catch (e) {
            callback([]);
        }
    };

    // Buscar unidades
    const loadUnidades = async (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            callback([]);
            return;
        }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar?nombre=${encodeURIComponent(inputValue)}`);
            const options = data.map(f => ({
                value: f.idUnidad,
                label: `${f.nombreUnidad}`,
                data: f
            }));
            callback(options);
        } catch (e) {
            callback([]);
        }
    };

    // Buscar regiones policiales únicas
    const loadRegionesPoliciales = async (inputValue, callback) => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/regiones-policiales`
            );
            const filtered = inputValue && inputValue.length > 0
                ? data.filter(region =>
                    region.toLowerCase().includes(inputValue.toLowerCase())
                )
                : data;
            const options = filtered.map(region => ({
                value: region,
                label: region,
            }));
            callback(options);
        } catch (e) {
            callback([]);
        }
    };

    // --- HANDLERS ---
    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setMsg(null);
        setLoading(true);
        try {
            const payload = {
                ...form,
                regionPolicial: regionPolicial ? regionPolicial.value : '',
                brigada: nombreUnidad ? nombreUnidad.label : '',
                idJefeMaquina: jefeMaquina ? jefeMaquina.value : null,
            };
            await axios.post(`${import.meta.env.VITE_FORMS_API_URL}/servicio-especial`, payload, {headers: { Authorization: `Bearer ${user.token}` }});
            setMsg('Formulario registrado correctamente.');
            setForm(initialForm);
            setJefeMaquina(null);
            setNombreUnidad(null);
            setRegionPolicial(null);
            if (onSuccess) onSuccess();
            if (onHide) onHide();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar el formulario');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm(initialForm);
        setJefeMaquina(null);
        setNombreUnidad(null);
        setRegionPolicial(null);
        setMsg(null);
        setError(null);
        if (onHide) onHide();
    };

    // --- RENDER ---
    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Registrar Servicio Especial</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {msg && <Alert variant="success">{msg}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {/* Región Policial y Brigada */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Región Policial</Form.Label>
                                <AsyncSelect
                                    cacheOptions
                                    loadOptions={loadRegionesPoliciales}
                                    defaultOptions={false}
                                    value={regionPolicial}
                                    onChange={setRegionPolicial}
                                    placeholder="Buscar Región Policial por nombre..."
                                    isClearable
                                    noOptionsMessage={() => "Ingrese al menos 3 letras"}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Brigada</Form.Label>
                                <AsyncSelect
                                    cacheOptions
                                    loadOptions={loadUnidades}
                                    defaultOptions={false}
                                    value={nombreUnidad}
                                    onChange={setNombreUnidad}
                                    placeholder="Buscar unidades por nombre..."
                                    isClearable
                                    noOptionsMessage={() => "Ingrese al menos 3 letras"}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Nombre del servicio */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre Servicio</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombreServicio"
                            value={form.nombreServicio}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    {/* Fechas */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha y Hora Inicio</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="fechaHoraInicio"
                                    value={form.fechaHoraInicio}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha y Hora Término</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="fechaHoraTermino"
                                    value={form.fechaHoraTermino}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Sigla Carro y es corporativo */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Sigla Carro</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="siglaCarro"
                                    value={form.siglaCarro}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>¿Es Corporativo?</Form.Label>
                                <div>
                                    <Form.Check
                                        type="checkbox"
                                        name="esCorporativo"
                                        label="Sí"
                                        checked={form.esCorporativo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Jefe de Máquina */}
                    <Form.Group className="mb-3">
                        <Form.Label>Jefe de Máquina</Form.Label>
                        <AsyncSelect
                            cacheOptions
                            loadOptions={loadFuncionarios}
                            defaultOptions={false}
                            value={jefeMaquina}
                            onChange={setJefeMaquina}
                            placeholder="Buscar funcionario por nombre..."
                            isClearable
                            noOptionsMessage={() => "Ingrese al menos 3 letras"}
                            required
                        />
                    </Form.Group>
                    {/* Teléfono jefe máquina */}
                    <Form.Group className="mb-4">
                        <Form.Label>Teléfono Jefe de Máquina</Form.Label>
                        <Form.Control
                            type="text"
                            name="telefonoJefeMaquina"
                            value={form.telefonoJefeMaquina}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button
                            type="submit"
                            variant="primary"
                            className="px-4"
                            disabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : 'Registrar'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default FormularioServicioEspecialModal;