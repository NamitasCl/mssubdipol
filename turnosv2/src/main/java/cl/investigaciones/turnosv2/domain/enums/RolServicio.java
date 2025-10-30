package cl.investigaciones.turnosv2.domain.enums;

public enum RolServicio {
    JEFE_DE_RONDA("Jefe de Ronda"),
    JEFE_DE_SERVICIO("Jefe de Servicio"),
    ENCARGADO_DE_GUARDIA("Encargado de guardia"),
    AYUDANTE_DE_GUARDIA("Ayudante de guardia"),
    GUARDIA_ARMADO("Guardia armado");

    private final String descripcion;

    RolServicio(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
