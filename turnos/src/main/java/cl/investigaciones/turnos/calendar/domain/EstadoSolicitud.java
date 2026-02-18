package cl.investigaciones.turnos.calendar.domain;

/**
 * Estados posibles de una solicitud de cambio de turno.
 */
public enum EstadoSolicitud {
    PENDIENTE("Pendiente de aprobación"),
    APROBADA("Aprobada"),
    RECHAZADA("Rechazada"),
    CANCELADA("Cancelada por solicitante");

    private final String descripcion;

    EstadoSolicitud(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
