package cl.investigaciones.turnosv2.domain.enums;

public enum EstadoCalendario {
    ABIERTO("Calendario abierto"),
    CERRADO("Calendario cerrado"),
    PUBLICADO("Calendario publicado"),
    EN_CONFIGURACION("Calendario en configuracion"),
    RESUELTO("Calendario resuelto");

    private final String descripcion;

    EstadoCalendario(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
