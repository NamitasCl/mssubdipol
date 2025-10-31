// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/ModalesRevision.jsx
import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {guardarRevisionMemo, registrarRelatoJenadep} from "../../../api/nodosApi.js";
import {useAuth} from "../../../components/contexts/AuthContext.jsx";

export default function ModalesRevision({
                                            // Modal Observar
                                            observado,
                                            selected,
                                            onHide,
                                            //Modal JENADEP
                                            jenadep,
                                            // Modal Aprobar
                                            aprobado,
                                            // Callback único para notificar cambios al padre
                                            onMemoUpdated,
                                            // Sistema de notificaciones (opcional)
                                            showNotification,
                                        }) {
    // Estados locales del componente
    const {user} = useAuth();

    const [obsTexto, setObsTexto] = useState("");
    const [obsAprobTexto, setObsAprobTexto] = useState("");
    const [savingRev, setSavingRev] = useState(false);
    const [saveErr, setSaveErr] = useState("");

    //JENADEP
    const [hecho, setHecho] = useState('');
    const [relato, setRelato] = useState('');

    useEffect(() => {
        if (!jenadep) {
            setRelato('');

        }
    }, [jenadep]);

    // Función para determinar el rol revisor basado en los roles del usuario
    const determinarRolRevisor = (usuario) => {
        if (!usuario || !usuario.roles) {
            return "";
        }

        // Convertir roles a array de strings si es necesario
        const userRoles = Array.isArray(usuario.roles)
            ? usuario.roles.map(role => typeof role === 'string' ? role : role.nombre || role.authority)
            : [];

        /*// Solo pueden revisar usuarios con ROLE_REVISOR
        if (!userRoles.includes('ROLE_REVISOR')) {
            return "";
        }*/

        // Determinar el tipo de revisor:
        // 1. Si tiene ROLE_JEFE y es JEFE por perfil -> JEFE
        // 2. Si es FUNCIONARIO por perfil pero tiene ROLE_REVISOR -> PMAYOR
        // 3. Si tiene roles especiales de contraloría -> CONTRALOR

        if (userRoles.includes('ROLE_JEFE') && usuario.nombrePerfil === 'JEFE') {
            return 'JEFE';
        }

        if (userRoles.includes('ROLE_CONTRALOR') || userRoles.includes('ROLE_CONTRALORIA')) {
            return 'CONTRALOR';
        }

        // Si es funcionario con rol revisor (funcionario de plana mayor asignado como revisor)
        if (usuario.nombrePerfil === 'FUNCIONARIO' && userRoles.includes('ROLE_REVISOR')) {
            return 'PMAYOR';
        }

        // Por defecto, si tiene ROLE_REVISOR pero no encaja en las categorías anteriores
        return '';
    };

    // Resetear estados cuando se abren/cierran modales
    React.useEffect(() => {
        if (!observado && !aprobado) {
            setObsTexto("");
            setObsAprobTexto("");
            setSaveErr("");
        }
    }, [observado, aprobado]);

    // Handler para guardar observación
    const handleGuardarObservado = async () => {

        const rolRevisor = determinarRolRevisor(user);
        if (rolRevisor === '') {
            setSaveErr("No tienes permiso para revisar este memo");
            return;
        }

        if (!selected || !obsTexto.trim()) {
            setSaveErr("Las observaciones son requeridas");
            return;
        }

        setSavingRev(true);
        setSaveErr("");

        try {
            const revision = {
                memoId: selected.id,
                nombreRevisor: user.nombreUsuario || user.nombre,
                unidadRevisor: user.siglasUnidad,
                usuarioRevisor: user.sub,
                rolRevisor: rolRevisor,
                estado: "PENDIENTE", // O "OBSERVADO" según tu lógica de negocio
                observaciones: obsTexto.trim(),
                origen: "frontend",
                requestId: `obs-${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            };

            console.log("Revisión (observado):", revision); // Debug

            // Usar la API existente
            const token = user?.token;
            await guardarRevisionMemo(revision, token);

            // Mostrar notificación de éxito
            showNotification?.("success", "Memo observado exitosamente") ||
            console.log("Memo observado exitosamente");

            // Notificar al padre que el memo cambió
            onMemoUpdated?.(selected.id, "PENDIENTE");

            // Limpiar y cerrar
            setObsTexto("");
            setSaveErr("");
            onHide();

        } catch (error) {
            console.error("Error al observar memo:", error);
            const errorMsg = `Error al guardar: ${error.response?.data?.message || error.message}`;
            setSaveErr(errorMsg);
            showNotification?.("error", errorMsg) ||
            console.error(errorMsg);
        } finally {
            setSavingRev(false);
        }
    };

    const sitiosPrincipioEjecucion = selected && selected.sitiosDeSuceso.filter(ss => ss.tipoSitioSuceso === 'PRINCIPIO DE EJECUCION');

    const handleSave = async () => {
        const payload = {
            unidad: selected.unidad,
            lugar: sitiosPrincipioEjecucion[0].comuna ? sitiosPrincipioEjecucion[0].comuna : '',
            fecha: selected._raw.fecha,
            hecho,
            relato,
            memo: selected.id,
        }

        setSavingRev(true);
        setSaveErr("");

        try {
            const data = await registrarRelatoJenadep(payload);
            console.log("Relato registrado:", data);
            // Mostrar notificación de éxito
            showNotification?.("success", "Registro guardado exitosamente");

            setRelato('');
            setHecho('');
            setSaveErr("");
            setSavingRev(false);
            onHide();
        } catch (e) {
            console.error("Error al registrar relato:", e);
        }
    };


    // Handler para guardar aprobación
    const handleGuardarAprobado = async () => {
        if (!selected) return;

        const rolRevisor = determinarRolRevisor(user);
        if (rolRevisor === '') {
            setSaveErr("No tienes permiso para revisar este memo");
            return;
        }

        setSavingRev(true);
        setSaveErr("");

        try {
            const revision = {
                memoId: selected.id,
                nombreRevisor: user.nombreUsuario || user.nombre,
                unidadRevisor: user.siglasUnidad,
                usuarioRevisor: user.sub,
                rolRevisor: rolRevisor,
                estado: "APROBADO",
                origen: "frontend",
                requestId: `apb-${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            };

            // Incluir observación si hay texto
            if (obsAprobTexto.trim()) {
                revision.observaciones = obsAprobTexto.trim();
            }

            console.log("Revisión (aprobado):", revision); // Debug

            // Usar la API existente
            const token = user?.token;
            await guardarRevisionMemo(revision, token);

            // Mostrar notificación de éxito
            showNotification?.("success", "Memo aprobado exitosamente") ||
            console.log("Memo aprobado exitosamente");

            // Notificar al padre que el memo cambió
            onMemoUpdated?.(selected.id, "APROBADO");

            // Limpiar y cerrar
            setObsAprobTexto("");
            setSaveErr("");
            onHide();

        } catch (error) {
            console.error("Error al aprobar memo:", error);
            const errorMsg = `Error al aprobar: ${error.response?.data?.message || error.message}`;
            setSaveErr(errorMsg);
            showNotification?.("error", errorMsg) ||
            console.error(errorMsg);
        } finally {
            setSavingRev(false);
        }
    };

    return (
        <>
            {/* Modal OBSERVAR */}
            <Modal show={!!observado} onHide={onHide} centered>
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Observar memo #{selected.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className="mb-2">
                                <Form.Label>Observaciones (requerido)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Describe brevemente el problema/observación…"
                                    value={obsTexto}
                                    onChange={(e) => setObsTexto(e.target.value)}
                                    disabled={savingRev}
                                />
                                <Form.Text muted>
                                    Se guardará con estado <strong>PENDIENTE</strong>.
                                </Form.Text>
                            </Form.Group>
                            {saveErr && <div className="text-danger small">{saveErr}</div>}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onHide} disabled={savingRev}>
                                Cancelar
                            </Button>
                            <Button
                                variant="warning"
                                onClick={handleGuardarObservado}
                                disabled={savingRev || !obsTexto.trim()}
                            >
                                {savingRev ? "Guardando…" : "Guardar observación"}
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Modal APROBAR */}
            <Modal show={!!aprobado} onHide={onHide} centered>
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Aprobar memo #{selected.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="mb-2">
                                ¿Confirmas la aprobación de este memo? Se guardará con estado{" "}
                                <strong>APROBADO</strong>.
                            </p>
                            <Form.Group>
                                <Form.Label>Observación (opcional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Puedes dejar un comentario breve (opcional)…"
                                    value={obsAprobTexto}
                                    onChange={(e) => setObsAprobTexto(e.target.value)}
                                    disabled={savingRev}
                                />
                            </Form.Group>
                            {saveErr && <div className="text-danger small mt-2">{saveErr}</div>}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onHide} disabled={savingRev}>
                                Cancelar
                            </Button>
                            <Button variant="success" onClick={handleGuardarAprobado} disabled={savingRev}>
                                {savingRev ? "Aprobando…" : "Aprobar"}
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Modal para JENADEP */}
            <Modal show={!!jenadep} onHide={onHide} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Registrar relato asociado a Ficha ID: {selected && selected.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Campo para el Relato */}
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>Unidad</Form.Label>
                        <Col sm={10} className="pt-2">
                            <span className="text-body">{selected?.unidad || "—"}</span>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>Lugar</Form.Label>
                        <Col sm={10} className="pt-2">
                            <span
                                className="text-body">{sitiosPrincipioEjecucion?.[0]?.comuna?.toUpperCase() || "—"}</span>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>Fecha</Form.Label>
                        <Col sm={10} className="pt-2">
                            <span className="text-body">{selected?.fecha.split(",")[0] || "—"}</span>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Hecho</Form.Label>
                        <Col sm={10} className="pt-2">
                            <Form.Control as={"input"} type={"text"} value={hecho}
                                          onChange={(e) => setHecho(e.target.value)}/>
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Relato de los hechos (requerido)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            placeholder="Describa el suceso, involucrados, y el contexto general..."
                            value={relato}
                            onChange={(e) => setRelato(e.target.value)}
                            disabled={savingRev}
                        />
                    </Form.Group>

                    {/* Fila para los contadores de Homicidios */}


                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={savingRev}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={savingRev || !relato.trim()} // El botón se deshabilita si se está guardando o si el relato está vacío
                    >
                        {savingRev ? 'Guardando…' : 'Guardar Relato'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}