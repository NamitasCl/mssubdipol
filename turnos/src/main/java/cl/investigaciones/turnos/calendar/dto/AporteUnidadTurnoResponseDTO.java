package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AporteUnidadTurnoResponseDTO {
    private Long id;
    private Long idCalendario;
    private Long idUnidad;
    private String siglasUnidad;
    private String nombreUnidad;
    private int cantidadFuncionarios;
    private LocalDateTime fechaRegistro;
    private Integer registradoPor;
}