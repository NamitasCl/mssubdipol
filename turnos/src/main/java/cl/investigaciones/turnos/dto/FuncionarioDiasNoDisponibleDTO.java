package cl.investigaciones.turnos.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FuncionarioDiasNoDisponibleDTO {
    private int idFuncionario;
    private LocalDate fecha;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String motivo;
    private String detalle;
}
