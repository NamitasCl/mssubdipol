package cl.investigaciones.turnos.plantilla.domain;

public enum RolServicio {
    JEFE_DE_SERVICIO("Jefe de Servicio"),
    JEFE_DE_MAQUINA("Jefe de máquina"),
    PRIMER_TRIPULANTE("Primer tripulante"),
    SEGUNDO_TRIPULANTE("Segundo tripulante"),
    TRIPULANTE("Tripulante"),
    ENCARGADO_DE_TURNO("Encargado de turno"),
    ENCARGADO_DE_GUARDIA("Encargado de guardia"),
    AYUDANTE_DE_GUARDIA("Ayudante de guardia"),
    JEFE_DE_RONDA("Jefe de ronda"),
    GUARDIA_ARMADO("Guardia armado"),
    REFUERZO_DE_GUARDIA("Refuerzo de guardia");

    private final String label;

    RolServicio(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

