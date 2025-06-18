import React, { useState, useEffect } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { SUBFORMULARIOS_CATALOGO } from "./FormBuilderEditor";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import AsyncRegionesPolicialesSelect from "../../components/ComponentesAsyncSelect/AsyncRegionesPolicialesSelect.jsx";
import { useAuth } from "../../AuthContext.jsx";

// Util para inicializar un objeto de subcampos vacío según plantilla
function makeEmptySubObj(plantilla) {
    const obj = {};
    if (plantilla && plantilla.fields) {
        plantilla.fields.forEach(sf => {
            const subKey = sf.nombre || sf.name || sf.etiqueta || sf.label;
            obj[subKey] = "";
        });
    }
    return obj;
}

// Renderiza un solo campo (lo usamos para campos simples y subform)
function renderCampo(field, value, onChange, user) {
    const key = field.nombre || field.name || field.etiqueta || field.label;
    return (
        <>
            {(field.type === "text" || field.tipo === "text") && (
                <Form.Control
                    type="text"
                    value={value || ""}
                    onChange={e => onChange(key, e.target.value)}
                />
            )}
            {(field.type === "number" || field.tipo === "number") && (
                <Form.Control
                    type="number"
                    value={value || ""}
                    onChange={e => onChange(key, e.target.value)}
                />
            )}
            {(field.type === "select" || field.tipo === "select") && (
                <Form.Select
                    value={value || ""}
                    onChange={e => onChange(key, e.target.value)}
                >
                    <option value="">Seleccione</option>
                    {(field.opciones || field.options || "")
                        .toString()
                        .split(",")
                        .filter(opt => opt.trim())
                        .map((opt, oidx) => (
                            <option key={opt + oidx} value={opt}>{opt}</option>
                        ))}
                </Form.Select>
            )}
            {(field.type === "checkbox" || field.tipo === "checkbox") && (
                <Form.Check
                    type="checkbox"
                    checked={!!value}
                    onChange={e => onChange(key, e.target.checked)}
                    label={field.etiqueta || field.label || field.nombre}
                />
            )}
            {(field.type === "radio" || field.tipo === "radio") && (
                <div>
                    {(field.opciones || field.options || "")
                        .toString()
                        .split(",")
                        .filter(opt => opt.trim())
                        .map((opt, idx) => (
                            <Form.Check
                                key={opt + idx}
                                type="radio"
                                name={key}
                                label={opt}
                                value={opt}
                                checked={value === opt}
                                onChange={() => onChange(key, opt)}
                                style={{ display: "block" }}
                            />
                        ))}
                </div>
            )}
            {(field.type === "date" || field.tipo === "date") && (
                <Form.Control
                    type="date"
                    value={value || ""}
                    onChange={e => onChange(key, e.target.value)}
                />
            )}
            {(field.type === "datetime-local" || field.tipo === "datetime-local") && (
                <Form.Control
                    type="datetime-local"
                    value={value || ""}
                    onChange={e => onChange(key, e.target.value)}
                />
            )}
            {(field.type === "funcionario" || field.tipo === "funcionario") && (
                <AsyncFuncionarioSelect
                    value={value || null}
                    onChange={val => onChange(key, val)}
                    user={user}
                    isClearable
                />
            )}
            {(field.type === "unidad" || field.tipo === "unidad") && (
                <AsyncUnidadesSelect
                    value={value || null}
                    onChange={val => onChange(key, val)}
                    user={user}
                    isClearable
                />
            )}
            {(field.type === "repol" || field.tipo === "repol") && (
                <AsyncRegionesPolicialesSelect
                    value={value || null}
                    onChange={val => onChange(key, val)}
                    user={user}
                    isClearable
                />
            )}
        </>
    );
}

