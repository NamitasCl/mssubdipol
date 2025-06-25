import React, { useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Navbar,
    Nav,
    Image as BImage,
    Button,
    Card,
} from "react-bootstrap";
import { FaUserCircle, FaSignOutAlt, FaChevronRight, FaUsersCog, FaList, FaUserShield, FaKey, FaDatabase } from "react-icons/fa";
import PdiLogo from "../../assets/imagenes/pdilogo.png"; // Usa la ruta adecuada
import { useAuth } from "../../components/contexts/AuthContext.jsx";

// Paleta de colores (igual que tu layout principal)
const azulBase = "#2a4d7c";
const azulMedio = "#4f7eb9";
const azulClaro = "#b1cfff";
const azulSidebar = "#eaf4fb";
const blanco = "#fff";
const grisClaro = "#f8fbfd";
const textoPrincipal = "#22334a";
const doradoSuave = "#ffe8a3";

// Roles
const ROLES = {
    ADMINISTRADOR: "ROLE_ADMINISTRADOR"
};

// Menú de administración (puedes extender con más secciones)
const adminNavConfig = [
    {
        label: "Usuarios",
        icon: <FaUsersCog />,
        to: "/admin/usuarios",
        allowedRoles: [ROLES.ADMINISTRADOR]
    },
    {
        label: "Listas maestras",
        icon: <FaList />,
        submenu: [
            { label: "Comunas", to: "/admin/listas/comunas", icon: <FaDatabase /> },
            { label: "Regiones", to: "/admin/listas/regiones", icon: <FaDatabase /> },
            { label: "Cargos", to: "/admin/listas/cargos", icon: <FaDatabase /> },
            { label: "Roles", to: "/admin/listas/roles", icon: <FaUserShield /> },
            { label: "Permisos", to: "/admin/listas/permisos", icon: <FaKey /> }
        ],
        allowedRoles: [ROLES.ADMINISTRADOR]
    },
    {
        label: "Logs y Auditoría",
        icon: <FaDatabase />,
        to: "/admin/logs",
        allowedRoles: [ROLES.ADMINISTRADOR]
    }
];

