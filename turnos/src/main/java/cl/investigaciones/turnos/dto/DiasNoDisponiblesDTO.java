package cl.investigaciones.turnos.dto;

import java.util.List;
import java.util.Map;

public class DiasNoDisponiblesDTO {
    private Map<Integer, List<String>> diasNoDisponibles;

    public DiasNoDisponiblesDTO(Map<Integer, List<String>> diasNoDisponibles) {
        this.diasNoDisponibles = diasNoDisponibles;
    }

    public Map<Integer, List<String>> getDiasNoDisponibles() {
        return diasNoDisponibles;
    }

    public void setDiasNoDisponibles(Map<Integer, List<String>> diasNoDisponibles) {
        this.diasNoDisponibles = diasNoDisponibles;
    }
}

