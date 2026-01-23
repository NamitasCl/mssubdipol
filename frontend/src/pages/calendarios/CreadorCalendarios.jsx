import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {
    Accordion,
    Alert,
    Button,
    Col,
    Form,
    ListGroup,
    Modal,
    OverlayTrigger,
    Row,
    Spinner,
    Table,
    Tooltip
} from "../../components/BootstrapAdapter.jsx";
import {useAuth} from "../../components/contexts/AuthContext.jsx";
import AgregarPlantillasMes from "../turnos/AgregarPlantillasMes.jsx";
// import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal"; // ← descomenta si lo usas
import {actualizarCalendario, crearCalendario, eliminarCalendario, listarCalendarios} from "../../api/calendarApi.js";
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
    {
        value: "UNIDAD",
        label: "Unidad",
        rolesAutorizados: ["ROLE_TURNOS", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        value: "COMPLEJO",
        label: "Complejo",
        rolesAutorizados: ["ROLE_TURNOS", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {value: "RONDA", label: "Servicio de Ronda", rolesAutorizados: ["ROLE_ADMINISTRADOR", "ROLE_TURNOS_RONDA"]},
    {
        value: "PROCEPOL",
        label: "Procedimientos Policiales",
        rolesAutorizados: ["ROLE_ADMINISTRADOR", "ROLE_TURNOS_PROCEPOL"]
    }
];

export default function CreadorCalendarios({onSeleccionar}) {
    const navigate = useNavigate();
    const {user} = useAuth();

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
    const Overlay = ({children, mensaje}) => (
        <OverlayTrigger placement="top-start" overlay={tooltip(mensaje)}>
            {children}
        </OverlayTrigger>
    );

    /* ---------- handlers ---------- */
    const handleChange = e => {
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));
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
            const copy = {...prev};
            if (checked)
                copy[key] = {...copy[key], activa: true, fuerte: copy[key]?.fuerte ?? false};
            else delete copy[key];
            return copy;
        });

    const handleValorRestriccion = (key, v) =>
        setRestricciones(prev => ({
            ...prev,
            [key]: {...prev[key], activa: true, valor: v}
        }));

    const handleFuerteRestriccion = (key, checked) =>
        setRestricciones(prev => ({
            ...prev,
            [key]: {...prev[key], activa: true, fuerte: checked}
        }));

    /* ---------- crear / actualizar ---------- */
    const handleCrearActualizarCalendario = async e => {
        e.preventDefault();
        setFormError(null);

        if (!form.tipo === "PROCEPOL" && (!form.nombre.trim() || plantillasSeleccionadas.length === 0)) {
            setFormError("Debe completar nombre y seleccionar al menos una plantilla.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                idPlantillasUsadas: plantillasSeleccionadas.map(p => p.id),
                configuracionCalendario: {parametrosJson: restricciones},
                ...(form.tipo === "COMPLEJO" ? {idUnidad: null} : {nombreComplejo: ""})
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
        <div className="p-6 lg:p-8 space-y-8">
            {/* ░░░ 1. Accordion Crear / Editar ░░░ */}
            <Accordion activeKey={openCrear ? "crear" : null} className="">
                <Accordion.Item eventKey="crear">
                    <Accordion.Header onClick={() => setOpenCrear(!openCrear)}>
                        {editarCalendario ? "✏️ Editar calendario" : "➕ Crear nuevo calendario"}
                    </Accordion.Header>

                    <Accordion.Body>
                        <Form onSubmit={handleCrearActualizarCalendario} className="space-y-6">
                            {/* === Sección: Datos generales === */}
                            <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                                    Información Básica
                                </h4>
                                <Row className="gap-y-4">
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
                                            {Array.from({length: 12}, (_, i) => (
                                                <option value={i + 1} key={i}>
                                                    {new Date(2000, i).toLocaleString("es-CL", {month: "long"})}
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
                            </div>

                            {/* === Sección: Tipo y Unidad === */}
                            <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">2</span>
                                    Tipo de Gestión
                                </h4>
                                <Row className="gap-y-4">
                                <Col md={12} className="d-flex gap-3">
                                    <Form.Group style={{width: 300}}>
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
                                                        t.value === "COMPLEJO" && !user.roles.includes("ROLE_JEFE") ||
                                                        t.value === "RONDA" && !user.roles.includes("ROLE_TURNOS_RONDA")
                                                    }
                                                >
                                                    {t.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group style={{width: 600}}>
                                        <Form.Label>
                                            {form.tipo === "COMPLEJO" ? "Nombre Complejo" : form.tipo === "UNIDAD" ? "Unidad" : ""}
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
                                            <UnidadSelect value={unidadSeleccionada} onChange={handleUnidadChange}/>
                                        )}
                                        {form.tipo === "RONDA" && (
                                            ""
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            </div>

                            {/* === Sección: Restricciones === */}
                            {form.tipo !== "PROCEPOL" && (
                                <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
                                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs font-bold">3</span>
                                        Restricciones del Calendario
                                    </h4>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Define las reglas que limitarán las asignaciones de turnos. Marca como <strong>"Fuerte"</strong> las restricciones obligatorias.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {restriccionesDisponibles.map(r => (
                                            <Overlay key={r.key} mensaje={r.descripcion}>
                                                <div className="bg-white rounded-lg p-3 border border-gray-100 hover:border-amber-200 transition-colors">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <Form.Check
                                                            type="checkbox"
                                                            id={r.key}
                                                            label={r.label}
                                                            checked={!!restricciones[r.key]?.activa}
                                                            onChange={e => handleCheckRestriccion(r.key, e.target.checked)}
                                                        />

                                                        {r.requiereValor && restricciones[r.key]?.activa && (
                                                            <Form.Control
                                                                style={{width: 80}}
                                                                type={r.tipoValor}
                                                                value={restricciones[r.key]?.valor ?? ""}
                                                                min={r.tipoValor === "number" ? 1 : undefined}
                                                                onChange={e => handleValorRestriccion(r.key, e.target.value)}
                                                                placeholder={r.valorPlaceholder}
                                                                className="!py-1 !text-sm"
                                                            />
                                                        )}

                                                        {restricciones[r.key]?.activa && (
                                                            <Form.Check
                                                                type="checkbox"
                                                                id={`${r.key}_fuerte`}
                                                                label="Fuerte"
                                                                checked={!!restricciones[r.key]?.fuerte}
                                                                onChange={e => handleFuerteRestriccion(r.key, e.target.checked)}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </Overlay>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* === Sección: Acciones === */}
                            <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
                                <div className="flex flex-wrap gap-3 items-center">
                                    {form.tipo !== "PROCEPOL" && (
                                        <Button type="button" variant="outline-secondary" onClick={() => setShowAgregarPlantillas(true)}>
                                            + Agregar Servicios
                                        </Button>
                                    )}

                                    <Button variant="success" type="submit" disabled={saving} className="!px-6">
                                        {saving ? <Spinner size="sm"/> : editarCalendario ? "✔ Actualizar Calendario" : "✔ Crear Calendario"}
                                    </Button>

                                    {formError && (
                                        <Alert variant="danger" className="!py-2 !px-4 !mb-0">
                                            {formError}
                                        </Alert>
                                    )}
                                </div>
                            </div>

                            {plantillasSeleccionadas.length > 0 && (
                                <div className="mt-3">
                                    <b>Servicios seleccionados:</b>
                                    <ListGroup>
                                        {plantillasSeleccionadas.map(p => (
                                            <ListGroup.Item key={p.id}>
                                                <strong>{p.nombre}</strong>{" "}
                                                <span className="text-muted" style={{fontSize: 13}}>
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
        </div>
    );
}