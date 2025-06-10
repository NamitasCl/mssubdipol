import { useEffect, useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import debounce from "lodash.debounce";
import {
    Button, Card, Form, Modal, OverlayTrigger, Tooltip, Spinner, Alert
} from "react-bootstrap";
import AsyncSelect from "react-select/async";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

// Paleta institucional
const azulPDI = "#17355A";
const textoSecundario = "#4a5975";
const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function UnitDepartmentManagement() {
    const { user } = useAuth();
    const userId = user?.idFuncionario; // o user.idFuncionario

    // Estado global de selección
    const [selectedCalendar, setSelectedCalendar] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [calendars, setCalendars] = useState([]);
    const [loadingCalendars, setLoadingCalendars] = useState(false);

    // Estado de unidades colaboradoras
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const yearOptions = useMemo(() => {
        const y = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => y - 1 + i);
    }, []);

    // Cargar calendarios del backend
    useEffect(() => {
        setLoadingCalendars(true);
        axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/mis-calendarios`, {
            params: { userid: userId }
        })
            .then(res => setCalendars(res.data))
            .catch(() => setCalendars([]))
            .finally(() => setLoadingCalendars(false));
    }, [userId]);

    // Cuando cambia calendario/mes/año, reiniciar departamentos
    useEffect(() => {
        setDepartments([]);
        setError("");
    }, [selectedCalendar, selectedMonth, selectedYear]);

    return (
        <Card style={{ borderRadius: 18, boxShadow: "0 5px 18px #b0c5e820", marginBottom: 24 }}>
            <Card.Body>
                <h3 className="fw-bold mb-4" style={{ color: azulPDI, fontSize: 21 }}>
                    Configuración de Unidades Colaboradoras
                </h3>
                <div className="d-flex gap-3 mb-4 flex-wrap">
                    <Form.Group>
                        <Form.Label className="fw-bold">Calendario</Form.Label>
                        {loadingCalendars ? (
                            <div><Spinner size="sm" /> Cargando...</div>
                        ) : (
                            <Form.Select
                                style={{ minWidth: 220, fontWeight: 600 }}
                                value={selectedCalendar}
                                onChange={e => setSelectedCalendar(e.target.value)}
                            >
                                <option value="">Seleccione calendario...</option>
                                {calendars.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombreCalendario}</option>
                                ))}
                            </Form.Select>
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="fw-bold">Mes</Form.Label>
                        <Form.Select
                            style={{ minWidth: 120, fontWeight: 600 }}
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            disabled={!selectedCalendar}
                        >
                            <option value="">Mes</option>
                            {meses.map((m, idx) => (
                                <option key={m} value={idx + 1}>{m}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="fw-bold">Año</Form.Label>
                        <Form.Select
                            style={{ minWidth: 100, fontWeight: 600 }}
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                            disabled={!selectedCalendar}
                        >
                            <option value="">Año</option>
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
                {/* Mensajes de error/carga */}
                {error && <Alert variant="danger">{error}</Alert>}
                {selectedCalendar && selectedMonth && selectedYear ? (
                    <DepartmentManagement
                        departments={departments}
                        setDepartments={setDepartments}
                        mes={Number(selectedMonth)}
                        anio={Number(selectedYear)}
                        idCalendario={selectedCalendar}
                        loading={loading}
                        setLoading={setLoading}
                        setError={setError}
                    />
                ) : (
                    <div className="text-muted" style={{ color: textoSecundario }}>
                        Selecciona un calendario, mes y año para gestionar las unidades colaboradoras.
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}


// ---- COMPONENTE HIJO ----

function DepartmentManagement({
                                  departments, setDepartments, mes, anio, idCalendario, loading, setLoading, setError
                              }) {

    const [showModal, setShowModal] = useState(false);
    const [editDept, setEditDept] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const {control, register, handleSubmit, reset} = useForm();
    const [saving, setSaving] = useState(false);

    // Autocompletar nombre de unidad
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) return callback([]);
        axios
            .get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar`, {
                params: {nombre: inputValue}
            })
            .then(response => {
                const options = response.data.map(u => ({
                    value: u.nombreUnidad,
                    label: u.nombreUnidad
                }));
                callback(options);
            })
            .catch(() => callback([]));
    };
    const debouncedLoadOptions = debounce(loadOptions, 400);

    // --- CARGA INICIAL DEPARTAMENTOS DESDE EL BACKEND ---
    useEffect(() => {
        if (!mes || !anio) return;
        setLoading(true);
        axios
            .get(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras`, {
                params: { mes, anio }
            })
            .then((res) => {
                // Normaliza el formato para ser compatible con el resto del código
                if (Array.isArray(res.data)) {
                    setDepartments(res.data);
                } else {
                    setDepartments([]);
                }
            })
            .catch(() => setDepartments([]))
            .finally(() => setLoading(false));
    }, [mes, anio, setDepartments]);

    // Agregar o editar
    const openAddModal = () => {
        setEditDept(null);
        setSelectedUnit(null);
        reset();
        setShowModal(true);
    };
    const openEditModal = (dept, idx) => {
        setEditDept({ ...dept, _idx: idx });
        reset({
            name: dept.name || dept.nombreUnidad,
            totalPeople: dept.totalPeople || dept.cantFuncAporte,
            maxShifts: dept.maxShifts || dept.maxTurnos,
            workersPerDay: dept.workersPerDay || dept.trabajadoresPorDia,
            noWeekend: dept.noWeekend !== undefined ? dept.noWeekend : !dept.trabajaFindesemana
        });
        setSelectedUnit({
            value: dept.name || dept.nombreUnidad,
            label: dept.name || dept.nombreUnidad
        });
        setShowModal(true);
    };

    const onSubmit = (data) => {
        const unidad = {
            name: selectedUnit?.value || data.name,
            totalPeople: Number(data.totalPeople),
            maxShifts: Number(data.maxShifts),
            workersPerDay: Number(data.workersPerDay),
            noWeekend: data.noWeekend === "true" || data.noWeekend === true,
            mes, anio, idCalendario
        };
        if (editDept && typeof editDept._idx === "number") {
            setDepartments(prev =>
                prev.map((d, i) => i === editDept._idx ? { ...d, ...unidad } : d)
            );
        } else {
            setDepartments(prev => [...prev, unidad]);
        }
        setShowModal(false);
    };

    const handleDelete = (idx) => {
        setDepartments(prev => prev.filter((_, i) => i !== idx));
    };

    // Guardar todas en backend
    const guardarTodas = async () => {
        setSaving(true);
        setLoading(true);
        setError("");
        console.log("Departamentos: ", departments)
        try {
            await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras/lote`, departments);
            setError("");
            alert("¡Unidades guardadas correctamente!");
            setDepartments([]); // Opcional: limpiar después de guardar
        } catch (err) {
            setError("Error al guardar unidades en backend");
        } finally {
            setSaving(false);
            setLoading(false);
        }
    };

    return (
        <Card
            style={{
                background: "#fff",
                border: "none",
                borderRadius: 18,
                boxShadow: "0 5px 18px #b0c5e820",
                minHeight: 300,
                marginBottom: 18,
                paddingBottom: 10
            }}
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2" style={{ marginTop: -10 }}>
                    <h4 className="fw-bold" style={{ color: azulPDI, fontSize: 19, marginBottom: 0 }}>
                        Unidades agregadas para este mes/año
                    </h4>
                    <Button
                        variant="success"
                        style={{
                            borderRadius: 16,
                            fontWeight: 500,
                            fontSize: 15,
                            minWidth: 175,
                            boxShadow: "0 2px 7px #b1cfff32"
                        }}
                        onClick={openAddModal}
                        disabled={loading || saving}
                    >
                        + Agregar Unidad
                    </Button>
                </div>
                <div style={{ borderTop: "1.5px solid #e7eaf3", marginBottom: 18, marginTop: 6 }} />

                {departments.length === 0 ? (
                    <div className="text-center my-4" style={{ color: textoSecundario }}>
                        No hay unidades agregadas para este mes/año.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "1.7rem",
                            justifyContent: "flex-start",
                            marginTop: 10
                        }}
                    >
                        {departments.map((dept, idx) => (
                            <div
                                key={idx}
                                style={{
                                    minWidth: 275,
                                    maxWidth: 340,
                                    flex: "1 1 300px",
                                    background: "#fff",
                                    border: "1.5px solid #e5eaf2",
                                    borderRadius: 20,
                                    boxShadow: "0 6px 36px #bbd2ee13, 0 1.5px 6px #b0c5e824",
                                    transition: "box-shadow .17s, transform .13s, border .14s",
                                    padding: "1.7rem 1.5rem 1.4rem 1.4rem",
                                    marginBottom: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    position: "relative"
                                }}
                                className="tarjeta-depto"
                            >
                                <div>
                                    <div style={{
                                        fontWeight: 800,
                                        fontSize: 19,
                                        color: azulPDI,
                                        marginBottom: 8,
                                        letterSpacing: ".03em",
                                        textTransform: "uppercase"
                                    }}>
                                        {dept.name || dept.nombreUnidad}
                                    </div>
                                    <div style={{
                                        fontSize: 15.3,
                                        color: "#304665",
                                        marginBottom: 7,
                                        borderBottom: "1.5px solid #e9eef8",
                                        paddingBottom: 10
                                    }}>
                                        <div style={{ marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Personas:</span> <span style={{ fontWeight: 500 }}>{dept.totalPeople || dept.cantFuncAporte}</span>
                                        </div>
                                        <div style={{ marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Turnos Máx:</span> <span style={{ fontWeight: 500 }}>{dept.maxShifts || dept.maxTurnos}</span>
                                        </div>
                                        <div style={{ marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Por Día:</span> <span style={{ fontWeight: 500 }}>{dept.workersPerDay || dept.trabajadoresPorDia}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Fines de Semana:</span> <span style={{ fontWeight: 500 }}>{dept.noWeekend !== undefined ? (dept.noWeekend ? "No" : "Sí") : (dept.trabajaFindesemana ? "Sí" : "No")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 justify-content-end" style={{ marginTop: 8 }}>
                                    <OverlayTrigger placement="top" overlay={<Tooltip>Editar unidad</Tooltip>}>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            style={{ borderRadius: 12, fontWeight: 600, minWidth: 80, borderWidth: 1.5 }}
                                            onClick={() => openEditModal(dept, idx)}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-pencil-square" style={{ marginRight: 5 }} /> Editar
                                        </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar unidad</Tooltip>}>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            style={{ borderRadius: 12, fontWeight: 600, minWidth: 90, borderWidth: 1.5 }}
                                            onClick={() => handleDelete(idx)}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-trash" style={{ marginRight: 5 }} /> Eliminar
                                        </Button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 d-flex justify-content-end">
                    <Button
                        variant="primary"
                        className="px-4"
                        disabled={departments.length === 0 || saving}
                        onClick={guardarTodas}
                    >
                        {saving ? <Spinner animation="border" size="sm" /> : "Guardar Unidades"}
                    </Button>
                </div>
            </Card.Body>
            {/* Modal de agregar/editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editDept ? "Editar Unidad" : "Agregar Unidad"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <AsyncSelect
                                        {...field}
                                        cacheOptions
                                        loadOptions={debouncedLoadOptions}
                                        value={selectedUnit}
                                        onChange={(option) => {
                                            setSelectedUnit(option);
                                            field.onChange(option.value);
                                        }}
                                        placeholder="Nombre de la unidad"
                                    />
                                )}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Número Total de Personas</Form.Label>
                            <Form.Control
                                type="number"
                                {...register("totalPeople", { required: true, min: 1 })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Turnos Máximos por Unidad</Form.Label>
                            <Form.Control
                                type="number"
                                {...register("maxShifts", { required: true, min: 1 })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Trabajadores por Día</Form.Label>
                            <Form.Control
                                type="number"
                                {...register("workersPerDay", { required: true, min: 1 })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>¿Trabaja Fines de Semana?</Form.Label>
                            <Form.Select {...register("noWeekend", { required: true })}>
                                <option value={false}>Sí</option>
                                <option value={true}>No</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit" className="px-4" disabled={saving}>
                                Guardar
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
}