export default function AdminLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState({});

    const handleClickLogout = () => {
        logout();
        window.location.href = "/turnos/login";
    };

    const visibleNavItems = useMemo(() => {
        if (user && user.roles) {
            return adminNavConfig.filter((item) =>
                item.allowedRoles?.some((rol) => user.roles.includes(rol))
            );
        }
        return [];
    }, [user]);

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    return (
        <div style={{ minHeight: "100vh", background: grisClaro }}>
            {/* Header */}
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
                                Administración del sistema
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
                            onClick={handleClickLogout}
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

            {/* Main Content with Sidebar */}
            <Container fluid style={{ maxWidth: 1920 }}>
                <Row className="flex-nowrap" style={{ minHeight: "calc(100vh - 80px)" }}>
                    {/* Sidebar */}
                    <Col
                        md={2}
                        style={{
                            background: azulSidebar,
                            borderRight: `2px solid ${azulClaro}`,
                            minHeight: "85vh",
                            minWidth: 220,
                            maxWidth: 270,
                            paddingTop: 22,
                            paddingBottom: 20,
                            paddingLeft: 0,
                            paddingRight: 0,
                            boxShadow: "1.5px 0 9px #bfd3f325",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            zIndex: 2,
                            fontSize: 17
                        }}
                    >
                        <Nav className="flex-column w-100">
                            {visibleNavItems.map((item) => {
                                const isSubmenu = !!item.submenu;
                                const isActive = location.pathname === item.to;
                                const isAnySubActive = isSubmenu && item.submenu.some((sub) => location.pathname === sub.to);
                                const isOpen = openMenus[item.label] || isAnySubActive;

                                if (isSubmenu) {
                                    return (
                                        <div key={item.label} className="w-100">
                                            {/* Título del submenú */}
                                            <div
                                                onClick={() => toggleMenu(item.label)}
                                                className={`
                                                  my-1 py-2 px-3
                                                  rounded-pill
                                                  d-flex align-items-center gap-2
                                                  ${isAnySubActive ? "fw-bold shadow-sm" : ""}
                                                `}
                                                style={{
                                                    background: isAnySubActive ? azulMedio : "transparent",
                                                    color: isAnySubActive ? blanco : textoPrincipal,
                                                    fontSize: 14,
                                                    marginLeft: 10,
                                                    marginRight: 8,
                                                    cursor: "pointer",
                                                    transition: "background 0.2s, color 0.2s",
                                                }}
                                            >
                                                <FaChevronRight
                                                    size={19}
                                                    style={{
                                                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                                                        transition: "transform 0.2s",
                                                        opacity: isAnySubActive ? 1 : 0.6,
                                                    }}
                                                />
                                                {item.icon}
                                                {item.label}
                                            </div>
                                            {/* Subitems */}
                                            {isOpen && (
                                                <div className="w-100">
                                                    {item.submenu.map((subitem) => {
                                                        const isActive = location.pathname === subitem.to;
                                                        return (
                                                            <Nav.Link
                                                                as={Link}
                                                                to={subitem.to}
                                                                key={subitem.to}
                                                                className={`
                                                                  my-1 py-2 px-4
                                                                  rounded-pill
                                                                  d-flex align-items-center gap-2
                                                                  ${isActive ? "fw-bold shadow-sm" : ""}
                                                                `}
                                                                style={{
                                                                    background: isActive ? azulMedio : "transparent",
                                                                    color: isActive ? blanco : textoPrincipal,
                                                                    fontSize: 13.5,
                                                                    marginLeft: 20,
                                                                    marginRight: 8,
                                                                    letterSpacing: 0.1,
                                                                    transition: "background 0.2s, color 0.2s",
                                                                }}
                                                            >
                                                                <FaChevronRight size={16} style={{ opacity: isActive ? 1 : 0.5 }} />
                                                                {subitem.icon}
                                                                {subitem.label}
                                                            </Nav.Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Ítem sin submenú
                                return (
                                    <Nav.Link
                                        as={Link}
                                        to={item.to}
                                        key={item.to}
                                        className={`
                                          my-1 py-2 px-3
                                          rounded-pill
                                          d-flex align-items-center gap-2
                                          ${isActive ? "fw-bold shadow-sm" : ""}
                                        `}
                                        style={{
                                            background: isActive ? azulMedio : "transparent",
                                            color: isActive ? blanco : textoPrincipal,
                                            fontSize: 14,
                                            marginLeft: 10,
                                            marginRight: 8,
                                            letterSpacing: 0.1,
                                            boxShadow: isActive ? "0 2px 8px #4f7eb950" : undefined,
                                            transition: "background 0.16s, color 0.16s",
                                        }}
                                    >
                                        {item.icon}
                                        <FaChevronRight size={19} style={{ opacity: isActive ? 1 : 0.6 }} />
                                        {item.label}
                                    </Nav.Link>
                                );
                            })}
                        </Nav>
                    </Col>

                    {/* Main content */}
                    <Col
                        md={10}
                        style={{
                            background: grisClaro,
                            minHeight: "85vh",
                            borderRadius: "32px 0 0 32px",
                            boxShadow: "-6px 0 42px #b1bed91b inset",
                            padding: "18px 18px 20px 18px",
                            zIndex: 1,
                            maxWidth: "100%"
                        }}
                    >
                        <Card
                            style={{
                                background: blanco,
                                border: "none",
                                borderRadius: 15,
                                boxShadow: "0 8px 36px #b0c5e820",
                                padding: 0,
                                minHeight: "79vh",
                                overflow: "visible",
                                maxWidth: "100%",
                                fontSize: 16.3,
                            }}
                        >
                            <Card.Body className="p-2">
                                <Outlet />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}