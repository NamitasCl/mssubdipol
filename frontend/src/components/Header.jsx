import React, { useContext } from "react";
import { Navbar, Container, Button, Image } from "react-bootstrap";
import { FaSignOutAlt } from "react-icons/fa";
import PdiLogo from "../assets/imagenes/pdilogo.png"; // Ajusta la ruta si es necesario
import { useAuth } from "../AuthContext";

export default function PdiHeader() {
    const { user, logout } = useAuth();

    const handleClick = () => {
        if (user) {
            logout();
            window.location.href = "/turnos/login";
        } else {
            window.location.href = "/turnos/login";
        }
    };

    return (
        <Navbar bg="dark" variant="dark" fixed="top" className="shadow-sm rounded-0 p-0">
            <Container fluid className="d-flex justify-content-between align-items-center py-0" style={{ minHeight: "115px" }}>
                <div className="d-flex flex-column align-items-center py-2" style={{ minWidth: 160 }}>
                    <Image src={PdiLogo} alt="Logo" height={56} />
                    <h6 className="text-white text-uppercase m-0" style={{ fontSize: "0.93rem" }}>Plana Mayor Subdipol</h6>
                </div>
                <div className="d-flex flex-column align-items-center">
                    <h1 className="mb-4 fw-bold text-white" style={{ fontSize: "2.1rem" }}>RAC - SIGESPI</h1>
                    <h5 className="mt-0 fw-bold text-white" style={{ fontSize: "1.2rem" }}>Sistema Integrado de Gestión de Servicios Policiales e Institucionales</h5>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="light" onClick={() => window.location.href = 'https://rac.investigaciones.cl'}>
                        Volver a RAC
                    </Button>
                    <Button
                        variant="outline-light"
                        className="d-flex align-items-center gap-2"
                        onClick={handleClick}
                    >
                        <span>{user ? "Cerrar sesión" : "Iniciar sesión"}</span>
                        <FaSignOutAlt />
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
}
