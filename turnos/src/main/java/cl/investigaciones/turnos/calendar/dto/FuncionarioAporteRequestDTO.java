package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

@Data
public class FuncionarioAporteRequestDTO {
    private Long idCalendario;
    private Long idUnidad;
    private int idFuncionario;
    private String nombreCompleto;
    private String grado;
    private int antiguedad;
;
}

