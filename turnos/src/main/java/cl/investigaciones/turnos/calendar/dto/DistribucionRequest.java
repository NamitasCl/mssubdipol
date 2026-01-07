package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@Data
public class DistribucionRequest {
    private Long idCalendario;
    private Integer mes;
    private Integer anio;
    private Long idConfigReglas;
    
    // Opcional: forzar balance incluso si viola otras reglas
    private Boolean forzarBalance = false;
    
    // Opcional: permitir relajar constraints si no hay solución
    private Boolean permitirRelajacion = true;
    
    // Opcional: días no disponibles por funcionario (si no vienen de BD)
    private Map<Integer, Set<LocalDate>> diasNoDisponiblesOverride;
}
