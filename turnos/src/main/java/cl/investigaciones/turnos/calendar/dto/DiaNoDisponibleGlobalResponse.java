package cl.investigaciones.turnos.calendar.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiaNoDisponibleGlobalResponse {
    private Long id;
    private Integer idFuncionario;
    private LocalDate fecha;
    private String motivo;
    private String detalle;
}
