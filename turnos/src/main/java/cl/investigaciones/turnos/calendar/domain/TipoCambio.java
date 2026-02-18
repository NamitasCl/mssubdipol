package cl.investigaciones.turnos.calendar.domain;

/**
 * Tipos de cambio de turno disponibles:
 * - PERMUTA: Intercambio mutuo de turnos entre dos funcionarios
 * - DEVOLUCION: Cambio con compromiso de devolver el favor en el futuro
 * - CESION: Cesión de turno sin devolución
 */
public enum TipoCambio {
    PERMUTA("Permuta de turno"),
    DEVOLUCION("Cambio con devolución futura"),
    CESION("Cesión de turno");

    private final String descripcion;

    TipoCambio(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
