import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import axios from "axios";
import debounce from "lodash.debounce";
import {Button, Card, Form, Modal} from "react-bootstrap";
import AsyncSelect from "react-select/async";

/**
 * Gestor de departamentos: Agregar, editar, eliminar. (Ejemplo)
 */
export function DepartmentManagement({ departments, setDepartments }) {
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
        // Si es string, convertir a { value, label }
        setSelectedUnit({ value: dept.name, label: dept.name });
        setShowModal(true);
    };

    const onSubmit = (data) => {
        data.totalPeople = Number(data.totalPeople);
        data.maxShifts = Number(data.maxShifts);
        data.workersPerDay = Number(data.workersPerDay);
        data.noWeekend = (data.noWeekend === "true" || data.noWeekend === true);

        // Asegura que solo se guarde el string, no el objeto
        data.name = selectedUnit?.value || data.name;

        if (editDept) {
            // Editar
            setDepartments((prev) =>
                prev.map(d => d.id === editDept.id ? { ...d, ...data } : d)

            );
        } else {
            // Agregar
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
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-secondary text-white">
                <strong>Gestión de Departamentos</strong>
            </Card.Header>
            <Card.Body>
                <Button variant="success" onClick={openAddModal} className="mb-3">
                    Agregar Departamento
                </Button>
                {departments.length === 0 ? (
                    <p>No hay departamentos.</p>
                ) : (
                    <ul className="list-group">
                        {departments.map((dept) => (
                            <li
                                key={dept.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{dept.name}</strong> —{" "}
                                    Personas: {dept.totalPeople} —{" "}
                                    Turnos Máx: {dept.maxShifts ?? "∞"} —{" "}
                                    Por Día: {dept.workersPerDay ?? "N/A"} —{" "}
                                    Fines de Semana: {dept.noWeekend ? "No" : "Sí"}
                                </div>
                                <div>
                                    <Button
                                        variant="outline-info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openEditModal(dept)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(dept.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
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
                                            field.onChange(option.value); // Guarda sólo string
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

                        <Button variant="primary" type="submit">
                            Guardar
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
}