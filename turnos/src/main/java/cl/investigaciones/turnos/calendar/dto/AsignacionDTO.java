package cl.investigaciones.turnos.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionDTO {
    private Long idSlot;
    private Integer idFuncionario;
    private String nombreFuncionario;
    private LocalDate fecha;
    private String tipoTurno;
    private String nombreServicio;
    private String recinto;
    private java.time.LocalTime horaInicio;
    private java.time.LocalTime horaFin;
    
    // Score/calidad de la asignación (para debugging)
    private Double score;
}
