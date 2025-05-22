import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";

/**
 * Componente reutilizable de Toast (notificación emergente).
 *
 * Props:
 * - show: booleano que indica si el toast está visible.
 * - onClose: función para cerrar el toast.
 * - message: texto del mensaje a mostrar.
 * - bg: color de fondo (opcional): "success", "danger", "warning", "info", "primary", "dark", etc.
 * - delay: tiempo en ms antes de cerrarse automáticamente (opcional, default 3000)
 * - autohide: si debe cerrarse solo después del delay (default true)
 */
const CustomToast = ({ show, onClose, message, bg = "dark", delay = 3000, autohide = true }) => {
    return (
        <ToastContainer position="top-end" className="p-3">
            <Toast onClose={onClose} show={show} delay={delay} autohide={autohide} bg={bg}>
                <Toast.Header closeButton={true}>
                    <strong className="me-auto">Notificación</strong>
                </Toast.Header>
                <Toast.Body className="text-white">{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default CustomToast;
