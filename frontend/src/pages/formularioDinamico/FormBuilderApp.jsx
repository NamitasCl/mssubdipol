import FormularioDinamico from "./FormularioDinamico.jsx";
import FormBuilderEditor from "./FormBuilderEditor.jsx";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import {useAuth} from "../../components/contexts/AuthContext.jsx";

const azulSuave = "#7fa6da";

function FormBuilderApp() {
    const [fields, setFields] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const navigate = useNavigate();

    const {user} = useAuth();

    // Botón volver
    const handleBack = () => {
        navigate("/servicios-especiales");
    };

    const handleShowPreview = () => {
        console.log(fields)
        setShowPreview(true)
    }

    return (
        <div style={{
            marginTop: 32, padding: 16,
            display: "flex",
            justifyContent: "center",
            position: "relative"
        }}>
            {/* Botón Volver arriba a la izquierda */}
            <Button
                variant="outline-primary"
                size="sm"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: `1.5px solid ${azulSuave}`,
                    color: azulSuave,
                    fontWeight: 600,
                    boxShadow: "0 2px 8px #a6c8e221",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    zIndex: 20
                }}
                onClick={handleBack}
            >
                <FaArrowLeft style={{ fontSize: 18 }} />
                Volver
            </Button>

            <div style={{
                width: "80vw", minWidth: 500,
                margin: "auto", position: "relative"
            }}>
                <FormBuilderEditor fields={fields} setFields={setFields} />
                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <Button
                        variant="success"
                        size="lg"
                        style={{ fontWeight: "bold", letterSpacing: 1 }}
                        onClick={() => handleShowPreview()}
                        disabled={fields.length === 0}
                    >
                        Vista previa del formulario
                    </Button>
                </div>
                <Modal
                    show={showPreview}
                    onHide={() => setShowPreview(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Vista previa del Formulario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ background: "#f8fafd" }}>
                        <FormularioDinamico fields={fields} user={user} />
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
}

export default FormBuilderApp;
