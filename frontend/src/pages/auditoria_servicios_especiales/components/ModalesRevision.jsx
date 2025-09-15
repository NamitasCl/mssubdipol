// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/ModalesRevision.jsx
import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {guardarRevisionMemo} from "../../../api/nodosApi.js";

export default function ModalesRevision({
                                            // Modal Observar
                                            observado,
                                            selected,
                                            onHide,

                                            // Modal Aprobar
                                            aprobado,

                                            // Callback único para notificar cambios al padre
                                            onMemoUpdated,

                                            // Sistema de notificaciones (opcional)
                                            showNotification,
                                        }) {
    // Estados locales del componente
    const [obsTexto, setObsTexto] = useState("");
    const [obsAprobTexto, setObsAprobTexto] = useState("");
    const [savingRev, setSavingRev] = useState(false);
    const [saveErr, setSaveErr] = useState("");

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
        if (!selected || !obsTexto.trim()) {
            setSaveErr("Las observaciones son requeridas");
            return;
        }

        setSavingRev(true);
        setSaveErr("");

        try {
            const revision = {
                memoId: selected.id,
                estado: "PENDIENTE", // O "OBSERVADO" según tu lógica de negocio
                observaciones: obsTexto.trim(),
                origen: "frontend",
                requestId: `obs-${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
            };

            // Usar la API existente
            const token = localStorage.getItem("token");
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

    // Handler para guardar aprobación
    const handleGuardarAprobado = async () => {
        if (!selected) return;

        setSavingRev(true);
        setSaveErr("");

        try {
            const revision = {
                memoId: selected.id,
                estado: "APROBADO",
                origen: "frontend",
                requestId: `apb-${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
            };

            // Incluir observación si hay texto
            if (obsAprobTexto.trim()) {
                revision.observaciones = obsAprobTexto.trim();
            }

            // Usar la API existente
            const token = localStorage.getItem("token");
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
        </>
    );
}