package cl.investigaciones.turnos.dto;

import lombok.Data;
import java.util.List;

@Data
public class DiaConAsignacionesDTO {
    private int dia;
    private String diaSemana;
    private List<FuncionarioTurnoDTO> asignaciones;

    @Data
    public static class FuncionarioTurnoDTO {
        private String nombreTurno;
        private int idFuncionario;
        private String nombreCompleto;
        private String siglasCargo;
        private int antiguedad;
        private String siglasUnidad;
    }
}