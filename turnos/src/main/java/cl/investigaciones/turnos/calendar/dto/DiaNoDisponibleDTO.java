package cl.investigaciones.turnos.calendar.dto;

import lombok.Data;

@Data
public class DiaNoDisponibleDTO {
    private String fecha;   // formato "YYYY-MM-DD"
    private String motivo;
    private String detalle; // opcional, solo si el motivo es "Otro"
}
