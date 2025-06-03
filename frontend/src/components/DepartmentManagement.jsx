import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import debounce from "lodash.debounce";
import { Button, Card, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import {FaArrowLeft} from "react-icons/fa";

// Paleta institucional
const azulPDI = "#17355A";
const azulBoton = "#2565c7";
const grisClaro = "#eceff4";
const textoSecundario = "#4a5975";

export function DepartmentManagement({ departments, setDepartments, setModo }) {
    const [showModal, setShowModal] = useState(false);
    const [editDept, setEditDept] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const { control, register, handleSubmit, reset } = useForm();

    const openAddModal = () => {
        setEditDept(null);
        setSelectedUnit(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (dept) => {
        setEditDept(dept);
        reset(dept);
        setSelectedUnit({ value: dept.name, label: dept.name });
        setShowModal(true);
    };

    const onSubmit = (data) => {
        data.totalPeople = Number(data.totalPeople);
        data.maxShifts = Number(data.maxShifts);
        data.workersPerDay = Number(data.workersPerDay);
        data.noWeekend = (data.noWeekend === "true" || data.noWeekend === true);
        data.name = selectedUnit?.value || data.name;

        if (editDept) {
            setDepartments((prev) =>
                prev.map(d => d.id === editDept.id ? { ...d, ...data } : d)
            );
        } else {
            data.id = Date.now();
            setDepartments((prev) => [...prev, data]);
        }
        setShowModal(false);
    };

    const loadOptions = (inputValue, callback) => {
        if (inputValue.length < 3) {
            callback([]);
            return;
        }
        axios
            .get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar`, {
                params: { nombre: inputValue }
            })
            .then(response => {
                const options = response.data.map(funcionario => ({
                    value: funcionario.siglasUnidad,
                    label: funcionario.nombreUnidad
                }));
                callback(options);
            })
            .catch(err => {
                console.error("Error al obtener la unidad", err);
                callback([]);
            });
    };
    const debouncedLoadOptions = debounce(loadOptions, 300);

    const handleDelete = (id) => {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
    };

    return (
        <Card
            style={{
                background: "#fff",
                border: "none",
                borderRadius: 18,
                boxShadow: "0 5px 18px #b0c5e820",
                minHeight: 350,
                marginBottom: 18,
                paddingBottom: 10
            }}
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2" style={{ marginTop: -10 }}>
                    <div className={"d-flex gap-3 align-items-center"}>
                        <Button variant={"warning"} size={"sm"} style={{width: 80}} onClick={() => setModo(null)}>
                            <FaArrowLeft style={{ marginRight: 7, fontSize: 17 }} />
                            Hola
                        </Button>
                        <h3
                            className="fw-bold"
                            style={{
                                color: azulPDI,
                                fontSize: 21,
                                letterSpacing: ".04em",
                                marginBottom: 0
                            }}
                        >
                            Gestión de Departamentos
                        </h3>
                    </div>
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
                    >
                        + Agregar Unidad
                    </Button>
                </div>
                <div style={{ borderTop: "1.5px solid #e7eaf3", marginBottom: 18, marginTop: 6 }} />

                {departments.length === 0 ? (
                    <div className="text-center my-4" style={{ color: textoSecundario }}>
                        No hay departamentos registrados.
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
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
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
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 10px 40px #b5cdfb32, 0 2px 7px #19374a12";
                                    e.currentTarget.style.border = "2.5px solid #86acf9";
                                    e.currentTarget.style.transform = "translateY(-3px) scale(1.015)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 6px 36px #bbd2ee13, 0 1.5px 6px #b0c5e824";
                                    e.currentTarget.style.border = "1.5px solid #e5eaf2";
                                    e.currentTarget.style.transform = "none";
                                }}
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
                                        {dept.name}
                                    </div>
                                    <div style={{
                                        fontSize: 15.3,
                                        color: "#304665",
                                        marginBottom: 7,
                                        borderBottom: "1.5px solid #e9eef8",
                                        paddingBottom: 10
                                    }}>
                                        <div style={{ marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Personas:</span> <span style={{ fontWeight: 500 }}>{dept.totalPeople}</span>
                                        </div>
                                        <div style={{ marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Turnos Máx:</span> <span style={{ fontWeight: 500 }}>{dept.maxShifts}</span>
                                        </div>
                                        <div style={{ marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Por Día:</span> <span style={{ fontWeight: 500 }}>{dept.workersPerDay}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 700, color: "#335387" }}>Fines de Semana:</span> <span style={{ fontWeight: 500 }}>{dept.noWeekend ? "No" : "Sí"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 justify-content-end" style={{ marginTop: 8 }}>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Editar departamento</Tooltip>}
                                    >
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            style={{
                                                borderRadius: 12,
                                                fontWeight: 600,
                                                minWidth: 80,
                                                borderWidth: 1.5
                                            }}
                                            onClick={() => openEditModal(dept)}
                                        >
                                            <i className="bi bi-pencil-square" style={{ marginRight: 5 }} /> Editar
                                        </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Eliminar departamento</Tooltip>}
                                    >
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            style={{
                                                borderRadius: 12,
                                                fontWeight: 600,
                                                minWidth: 90,
                                                borderWidth: 1.5
                                            }}
                                            onClick={() => handleDelete(dept.id)}
                                        >
                                            <i className="bi bi-trash" style={{ marginRight: 5 }} /> Eliminar
                                        </Button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card.Body>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editDept ? "Editar Departamento" : "Agregar Departamento"}
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
                            <Button variant="primary" type="submit" className="px-4">
                                Guardar
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
}