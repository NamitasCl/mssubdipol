import React, { useState, useEffect, useCallback, useMemo } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import {
    Card, Container, Row, Col, Form, Button, Alert, Spinner, Table, Modal, InputGroup
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    buscarFuncionarios,
    obtenerFuncionariosConRoles,
    asignarRoles,
    quitarRoles,
    quitarRolesMultiple,
} from "../../api/authApi.js";

const rolesDisponibles = [
    { value: "ROLE_JEFE", label: "Jefe de Unidad" },
    { value: "ROLE_SUBJEFE", label: "Subjefe de Unidad" },
    { value: "ROLE_ADMINISTRADOR", label: "Administrador del Sistema" },
    { value: "ROLE_TURNOS", label: "Asignado para hacer turnos en complejo" },
    { value: "ROLE_TURNOS_RONDA", label: "Permite generar turnos de ronda" },
];

const rolesLabelByValue = Object.fromEntries(rolesDisponibles.map(r => [r.value, r.label]));
const ROLES_ESPECIALES = ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_SECUIN", "ROLE_ADMINISTRADOR"];

export default function Admin() {
    const navigate = useNavigate();

    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]); // [{value,label}]
    const [mensaje, setMensaje] = useState(null); // {text, variant}
    const [busy, setBusy] = useState(false);         // POST individual
    const [bulkBusy, setBulkBusy] = useState(false); // POST masivo
    const [loadingTabla, setLoadingTabla] = useState(false);
    const [funcionariosConRoles, setFuncionariosConRoles] = useState([]);

    const [filtroTabla, setFiltroTabla] = useState("");
    const [showConfirmQuitar, setShowConfirmQuitar] = useState(false);       // individual
    const [showConfirmQuitarBulk, setShowConfirmQuitarBulk] = useState(false); // masivo

    // selección múltiple en tabla
    const [selectedRowIds, setSelectedRowIds] = useState(new Set()); // ids (o índices) de seleccionados
    const [selectAll, setSelectAll] = useState(false);

    const notify = (text, variant = "info") => {
        setMensaje({ text, variant });
        setTimeout(() => setMensaje(null), 4000);
    };

    // cargar tabla
    const fetchFuncionariosConRoles = useCallback(async () => {
        try {
            setLoadingTabla(true);
            const data = await obtenerFuncionariosConRoles();
            setFuncionariosConRoles(Array.isArray(data) ? data : []);
            // al recargar, limpiamos selección
            setSelectedRowIds(new Set());
            setSelectAll(false);
        } catch (err) {
            console.error("Error al obtener funcionarios con roles:", err);
            notify("No se pudieron cargar los funcionarios con roles.", "danger");
        } finally {
            setLoadingTabla(false);
        }
    }, []);

    useEffect(() => {
        fetchFuncionariosConRoles();
    }, [fetchFuncionariosConRoles]);

    // búsqueda para AsyncSelect
    const loadFuncionarios = async (inputValue) => {
        try {
            return await buscarFuncionarios(inputValue);
        } catch {
            return [];
        }
    };

    // acciones individuales
    const handleGuardar = async () => {
        if (!selectedFuncionario || selectedRoles.length === 0) {
            notify("Debes seleccionar un funcionario y al menos un rol.", "warning");
            return;
        }
        try {
            setBusy(true);
            await asignarRoles(
                selectedFuncionario.value,
                selectedRoles.map((r) => r.value)
            );
            notify("Roles asignados correctamente.", "success");
            await fetchFuncionariosConRoles();
        } catch (err) {
            console.error(err);
            notify("Error al asignar roles.", "danger");
        } finally {
            setBusy(false);
        }
    };

    const confirmQuitarRoles = () => {
        if (!selectedFuncionario) {
            notify("Debes seleccionar un funcionario para quitarle los roles.", "warning");
            return;
        }
        setShowConfirmQuitar(true);
    };

    const handleQuitarRoles = async () => {
        try {
            setBusy(true);
            await quitarRoles(selectedFuncionario.value);
            setSelectedRoles([]);
            notify("Roles eliminados. Funcionario vuelve a ser básico.", "success");
            await fetchFuncionariosConRoles();
        } catch (err) {
            console.error(err);
            notify("Error al quitar roles.", "danger");
        } finally {
            setBusy(false);
            setShowConfirmQuitar(false);
        }
    };

    const handleClear = () => {
        setSelectedFuncionario(null);
        setSelectedRoles([]);
    };

    // derivado para la tabla + filtro
    const filtrados = useMemo(() => {
        const base = funcionariosConRoles.filter((f) =>
            f.roles?.some((r) => ROLES_ESPECIALES.includes(r))
        );
        if (!filtroTabla.trim()) return base;
        const term = filtroTabla.trim().toLowerCase();
        return base.filter((f) => f.nombreCompleto?.toLowerCase().includes(term));
    }, [funcionariosConRoles, filtroTabla]);

    // selección múltiple
    const toggleRow = (idFun) => {
        const next = new Set(selectedRowIds);
        if (next.has(idFun)) next.delete(idFun);
        else next.add(idFun);
        setSelectedRowIds(next);
        // si se desmarca alguno, apaga selectAll
        if (selectAll && next.size !== filtrados.length) setSelectAll(false);
    };

    const toggleSelectAll = () => {
        const next = !selectAll;
        setSelectAll(next);
        if (next) {
            // marcar todos los visibles (filtrados)
            setSelectedRowIds(new Set(filtrados.map((f, i) => (f.idFun ?? f.id ?? f.funcionarioId ?? i))));
        } else {
            setSelectedRowIds(new Set());
        }
    };

    // acción masiva
    const selectedIdsArray = useMemo(
        () => Array.from(selectedRowIds),
        [selectedRowIds]
    );

    const selectedNamesPreview = useMemo(() => {
        const byId = new Map(
            filtrados.map((f, i) => [f.idFun ?? f.id ?? f.funcionarioId ?? i, f.nombreCompleto])
        );
        const names = selectedIdsArray.map((id) => byId.get(id)).filter(Boolean);
        const MAX = 8;
        if (names.length <= MAX) return names.join(", ");
        return names.slice(0, MAX).join(", ") + ` y ${names.length - MAX} más…`;
    }, [filtrados, selectedIdsArray]);

    const openBulkConfirm = () => {
        if (selectedIdsArray.length === 0) {
            notify("Selecciona al menos un funcionario en la lista.", "warning");
            return;
        }
        setShowConfirmQuitarBulk(true);
    };

    const handleBulkRemove = async () => {
        try {
            setBulkBusy(true);
            const results = await quitarRolesMultiple(selectedIdsArray);
            const success = results.filter(r => r.status === "fulfilled").length;
            const failed = results.length - success;
            if (failed === 0) {
                notify(`Se restablecieron roles a ${success} funcionario(s).`, "success");
            } else if (success === 0) {
                notify(`No se pudo restablecer roles a los ${failed} seleccionados.`, "danger");
            } else {
                notify(`Listo: ${success} ok, ${failed} con error.`, "warning");
            }
            await fetchFuncionariosConRoles();
            setSelectedRowIds(new Set());
            setSelectAll(false);
        } catch (err) {
            console.error(err);
            notify("Error en la operación masiva.", "danger");
        } finally {
            setBulkBusy(false);
            setShowConfirmQuitarBulk(false);
        }
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Administración de Roles</h3>
                <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={fetchFuncionariosConRoles} disabled={loadingTabla}>
                        {loadingTabla ? <Spinner size="sm" animation="border" /> : "Actualizar"}
                    </Button>
                    <Button onClick={() => navigate("/")}>Volver al Dashboard</Button>
                </div>
            </div>

            {/* Card de asignación individual */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="gy-3">
                        <Col md={6}>
                            <Form.Label>Buscar Funcionario</Form.Label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions={false}
                                loadOptions={loadFuncionarios}
                                onChange={(opt) => {
                                    setSelectedFuncionario(opt);
                                    setSelectedRoles([]);
                                }}
                                value={selectedFuncionario}
                                isClearable
                                placeholder="Escribe al menos 2 letras…"
                                noOptionsMessage={() => "Sin resultados"}
                            />
                        </Col>

                        <Col md={6}>
                            <div className="d-flex justify-content-between align-items-center">
                                <Form.Label className="mb-0">Asignar Roles</Form.Label>
                                <small className="text-muted">
                                    {selectedRoles.length} seleccionado(s)
                                </small>
                            </div>
                            <Select
                                isMulti
                                options={rolesDisponibles}
                                value={selectedRoles}
                                onChange={setSelectedRoles}
                                placeholder="Selecciona uno o más roles…"
                                classNamePrefix="select"
                                isDisabled={!selectedFuncionario}
                            />
                            <div className="mt-2 d-flex gap-2">
                                <Button variant="outline-secondary" size="sm" onClick={handleClear}>
                                    Limpiar selección
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-3">
                        <Button variant="primary" onClick={handleGuardar} disabled={busy || !selectedFuncionario || selectedRoles.length === 0}>
                            {busy ? <Spinner size="sm" animation="border" /> : "Guardar Roles"}
                        </Button>
                        <Button
                            variant="outline-danger"
                            onClick={confirmQuitarRoles}
                            disabled={busy || !selectedFuncionario}
                        >
                            {busy ? <Spinner size="sm" animation="border" /> : "Quitar Roles y Restablecer"}
                        </Button>
                    </div>

                    {mensaje && (
                        <Alert
                            className="mt-3"
                            variant={mensaje.variant}
                            onClose={() => setMensaje(null)}
                            dismissible
                        >
                            {mensaje.text}
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Card de tabla con selección múltiple */}
            <Card className="shadow-sm">
                <Card.Header className="bg-light d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <strong>Funcionarios con roles especiales (Jefe, Subjefe, Secuin)</strong>
                        <Form.Check
                            type="checkbox"
                            id="select-all"
                            label="Seleccionar todos (lista filtrada)"
                            checked={selectAll && selectedRowIds.size === filtrados.length && filtrados.length > 0}
                            onChange={toggleSelectAll}
                            disabled={loadingTabla || filtrados.length === 0}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">{filtrados.length} resultado(s)</small>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={openBulkConfirm}
                            disabled={bulkBusy || selectedRowIds.size === 0}
                            title="Quitar roles a los seleccionados"
                        >
                            {bulkBusy ? <Spinner size="sm" animation="border" /> : `Quitar roles seleccionados (${selectedRowIds.size})`}
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>Filtrar</InputGroup.Text>
                                <Form.Control
                                    placeholder="Por nombre…"
                                    value={filtroTabla}
                                    onChange={(e) => setFiltroTabla(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {loadingTabla ? (
                        <div className="d-flex justify-content-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : filtrados.length === 0 ? (
                        <p className="text-muted m-0">No hay funcionarios con esos roles actualmente.</p>
                    ) : (
                        <Table striped bordered hover size="sm" responsive>
                            <thead>
                            <tr>
                                <th style={{ width: 44, textAlign: "center" }}>Sel.</th>
                                <th style={{ minWidth: 260 }}>Nombre</th>
                                <th>Roles Asignados</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtrados.map((f, i) => {
                                const id = f.idFuncionario ?? f.id ?? f.funcionarioId ?? i; // asegura un id único por fila
                                const checked = selectedRowIds.has(id);
                                return (
                                    <tr key={id ?? i}>
                                        <td className="text-center align-middle">
                                            <Form.Check
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleRow(id)}
                                            />
                                        </td>
                                        <td className="align-middle">{f.nombreCompleto}</td>
                                        <td className="align-middle">
                                            {f.roles.map((r, idx) => (
                                                <span key={idx} className="badge bg-secondary me-1 mb-1">
                            {rolesLabelByValue[r] || r}
                          </span>
                                            ))}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal confirmación individual */}
            <Modal show={showConfirmQuitar} onHide={() => setShowConfirmQuitar(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar restablecer roles</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFuncionario
                        ? <>Se quitarán los roles de <strong>{selectedFuncionario?.label}</strong> y quedará como <code>ROLE_FUNCIONARIO</code>. ¿Deseas continuar?</>
                        : "Debes seleccionar un funcionario."}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmQuitar(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleQuitarRoles} disabled={busy}>
                        {busy ? <Spinner size="sm" animation="border" /> : "Sí, quitar roles"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal confirmación MASIVA */}
            <Modal show={showConfirmQuitarBulk} onHide={() => setShowConfirmQuitarBulk(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Quitar roles seleccionados</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Se restablecerán los roles de <strong>{selectedIdsArray.length}</strong> funcionario(s), dejándolos como <code>ROLE_FUNCIONARIO</code>.
                    </p>
                    <p className="mb-0">
                        <small className="text-muted">Vista previa: {selectedNamesPreview || "—"}</small>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmQuitarBulk(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleBulkRemove} disabled={bulkBusy}>
                        {bulkBusy ? <Spinner size="sm" animation="border" /> : "Sí, quitar a todos"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}