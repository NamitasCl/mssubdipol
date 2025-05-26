import React, { useEffect, useState } from "react";
import { Modal, Table, Spinner, Alert, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import axios from "axios";

const doradoPDI = "#FFC700";
const azulPDI = "#17355A";
const grisOscuro = "#222938";

const ModalVerRegistrosFormulario = ({ show, onHide, formulario, user }) => {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show || !formulario || !formulario.campos) return;
        setLoading(true);
        setError(null);

        axios.get(
            `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${formulario.id}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then((resp) => {
                const data = resp.data;
                if (Array.isArray(data)) {
                    setRegistros(data);
                } else if (Array.isArray(data?.content)) {
                    setRegistros(data.content);
                } else if (data == null) {
                    setRegistros([]);
                } else {
                    setRegistros(Object.values(data));
                }
            })
            .catch(() => setError("No se pudieron cargar los registros."))
            .finally(() => setLoading(false));
    }, [show, formulario, user.token]);

    const handleExportarExcel = () => {
        if (!registros.length) return;

        const headers = [
            "#",
            ...formulario.campos.map((c) => c.etiqueta),
            "Fecha",
            "Funcionario"
        ];

        const data = registros.map((r, idx) => {
            const fila = { "#": idx + 1 };
            formulario.campos.forEach((campo) => {
                let valor = r.datos[campo.nombre];
                if (typeof valor === "boolean") valor = valor ? "Sí" : "No";
                if (valor === null || valor === undefined) valor = "-";
                fila[campo.etiqueta] = valor;
            });
            fila["Fecha"] = r.fechaRespuesta?.replace("T", " ").substring(0, 16);
            fila["Funcionario"] = r.idFuncionario;
            return fila;
        });

        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");
        XLSX.writeFile(
            wb,
            `Registros_${formulario.nombre}_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    if (!formulario || !formulario.campos) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="xl"
            dialogClassName="modal-wide-pdi"
            contentClassName="p-0"
        >
            <style>
                {`
                  .modal-wide-pdi {
                      max-width: 96vw !important;
                      width: 96vw !important;
                      margin-left: 2vw !important;
                      margin-right: 2vw !important;
                  }
                  @media (max-width: 900px) {
                      .modal-wide-pdi { max-width: 100vw !important; width: 100vw !important; }
                  }
                `}
            </style>
            <Modal.Header
                closeButton
                style={{
                    background: azulPDI,
                    borderBottom: `3px solid ${doradoPDI}`,
                }}
            >
                <Modal.Title
                    style={{
                        color: doradoPDI,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                    }}
                >
                    Registros de {formulario.nombre}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{
                    background: grisOscuro,
                    color: "#fff",
                    borderBottomLeftRadius: "1rem",
                    borderBottomRightRadius: "1rem",
                    paddingBottom: "2rem",
                    minHeight: "70vh",
                    padding: "16px",
                    overflowX: "auto",
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: "wrap" }}>
                    <div>
                        <b>Descripción:</b> {formulario.descripcion}
                    </div>
                    <Button
                        variant="outline-success"
                        style={{
                            fontWeight: 600,
                            borderRadius: "1.7rem",
                            border: `2px solid #27d884`,
                            color: "#27d884",
                            background: "transparent",
                            marginLeft: 10
                        }}
                        onClick={handleExportarExcel}
                        disabled={registros.length === 0}
                    >
                        Exportar Excel
                    </Button>
                </div>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "120px" }}>
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : registros.length === 0 ? (
                    <Alert variant="warning">No hay registros para este formulario.</Alert>
                ) : (
                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <Table
                            bordered
                            hover
                            responsive
                            className="shadow-sm"
                            style={{
                                background: "#1e2536",
                                borderRadius: ".7rem",
                                border: `1.5px solid ${doradoPDI}`,
                                color: "#fff",
                                fontSize: ".99rem",
                                minWidth: "900px",
                            }}
                        >
                            <thead>
                            <tr style={{ background: "#2a3450", color: doradoPDI }}>
                                <th>#</th>
                                {formulario.campos.map((campo, idx) => (
                                    <th key={idx} style={{ textTransform: "capitalize" }}>
                                        {campo.etiqueta}
                                    </th>
                                ))}
                                <th>Fecha</th>
                                <th>Funcionario</th>
                            </tr>
                            </thead>
                            <tbody>
                            {registros.map((r, idx) => (
                                <tr key={r.id}>
                                    <td>{idx + 1}</td>
                                    {formulario.campos.map((campo, cidx) => {
                                        // ¿Hay un label disponible? Si sí, lo muestra; si no, muestra el valor (id o texto).
                                        const valor =
                                            r.datos[`${campo.nombre}_label`] ??
                                            (typeof r.datos[campo.nombre] === "boolean"
                                                ? (r.datos[campo.nombre] ? "Sí" : "No")
                                                : r.datos[campo.nombre] ?? "-");
                                        return (
                                            <td key={cidx}>
                                                {valor}
                                            </td>
                                        );
                                    })}
                                    <td>{r.fechaRespuesta?.replace("T", " ").substring(0, 16)}</td>
                                    {/* También puedes mostrar el nombre del funcionario aquí, si lo tienes: */}
                                    <td>
                                        {r.idFuncionario}
                                    </td>
                                </tr>
                            ))}
                            </tbody>

                        </Table>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer
                style={{
                    background: "#191d2b",
                    borderTop: `2px solid ${doradoPDI}`,
                    borderBottomLeftRadius: "1rem",
                    borderBottomRightRadius: "1rem",
                }}
            >
                <Button
                    variant="outline-warning"
                    style={{
                        fontWeight: 600,
                        borderRadius: "1.7rem",
                        border: `2px solid ${doradoPDI}`,
                        color: doradoPDI,
                        background: "transparent"
                    }}
                    onClick={onHide}
                >
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalVerRegistrosFormulario;