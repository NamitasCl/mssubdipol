package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FuncionarioAporteResponseDTO {
    private Long id;
    private Long idCalendario;
    private Long idUnidad;
    private int idFuncionario;
    private String nombreCompleto;
    private String grado;
    private int antiguedad;
    private Integer agregadoPor;
    private LocalDateTime fechaCreacion;
    private boolean disponible;
}

