import React, { useState, useEffect } from "react";
import {
    Accordion,
    Form,
    Button,
    Row,
    Col,
    Spinner,
    Table,
    Modal,
    Alert,
    ListGroup,
    Tooltip,
    OverlayTrigger
} from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import AgregarPlantillasMes from "../turnos/AgregarPlantillasMes.jsx";
// import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal"; // ← descomenta si lo usas
import {
    eliminarCalendario,
    listarCalendarios,
    crearCalendario,
    actualizarCalendario
} from "../../api/calendarApi.js";
import UnidadSelect from "./UnidadSelect.jsx";

/* ====== RESTRICCIONES DISPONIBLES ====== */
const restriccionesDisponibles = [
    {
        key: "maxTurnosPorMes",
        label: "Máximo turnos por mes",
        requiereValor: true,
        tipoValor: "number",
        valorPlaceholder: "Ej: 6",
        descripcion:
            "Cantidad de servicios que el funcionario deberá cumplir en el mes."
    },
    {
        key: "noDosTurnosMismoDia",
        label: "No permitir dos turnos el mismo día",
        requiereValor: false,
        descripcion:
            "Impide que el funcionario sea asignado a dos servicios el mismo día."
    },
    {
        key: "maxTurnosFinDeSemana",
        label: "Máximo turnos fin de semana",
        requiereValor: true,
        tipoValor: "number",
        valorPlaceholder: "Ej: 2",
        descripcion: "Límite de turnos en sábado o domingo."
    },
    {
        key: "maxUnaNochePorSemana",
        label: "Máximo una noche por semana",
        requiereValor: false,
        descripcion:
            "El funcionario no podrá ser asignado a más de un servicio nocturno por semana."
    },
    {
        key: "nochesConsecutivas",
        label: "Noches consecutivas",
        requiereValor: true,
        tipoValor: "number",
        valorPlaceholder: "Cantidad",
        descripcion: "Número máximo de noches consecutivas."
    },
    {
        key: "separacionDias",
        label: "Separación mínima de días entre turnos",
        requiereValor: true,
        tipoValor: "number",
        valorPlaceholder: "Días",
        descripcion: "Cantidad de días entre turnos para el mismo funcionario."
    },
    {
        key: "unSoloRolPorServicio",
        label: "Un solo rol por servicio",
        requiereValor: false,
        descripcion:
            "No permite que el funcionario cumpla más de un rol en el mismo servicio."
    },
    {
        key: "jerarquiaRolServicio",
        label: "Jerarquía de rol por servicio",
        requiereValor: false,
        descripcion: "Control de antigüedad entre encargado y ayudante."
    },
    {
        key: "noDisponible",
        label: "No disponible",
        requiereValor: false,
        descripcion:
            "Bloquea asignaciones cuando el funcionario está marcado como no disponible."
    },
    {
        key: "maximoRepeticionUnidadPorDia",
        label: "Cantidad máxima de funcionarios por unidad y por día",
        requiereValor: true,
        tipoValor: "number",
        valorPlaceholder: "Ej: 2",
        descripcion: "Cantidad de funcionarios de una misma unidad asignables el mismo día."
    }
];
/* ======================================= */

