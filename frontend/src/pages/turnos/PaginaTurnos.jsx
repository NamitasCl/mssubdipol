// En tu página:
import SelectorTipoTurno from "./SelectorTipoTurno";
import { useScope } from "../../components/contexts/ScopeContext.jsx";
import {Button, Container, Image as BImage, Navbar} from "react-bootstrap";
import PdiLogo from "../../assets/imagenes/pdilogo.png";
import {FaSignOutAlt, FaUserCircle} from "react-icons/fa";
import React from "react";
import {useAuth} from "../../AuthContext.jsx";
import Layout from "../../Layout.jsx";
import UnitAssignmentView from "./UnitAssignmentView.jsx";
import GestionTurnos from "./GestionTurnos.jsx"; // si usas el contexto sugerido

// PALETA
const azulBase = "#2a4d7c";
const azulClaro = "#b1cfff";
const blanco = "#fff";
const doradoSuave = "#ffe8a3";

export default function PaginaTurnos() {
    const { scope, setScope } = useScope();
    const { user, logout } = useAuth();

    if (!scope?.tipo) {
        return (
            <>
                <Navbar
                    expand="lg"
                    style={{
                        background: azulBase,
                        boxShadow: "0 2px 18px #23395d22",
                        minHeight: 64,
                        padding: "0.8rem 0",
                    }}
                    className="mb-2"
                >
                    <Container fluid style={{ maxWidth: 1920 }}>
                        <div className="d-flex align-items-center gap-3">
                            <BImage src={PdiLogo} alt="Logo" height={48} />
                            <div>
                                <h4 className="mb-0 fw-bold" style={{ color: blanco, letterSpacing: 1.2, fontSize: 24 }}>
                                    Plataforma de gestión de turnos
                                </h4>
                                <span className="small" style={{ color: doradoSuave }}>
                Subdirección de Investigación Policial y Criminalística
              </span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <FaUserCircle size={26} color={blanco} />
                            <span style={{ color: blanco, fontWeight: 600, fontSize: 17 }}>
              {user?.nombreUsuario || "Usuario"}
            </span>
                            <Button
                                variant="light"
                                onClick={() => logout()}
                                className="rounded-pill px-3 d-flex align-items-center"
                                style={{
                                    borderColor: azulClaro,
                                    color: azulBase,
                                    fontWeight: 600,
                                    fontSize: 16,
                                }}
                            >
                                <FaSignOutAlt className="me-2" />
                                Cerrar sesión
                            </Button>
                        </div>
                    </Container>
                </Navbar>
                <SelectorTipoTurno
                    onSeleccion={tipo => {
                        setScope({ tipo });
                    }}
                />
            </>
        );
    }

    return <Layout />;
}