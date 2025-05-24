import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import ModalVerRegistrosFormulario from "./ModalVerRegistrosFormulario";
import FormularioDinamico from "./FormularioDinamico"; // 👈 tu componente para agregar registro
import Permiso from "../../components/Permiso";
import { useAuth } from "../../AuthContext";

const rolesPermitidos = ["ROLE_ADMINISTRADOR", "ROLE_JEFE"];
const usuariosPermitidos = [12254, 3023, 6789];
//const unidadesPermitidas = ["BRIDECMET"];

const ListaFormulariosDisponibles = () => {
    const { user } = useAuth();
    const [formularios, setFormularios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [modalRegistros, setModalRegistros] = useState({ show: false, formulario: null });
    const [modalAgregar, setModalAgregar] = useState({ show: false, formulario: null });

    // Recarga lista tras agregar registro
    const recargarFormularios = () => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`)
            .then(({ data }) => setFormularios(data))
            .catch(() => setError("Error cargando formularios"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        recargarFormularios();
    }, []);

    const handleVerRegistros = (formulario) => {
        setModalRegistros({ show: true, formulario });
    };

    const handleAgregarRegistro = (formulario) => {
        setModalAgregar({ show: true, formulario });
    };

    return (
        <div style={{ background: "rgba(28,36,48,0.96)", padding: 16, borderRadius: "1.1rem" }}>
            <h4 style={{ color: "#FFC700", borderLeft: "5px solid #FFC700", paddingLeft: 12 }}>Formularios Disponibles</h4>
            {loading ? (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Table striped bordered hover responsive className="mt-3" style={{ background: "#222938", color: "#fff" }}>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Formulario</th>
                        <th>Descripción</th>
                        <th>Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {formularios.map((f, idx) => (
                        <tr key={f.id}>
                            <td>{idx + 1}</td>
                            <td>{f.nombre}</td>
                            <td>{f.descripcion}</td>
                            <td>
                                <Permiso
                                    user={user}
                                    roles={rolesPermitidos}
                                    usuarios={usuariosPermitidos}
                                    //unidades={unidadesPermitidas}
                                >
                                    <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => handleVerRegistros(f)}
                                        className="me-2"
                                    >
                                        Ver registros
                                    </Button>
                                </Permiso>
                                <Permiso
                                    user={user}
                                    roles={rolesPermitidos}
                                    usuarios={usuariosPermitidos}
                                    //unidades={unidadesPermitidas}
                                >
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleAgregarRegistro(f)}
                                    >
                                        Agregar registro
                                    </Button>
                                </Permiso>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            {/* Modal de registros */}
            <ModalVerRegistrosFormulario
                show={modalRegistros.show}
                onHide={() => setModalRegistros({ show: false, formulario: null })}
                formulario={modalRegistros.formulario}
                user={user}
            />

            {/* Modal de agregar registro */}
            {modalAgregar.show && modalAgregar.formulario && (
                <div
                    style={{
                        position: "fixed",
                        top: 0, left: 0, width: "100vw", height: "100vh",
                        background: "rgba(0,0,0,0.45)", zIndex: 2000,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    <div style={{ minWidth: 400, background: "#202a3e", borderRadius: "1.2rem", padding: 20, boxShadow: "0 7px 32px #0008", maxWidth: "98vw" }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 style={{ color: "#FFC700", margin: 0 }}>Agregar registro: {modalAgregar.formulario.nombre}</h5>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                style={{ borderRadius: "1.5rem", border: "2px solid #FFC700", color: "#FFC700" }}
                                onClick={() => setModalAgregar({ show: false, formulario: null })}
                            >Cerrar</Button>
                        </div>
                        <FormularioDinamico
                            formularioId={modalAgregar.formulario.id}
                            user={user}
                            onSuccess={() => {
                                setModalAgregar({ show: false, formulario: null });
                                recargarFormularios();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaFormulariosDisponibles;