const tipos = [
    { value: "UNIDAD", label: "Unidad", rolesAutorizados: ["ROLE_TURNOS", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"] },
    { value: "COMPLEJO", label: "Complejo", rolesAutorizados: ["ROLE_TURNOS", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"] },
    { value: "RONDA", label: "Servicio de Ronda", rolesAutorizados: ["ROLE_ADMINISTRADOR", "ROLE_TURNOS_RONDA"] },
];

export default function CreadorCalendarios({ onSeleccionar }) {
    const { user } = useAuth();

    /* ---------- estado general ---------- */
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [eliminarId, setEliminarId] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [editarCalendario, setEditarCalendario] = useState(null);

    /* ---------- accordion ---------- */
    const [openCrear, setOpenCrear] = useState(true);

    /* ---------- formulario ---------- */
    const emptyForm = {
        nombre: "",
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        tipo: "UNIDAD",
        idUnidad: "",
        nombreComplejo: "",
        idPlantillasUsadas: [],
        siglasUnidad: "",
        nombreUnidad: ""
    };
    const [form, setForm] = useState(emptyForm);
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState([]);
    const [restricciones, setRestricciones] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    /* ---------- carga de calendarios ---------- */
    useEffect(() => {
        setLoading(true);
        listarCalendarios()
            .then(setCalendarios)
            .finally(() => setLoading(false));
    }, [refresh]);

    /* ---------- editar calendario ---------- */
    useEffect(() => {
        if (editarCalendario) {
            setForm({
                nombre: editarCalendario.nombre,
                mes: editarCalendario.mes,
                anio: editarCalendario.anio,
                tipo: editarCalendario.tipo,
                idUnidad: editarCalendario.idUnidad ?? "",
                nombreComplejo: editarCalendario.nombreComplejo ?? "",
                idPlantillasUsadas: editarCalendario.idPlantillasUsadas ?? [],
                siglasUnidad: editarCalendario.siglasUnidad ?? "",
                nombreUnidad: editarCalendario.nombreUnidad ?? ""
            });
            setUnidadSeleccionada(
                editarCalendario.idUnidad
                    ? {
                        value: editarCalendario.idUnidad,
                        siglasUnidad: editarCalendario.siglasUnidad,
                        nombreUnidad: editarCalendario.nombreUnidad
                    }
                    : null
            );
            setPlantillasSeleccionadas(
                editarCalendario.idPlantillasUsadasDetalles ?? []
            );
            /* restricciones existentes */
            setRestricciones(
                editarCalendario.configuracionCalendario?.parametrosJson ?? {}
            );
            /* abrir accordion */
            setOpenCrear(true);
        } else {
            resetFormulario();
        }
    }, [editarCalendario]);

    /* ---------- resets ---------- */
    const resetFormulario = () => {
        setForm(emptyForm);
        setUnidadSeleccionada(null);
        setPlantillasSeleccionadas([]);
        setRestricciones({});
        setFormError(null);
    };

    /* ---------- tooltip ---------- */
    const tooltip = txt => <Tooltip id="tt">{txt}</Tooltip>;
    const Overlay = ({ children, mensaje }) => (
        <OverlayTrigger placement="top-start" overlay={tooltip(mensaje)}>
            {children}
        </OverlayTrigger>
    );

    /* ---------- handlers ---------- */
    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleUnidadChange = unidad => {
        setUnidadSeleccionada(unidad);
        setForm(f => ({
            ...f,
            idUnidad: unidad ? unidad.value : "",
            siglasUnidad: unidad ? unidad.siglasUnidad : "",
            nombreUnidad: unidad ? unidad.nombreUnidad : ""
        }));
    };

    const handlePlantillasGuardadas = plantillas => {
        setPlantillasSeleccionadas(plantillas);
        setForm(f => ({
            ...f,
            idPlantillasUsadas: plantillas.map(p => p.id)
        }));
        setShowAgregarPlantillas(false);
    };

    /* --- restricciones --- */
    const handleCheckRestriccion = (key, checked) =>
        setRestricciones(prev => {
            const copy = { ...prev };
            if (checked)
                copy[key] = { ...copy[key], activa: true, fuerte: copy[key]?.fuerte ?? false };
            else delete copy[key];
            return copy;
        });

    const handleValorRestriccion = (key, v) =>
        setRestricciones(prev => ({
            ...prev,
            [key]: { ...prev[key], activa: true, valor: v }
        }));

    const handleFuerteRestriccion = (key, checked) =>
        setRestricciones(prev => ({
            ...prev,
            [key]: { ...prev[key], activa: true, fuerte: checked }
        }));

    /* ---------- crear / actualizar ---------- */
    const handleCrearActualizarCalendario = async e => {
        e.preventDefault();
        setFormError(null);

        if (!form.nombre.trim() || plantillasSeleccionadas.length === 0) {
            setFormError("Debe completar nombre y seleccionar al menos una plantilla.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                idPlantillasUsadas: plantillasSeleccionadas.map(p => p.id),
                configuracionCalendario: { parametrosJson: restricciones },
                ...(form.tipo === "COMPLEJO" ? { idUnidad: null } : { nombreComplejo: "" })
            };

            editarCalendario
                ? await actualizarCalendario(editarCalendario.id, payload, user.idFuncionario)
                : await crearCalendario(payload, user.idFuncionario);

            /* éxito */
            setRefresh(r => !r);
            setEditarCalendario(null);
            resetFormulario();
            setOpenCrear(false);
        } catch {
            setFormError("Error al guardar calendario");
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async id => {
        await eliminarCalendario(id, user.idFuncionario);
        setRefresh(r => !r);
        setEliminarId(null);
    };



    /* ---------- render ---------- */
    return (
        <div className="container">
            {/* ░░░ 1. Accordion Crear / Editar ░░░ */}
            <Accordion activeKey={openCrear ? "crear" : null} className="mb-4">
                <Accordion.Item eventKey="crear">
                    <Accordion.Header onClick={() => setOpenCrear(!openCrear)}>
                        {editarCalendario ? "Editar calendario" : "Crear nuevo calendario"}
                    </Accordion.Header>

                    <Accordion.Body>
                        <Form onSubmit={handleCrearActualizarCalendario}>
                            {/* === Datos generales === */}
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Mes</Form.Label>
                                        <Form.Select name="mes" value={form.mes} onChange={handleChange}>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option value={i + 1} key={i}>
                                                    {new Date(2000, i).toLocaleString("es-CL", { month: "long" })}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Año</Form.Label>
                                        <Form.Control
                                            name="anio"
                                            type="number"
                                            value={form.anio}
                                            onChange={handleChange}
                                            min={2020}
                                            max={2100}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mt-3 mb-3">
                                <Col md={12} className="d-flex gap-3">
                                    <Form.Group style={{ width: 200 }}>
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Control
                                            as="select"
                                            name="tipo"
                                            value={form.tipo}
                                            onChange={handleChange}
                                        >
                                            {tipos.map(t => (
                                                <option
                                                    key={t.value}
                                                    value={t.value}
                                                    disabled={
                                                        t.value === "COMPLEJO" && !user.roles.includes("ROLE_TURNOS") ||
                                                        t.value === "RONDA" && !user.roles.includes("ROLE_TURNOS_RONDA")
                                                    }
                                                >
                                                    {t.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group style={{ width: 600 }}>
                                        <Form.Label>
                                            {form.tipo === "COMPLEJO" ? "Nombre Complejo": form.tipo === "UNIDAD" ? "Unidad" : ""}
                                        </Form.Label>
                                        {form.tipo === "COMPLEJO" && (
                                            <Form.Control
                                                name="nombreComplejo"
                                                value={form.nombreComplejo}
                                                onChange={handleChange}
                                                placeholder="Escribe el nombre del complejo"
                                                required
                                            />
                                        )}
                                        {form.tipo === "UNIDAD" && (
                                            <UnidadSelect value={unidadSeleccionada} onChange={handleUnidadChange} />
                                        )}
                                        {form.tipo === "RONDA" && (
                                            ""
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* === Restricciones === */}
                            <div className="mt-4 mb-2">
                                <b>Restricciones de calendario</b>
                                <div className="border rounded p-2 bg-white">
                                    {restriccionesDisponibles.map(r => (
                                        <Overlay key={r.key} mensaje={r.descripcion}>
                                            <div className="mb-2 d-flex align-items-center flex-wrap gap-2">
                                                <Form.Check
                                                    type="checkbox"
                                                    id={r.key}
                                                    label={r.label}
                                                    checked={!!restricciones[r.key]?.activa}
                                                    onChange={e => handleCheckRestriccion(r.key, e.target.checked)}
                                                    className="me-2"
                                                />

                                                {r.requiereValor && restricciones[r.key]?.activa && (
                                                    <Form.Control
                                                        style={{ width: 100 }}
                                                        type={r.tipoValor}
                                                        value={restricciones[r.key]?.valor ?? ""}
                                                        min={r.tipoValor === "number" ? 1 : undefined}
                                                        onChange={e => handleValorRestriccion(r.key, e.target.value)}
                                                        placeholder={r.valorPlaceholder}
                                                    />
                                                )}

                                                {restricciones[r.key]?.activa && (
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`${r.key}_fuerte`}
                                                        label="Fuerte"
                                                        checked={!!restricciones[r.key]?.fuerte}
                                                        onChange={e => handleFuerteRestriccion(r.key, e.target.checked)}
                                                        className="ms-2"
                                                    />
                                                )}
                                            </div>
                                        </Overlay>
                                    ))}
                                </div>
                                <small className="text-muted">
                                    Marca las restricciones y define si son <b>fuertes</b> o sólo sugerencia.
                                </small>
                            </div>

                            {/* === Botones === */}
                            <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                                <Button type="button" onClick={() => setShowAgregarPlantillas(true)}>
                                    + Agregar Servicios
                                </Button>

                                <Button variant="success" type="submit" disabled={saving}>
                                    {saving ? <Spinner size="sm" /> : editarCalendario ? "Actualizar" : "Crear"}
                                </Button>

                                {formError && (
                                    <Alert variant="danger" className="ms-3 mb-0 py-1 px-3">
                                        {formError}
                                    </Alert>
                                )}
                            </div>

                            {plantillasSeleccionadas.length > 0 && (
                                <div className="mt-3">
                                    <b>Servicios seleccionados:</b>
                                    <ListGroup>
                                        {plantillasSeleccionadas.map(p => (
                                            <ListGroup.Item key={p.id}>
                                                <strong>{p.nombre}</strong>{" "}
                                                <span className="text-muted" style={{ fontSize: 13 }}>
                          {p.descripcion}
                        </span>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            )}
                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* ░░░ 2. Modales auxiliares ░░░ */}
            <AgregarPlantillasMes
                show={showAgregarPlantillas}
                mes={form.mes}
                anio={form.anio}
                seleccionadas={plantillasSeleccionadas}
                onPlantillasGuardadas={handlePlantillasGuardadas}
                onHide={() => setShowAgregarPlantillas(false)}
            />

            {/* <PlantillasTurnoCrudModal show={false} onClose={() => {}} /> */}

            {/* ░░░ 3. Tabla de calendarios ░░░ */}
            <h5 className="mt-4 mb-3">Mis calendarios</h5>
            {loading && <Spinner />}
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Mes/Año</th>
                    <th>Tipo</th>
                    <th>Unidad / Complejo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {calendarios.map(cal => (
                    <tr key={cal.id}>
                        <td>{cal.nombre}</td>
                        <td>
                            {cal.mes}/{cal.anio}
                        </td>
                        <td>{cal.tipo}</td>
                        <td>
                            {cal.tipo === "COMPLEJO"
                                ? cal.nombreComplejo
                                : cal.siglasUnidad ?? cal.idUnidad}
                        </td>
                        <td>{cal.estado}</td>
                        <td>
                            {cal.tipo === "COMPLEJO" && (
                                <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => onSeleccionar(cal.id)}
                                    className="me-1"
                                >
                                    Configurar unidades
                                </Button>
                            )}
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setEliminarId(cal.id)}
                                className="me-1"
                            >
                                Eliminar
                            </Button>
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => setEditarCalendario(cal)}
                            >
                                Editar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {/* modal eliminar */}
            <Modal show={!!eliminarId} onHide={() => setEliminarId(null)} centered>
                <Modal.Body>¿Seguro que quieres eliminar este calendario?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEliminarId(null)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => handleEliminar(eliminarId)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}