import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import {
    SUBFORMULARIOS_CATALOGO,
} from "./FormBuilderEditor";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import AsyncRegionesPolicialesSelect from "../../components/ComponentesAsyncSelect/AsyncRegionesPolicialesSelect.jsx";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

/* ─────── Util para un subformulario vacío ─────────────────────────────── */
function makeEmptySubObj(plantilla) {
    const obj = {};
    if (plantilla?.fields) {
        plantilla.fields.forEach((f) => {
            const k = f.nombre || f.name || f.etiqueta || f.label;
            obj[k] = "";
        });
    }
    return obj;
}

/* ─────── Renderiza un campo simple ────────────────────────────────────── */
function renderCampo(field, value, onChange, user) {
    const key = field.nombre || field.name || field.etiqueta || field.label;


    return (
        <>
            {(field.type === "text" || field.tipo === "text") && (
                <Form.Control
                    type="text"
                    value={value ?? ""}
                    onChange={(e) => onChange(key, e.target.value)}
                />
            )}

            {(field.type === "number" || field.tipo === "number") && (
                <Form.Control
                    type="number"
                    value={value ?? ""}
                    onChange={(e) => onChange(key, e.target.value)}
                />
            )}

            {(field.type === "select" || field.tipo === "select") && (
                <Form.Select
                    value={value ?? ""}
                    onChange={(e) => onChange(key, e.target.value)}
                >
                    <option value="">Seleccione</option>
                    {(field.opciones || field.options || "")
                        .toString()
                        .split(",")
                        .filter((opt) => opt.trim())
                        .map((opt, idx) => (
                            <option key={`${opt}-${idx}`} value={opt}>
                                {opt}
                            </option>
                        ))}
                </Form.Select>
            )}

            {(field.type === "checkbox" || field.tipo === "checkbox") && (
                <Form.Check
                    type="checkbox"
                    checked={!!value}
                    label={field.etiqueta || field.label || field.nombre}
                    onChange={(e) => onChange(key, e.target.checked)}
                />
            )}

            {(field.type === "radio" || field.tipo === "radio") && (
                <div>
                    {(field.opciones || field.options || "")
                        .toString()
                        .split(",")
                        .filter((opt) => opt.trim())
                        .map((opt, idx) => (
                            <Form.Check
                                key={`${opt}-${idx}`}
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
                    value={value ?? ""}
                    onChange={(e) => onChange(key, e.target.value)}
                />
            )}

            {(field.type === "datetime-local" || field.tipo === "datetime-local") && (
                <Form.Control
                    type="datetime-local"
                    value={value ?? ""}
                    onChange={(e) => onChange(key, e.target.value)}
                />
            )}

            {(field.type === "funcionario" || field.tipo === "funcionario") && (
                <AsyncFuncionarioSelect
                    value={value ?? null}
                    onChange={(val) => onChange(key, val)}
                    user={user}
                    isClearable
                />
            )}

            {(field.type === "unidad" || field.tipo === "unidad") && (
                <AsyncUnidadesSelect
                    value={value ?? null}
                    onChange={(val) => onChange(key, val)}
                    user={user}
                    isClearable
                />
            )}

            {(field.type === "repol" || field.tipo === "repol") && (
                <AsyncRegionesPolicialesSelect
                    value={value ?? null}
                    onChange={(val) => onChange(key, val)}
                    user={user}
                    isClearable
                />
            )}
        </>
    );
}

/* ─────── Componente principal ─────────────────────────────────────────── */
export default function FormularioDinamico({
                                               fields,
                                               initialValues = {},          // datos existentes ({} para alta)
                                               registroId = null,           // null = crear | nº = editar
                                               onSubmit,                    // callback(values, registroId)
                                           }) {
    const { user } = useAuth();

    /* ---------- estado ---------- */
    const [values, setValues] = useState(() => {
        /* une valores existentes + nuevos vacíos */
        const all = { ...initialValues };
        (fields ?? []).forEach((f, idx) => {
            const k = f.nombre || f.name || f.etiqueta || `group_${idx}`;
            if (!(k in all)) {
                all[k] = f.tipo === "group" || f.type === "group" ? [] : "";
            }
        });
        return all;
    });

    /* ---------- handlers campos simples ---------- */
    const handleChange = (name, value) =>
        setValues((prev) => ({ ...prev, [name]: value }));

    /* ---------- handlers subformularios ---------- */
    const handleGroupChange = (group, idx, sub, value) =>
        setValues((prev) => {
            const arr = Array.isArray(prev[group]) ? [...prev[group]] : [];
            arr[idx] = { ...arr[idx], [sub]: value };
            return { ...prev, [group]: arr };
        });

    const handleAddGroup = (group, plantilla) =>
        setValues((prev) => ({
            ...prev,
            [group]: [...(prev[group] ?? []), makeEmptySubObj(plantilla)],
        }));

    const handleRemoveGroup = (group, idx) =>
        setValues((prev) => ({
            ...prev,
            [group]: (prev[group] ?? []).filter((_, i) => i !== idx),
        }));

    /* ---------- envío ---------- */
    const submit = (e) => {
        e.preventDefault();
        onSubmit?.(values, registroId);
    };

    /* ---------- render subform ---------- */
    const renderSubform = (field, groupVals, groupName) => {
        const subKey =
            field.subformulario ||
            field.subFormulario ||
            field.subForm ||
            field.label ||
            field.nombre ||
            field.name;

        const plantilla = SUBFORMULARIOS_CATALOGO.find(
            (sf) =>
                (sf.value || "").toLowerCase().trim() ===
                (subKey || "").toLowerCase().trim()
        );

        const subLabel =
            plantilla?.label ||
            field.etiqueta ||
            field.label ||
            field.nombre ||
            groupName;

        if (!plantilla) return <div>Subformulario no encontrado</div>;

        return (
            <>
                {groupVals.map((inst, idx) => (
                    <Card
                        key={`block-${idx}`}
                        className="mb-3 shadow-sm"
                        style={{ borderRadius: 12, background: "#f4f6f9" }}
                    >
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <b>
                                    {subLabel} #{idx + 1}
                                </b>
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
                                const subKeyF =
                                    subf.nombre ||
                                    subf.name ||
                                    subf.etiqueta ||
                                    subf.label ||
                                    `campo_${subIdx}`;

                                return (
                                    <Form.Group key={subKeyF} className="mb-2">
                                        <Form.Label>
                                            {subf.etiqueta || subf.label || subf.nombre || subKeyF}
                                        </Form.Label>
                                        {renderCampo(
                                            subf,
                                            inst[subKeyF],
                                            (n, v) =>
                                                handleGroupChange(groupName, idx, n, v),
                                            user
                                        )}
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
                        + Agregar {subLabel}
                    </Button>
                )}
            </>
        );
    };

    /* ---------- render principal ---------- */
    return (
        <Form onSubmit={submit} className="p-4">
            {(fields || []).map((field, idx) => {
                const key =
                    field.nombre ||
                    field.name ||
                    field.etiqueta ||
                    `group_${idx}`;

                /* ----- grupos ----- */
                if (field.tipo === "group" || field.type === "group") {
                    const groupVals =
                        Array.isArray(values[key]) && values[key].length
                            ? values[key]
                            : [
                                makeEmptySubObj(
                                    SUBFORMULARIOS_CATALOGO.find(
                                        (sf) =>
                                            (sf.value || "").toLowerCase().trim() ===
                                            (
                                                field.subformulario ||
                                                field.subFormulario ||
                                                field.subForm ||
                                                field.label ||
                                                field.nombre ||
                                                field.name
                                            )
                                                .toLowerCase()
                                                .trim()
                                    )
                                ),
                            ];

                    return (
                        <div key={key} className="mb-4">
                            {renderSubform(field, groupVals, key)}
                        </div>
                    );
                }

                /* ----- campos simples ----- */
                return (
                    <Form.Group key={key} className="mb-3">
                        <Form.Label>
                            {field.etiqueta || field.label || field.nombre || key}
                        </Form.Label>
                        {renderCampo(field, values[key], handleChange, user)}
                    </Form.Group>
                );
            })}

            <div className="text-end mt-4">
                <Button type="submit" variant="primary">
                    {registroId ? "Actualizar" : "Guardar"}
                </Button>
            </div>
        </Form>
    );
}