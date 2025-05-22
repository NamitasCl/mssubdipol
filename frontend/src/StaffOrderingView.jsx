// StaffOrderingView.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";

// Ejemplo de ranking
function getRankScore(rankFull) {
    const isOPP = rankFull.includes("(OPP)");
    const baseRank = rankFull.replace("(OPP)", "").trim();

    // Asigna valores de mayor a menor antigüedad (SPF es el mayor).
    const rankMap = {
        "DTV": 1,
        "SBI": 2,
        "ISP": 3,
        "SBC": 4,
        "COM": 5,
        "SPF": 6
    };

    const score = rankMap[baseRank] || 0;
    return { score, isOPP };
}

function sortBySeniority(employees) {
    // Ordenar: SPF > COM > SBC > ISP > SBI > DTV
    // Misma jerarquía: línea más antiguo que OPP
    // Mismo escalafón (ambos OPP o ambos línea): menor antiguedad => más antiguo
    return employees.slice().sort((a, b) => {
        const aRank = getRankScore(a.grado);
        const bRank = getRankScore(b.grado);

        // 1) rank
        if (aRank.score !== bRank.score) {
            return bRank.score - aRank.score;
        }
        // 2) OPP vs línea
        if (aRank.isOPP && !bRank.isOPP) {
            return 1;
        }
        if (!aRank.isOPP && bRank.isOPP) {
            return -1;
        }
        // 3) antiguedad
        return a.antiguedad - b.antiguedad;
    });
}

const ROLES = [
    "Jefe de Servicio",
    "1a Guardia Principal Encargado",
    "1a Guardia Prevención Encargado",
    "2a Guardia Principal Encargado",
    "2a Guardia Prevención Encargado",
    "1a Guardia Principal Ayudante",
    "1a Guardia Prevención Ayudante",
    "2a Guardia Principal Ayudante",
    "2a Guardia Prevención Ayudante"
];

function StaffOrderingView({ assignedStaff }) {
    // assignedStaff = [ { uuid, nombre, grado, antiguedad, ... } ]

    const [orderedStaff, setOrderedStaff] = useState([]);
    const [rolesMap, setRolesMap] = useState({});

    useEffect(() => {
        // Ordena por antigüedad al montar
        const sorted = sortBySeniority(assignedStaff);
        setOrderedStaff(sorted);
    }, [assignedStaff]);

    const handleRoleChange = (uuid, newRole) => {
        setRolesMap(prev => ({
            ...prev,
            [uuid]: newRole
        }));
    };

    const handleSave = () => {
        console.log("Roles asignados:", rolesMap);
        // Aquí podrías hacer un POST/PUT a tu backend con {assignedStaff: rolesMap}
        alert("Roles guardados (ver console)");
    };

    return (
        <Container className="my-4">
            <Card>
                <Card.Header>
                    <strong>Asignar Roles por Antigüedad</strong>
                </Card.Header>
                <Card.Body>
                    {orderedStaff.map((staff, idx) => (
                        <div
                            key={staff.uuid}
                            className="d-flex justify-content-between align-items-center mb-2"
                        >
                            <div>
                                <strong>{idx + 1}.</strong> {staff.nombre} ({staff.grado}, antig: {staff.antiguedad})
                            </div>
                            <Form.Select
                                style={{ maxWidth: "300px" }}
                                value={rolesMap[staff.uuid] || ""}
                                onChange={(e) => handleRoleChange(staff.uuid, e.target.value)}
                            >
                                <option value="">Seleccionar rol...</option>
                                {ROLES.map((rol) => (
                                    <option key={rol} value={rol}>
                                        {rol}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                    ))}
                    <Button onClick={handleSave}>Guardar Roles</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default StaffOrderingView;