// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/HistorialRevisiones.jsx
import React from "react";
import {Alert, Badge, ListGroup, Spinner} from "react-bootstrap";
import {useAuth} from "../../../components/contexts/AuthContext.jsx";
import {obtenerHistorialRevisiones} from "../../../api/nodosApi.js";
import {estadoColors} from "../utils/auditoriaMemosUtils.js";

const rolBadgeVariant = (rol) => {
  const r = String(rol || "").toUpperCase();
  if (r === "JEFE") return "primary";
  if (r === "CONTRALOR") return "info";
  return "secondary"; // PLANA, PM u otros
};

const formatFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  try {
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString();
  }
};

export default function HistorialRevisiones({memoId}) {
  const {user} = useAuth();
  const token = user?.token || localStorage.getItem("token");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!memoId) return;
      setLoading(true);
      setError("");
      try {
        const data = await obtenerHistorialRevisiones(memoId, token);
        // Asegurar orden descendente por fecha (más reciente primero)
        const ordenados = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        if (mounted) setItems(ordenados);
      } catch (e) {
        console.error("Error al cargar historial:", e);
        if (mounted) setError("No se pudo cargar el historial de revisiones.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [memoId, token]);

  if (!memoId) {
    return <div className="text-muted">Seleccione un memo para ver su historial.</div>;
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 py-3">
        <Spinner size="sm" animation="border" />
        <span>Cargando historial…</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="my-2">{error}</Alert>;
  }

  if (!items.length) {
    return <div className="text-muted">No hay revisiones registradas para este memo.</div>;
  }

  return (
    <div className="mt-2">
      <ListGroup>
        {items.map((it, idx) => (
          <ListGroup.Item key={it.id ?? idx} className="d-flex flex-column gap-1">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <Badge bg={estadoColors[it.estado] || "secondary"}>{it.estado}</Badge>
              <Badge bg={rolBadgeVariant(it.rolRevisor)}>
                {it.rolRevisor || "—"}
              </Badge>
              {idx === 0 && (
                <Badge bg="dark">Más reciente</Badge>
              )}
              <span className="text-muted small ms-auto">{formatFecha(it.createdAt)}</span>
            </div>
            <div className="d-flex flex-wrap gap-3 small">
              <div>
                <strong>Revisor:</strong> {it.nombreRevisor || "—"}
              </div>
              <div>
                <strong>Unidad:</strong> {it.unidadRevisor || "—"}
              </div>
              <div>
                <strong>Usuario:</strong> {it.usuarioRevisor || "—"}
              </div>
              {it.origen && (
                <div className="text-muted">
                  <strong>Origen:</strong> {it.origen}
                </div>
              )}
            </div>
            {it.observaciones && (
              <div className="mt-1">
                <div className="text-muted small">Observaciones</div>
                <div className="border rounded p-2 bg-light" style={{whiteSpace: "pre-line"}}>
                  {it.observaciones}
                </div>
              </div>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
