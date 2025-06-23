package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

@Data
public class AporteUnidadTurnoRequestDTO {
    private Long idCalendario;
    private Long idUnidad;
    private String siglasUnidad;
    private String nombreUnidad;
    private int cantidadFuncionarios;
    private Integer registradoPor;
}