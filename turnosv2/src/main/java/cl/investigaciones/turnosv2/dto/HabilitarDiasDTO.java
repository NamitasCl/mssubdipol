package cl.investigaciones.turnosv2.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class HabilitarDiasDTO {
    private List<LocalDate> fechas;
}