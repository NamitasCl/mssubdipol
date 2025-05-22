package cl.investigaciones.turnos.dto;

import lombok.Data;
import java.util.List;

@Data
public class AsignacionTurnoRequestDTO {
    private int dia;
    private int mes;
    private int anio;
    private List<FuncionarioTurnoDTO> asignaciones;

    @Data
    public static class FuncionarioTurnoDTO {
        private Long id;
        private String nombreTurno;
    }
}
