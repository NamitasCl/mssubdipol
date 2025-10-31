package cl.investigaciones.turnosv2.domain.enums;

public enum TipoTurno {
    TURNO_12H("Turno de 12 horas"),
    TURNO_24H("Turno de 24 horas");

    private final String descripcion;

    TipoTurno(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
