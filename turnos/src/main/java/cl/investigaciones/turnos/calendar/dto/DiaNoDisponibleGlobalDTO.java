package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DiaNoDisponibleGlobalDTO {
    private Long id;
    private LocalDate fecha;   // formato "YYYY-MM-DD"
    private String motivo;
    private String detalle; // opcional, solo si el motivo es "Otro"
}
