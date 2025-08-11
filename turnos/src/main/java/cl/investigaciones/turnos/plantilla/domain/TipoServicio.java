package cl.investigaciones.turnos.plantilla.domain;


public enum TipoServicio {
    JEFE_DE_SERVICIO("Jefe de Servicio"),
    GUARDIA("Guardia"),
    PROCEPOL("Procepol"),
    RONDA("Ronda");

    private final String label;

    TipoServicio(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