export default function FormularioDinamico({
                                               fields,
                                               onSubmit,
                                               initialValues = {},
                                               initialGroups = {}
                                           }) {
    const { user } = useAuth();

    const [values, setValues] = useState(initialValues);
    const [groups, setGroups] = useState(initialGroups);

    // Actualiza valores al editar, o inicializa para crear
    useEffect(() => {
        if (!fields) return;

        // Si recibes valores iniciales, úsalos
        if (
            Object.keys(initialValues).length > 0 ||
            Object.keys(initialGroups).length > 0
        ) {
            setValues(initialValues);
            setGroups(initialGroups);
            return;
        }

        // Sino, inicializa como antes (nuevo registro)
        const initialVals = {};
        const initialGrps = {};
        fields.forEach((field, idx) => {
            const key = field.nombre || field.name || field.etiqueta || `group_${idx}`;
            if (field.tipo === "group" || field.type === "group") {
                const subKey = field.subformulario || field.subFormulario || field.subForm || field.label || field.nombre || field.name;
                const plantilla = SUBFORMULARIOS_CATALOGO.find(sf =>
                    (sf.value || "").toLowerCase().trim() === (subKey || "").toLowerCase().trim()
                );
                initialGrps[key] = field.allowMultiple
                    ? [makeEmptySubObj(plantilla)]
                    : [makeEmptySubObj(plantilla)];
            } else {
                initialVals[key] = "";
            }
        });
        setValues(initialVals);
        setGroups(initialGrps);
    }, [fields, initialValues, initialGroups]);

    // Cambios de campos simples
    const handleChange = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    // Cambios dentro de grupos/subformularios
    const handleGroupChange = (groupName, idx, subName, value) => {
        setGroups(prev => {
            const clone = { ...prev };
            const entries = [...(clone[groupName] || [])];
            const entry = { ...entries[idx] };
            entry[subName] = value;
            entries[idx] = entry;
            clone[groupName] = entries;
            return clone;
        });
    };

    // Handlers para agregar/quitar instancias de subformulario
    const handleAddGroup = (groupName, plantilla) => {
        setGroups(prev => ({
            ...prev,
            [groupName]: [...(prev[groupName] || []), makeEmptySubObj(plantilla)]
        }));
    };
    const handleRemoveGroup = (groupName, idx) => {
        setGroups(prev => ({
            ...prev,
            [groupName]: prev[groupName].filter((_, i) => i !== idx)
        }));
    };

    // Envío de formulario
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const result = { ...values };
        Object.entries(groups).forEach(([key, val]) => {
            result[key] = val;
        });
        if (onSubmit) onSubmit(result);
        else alert(JSON.stringify(result, null, 2));
    };

    // Renderiza un subformulario
    const renderSubform = (field, groupVals, groupName) => {
        const subKey = field.subformulario || field.subFormulario || field.subForm || field.label || field.nombre || field.name;
        const plantilla = SUBFORMULARIOS_CATALOGO.find(sf =>
            (sf.value || "").toLowerCase().trim() === (subKey || "").toLowerCase().trim()
        );
        const subformLabel = plantilla?.label || field.etiqueta || field.label || field.nombre || groupName;

        if (!plantilla) return <div>Subformulario no encontrado</div>;
        return (
            <>
                {groupVals.map((inst, idx) => (
                    <Card key={inst.id ?? `${groupName}-block-${idx}`} className="mb-3 shadow-sm" style={{ borderRadius: 12, background: "#f4f6f9" }}>
                        <Card.Body>
                            <div className="mb-2 d-flex justify-content-between align-items-center">
                                <b>{subformLabel} #{idx + 1}</b>
                                {field.allowMultiple && groupVals.length > 1 && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRemoveGroup(groupName, idx)}
                                    >
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                            {(plantilla.fields || []).map((subf, subIdx) => {
                                const subFieldKey = subf.nombre || subf.name || subf.etiqueta || subf.label || `campo_${subIdx}`;
                                return (
                                    <Form.Group key={subf.id || subFieldKey || `${groupName}-subf-${subIdx}`} className="mb-2">
                                        <Form.Label>{subf.etiqueta || subf.label || subf.nombre || subFieldKey}</Form.Label>
                                        {renderCampo(subf, inst[subFieldKey], (name, value) => handleGroupChange(groupName, idx, name, value), user)}
                                    </Form.Group>
                                );
                            })}
                        </Card.Body>
                    </Card>
                ))}
                {field.allowMultiple && (
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleAddGroup(groupName, plantilla)}
                    >
                        + Agregar {subformLabel}
                    </Button>
                )}
            </>
        );
    };

    // Render principal
    return (
        <Form onSubmit={handleFormSubmit} className="p-4">
            {(fields || []).map((field, idx) => {
                const key = field.nombre || field.name || field.etiqueta || `group_${idx}`;
                if (field.tipo === "group" || field.type === "group") {
                    return (
                        <div key={field.id || key || idx} className="mb-4">
                            {renderSubform(field, groups[key] || [makeEmptySubObj(
                                SUBFORMULARIOS_CATALOGO.find(sf =>
                                    (sf.value || "").toLowerCase().trim() === ((field.subformulario || field.subFormulario || field.subForm || field.label || field.nombre || field.name) || "").toLowerCase().trim()
                                )
                            )], key)}
                        </div>
                    );
                }
                return (
                    <Form.Group key={field.id || key || idx} className="mb-3">
                        <Form.Label>{field.etiqueta || field.label || field.nombre || key}</Form.Label>
                        {renderCampo(field, values[key], (name, value) => handleChange(name, value), user)}
                    </Form.Group>
                );
            })}
            <div className="text-end mt-4">
                <Button type="submit" variant="primary">Enviar</Button>
            </div>
        </Form>
    );
}