package cl.investigaciones.turnosv2.dto;

import cl.investigaciones.turnosv2.domain.DiaCalendario;

import java.time.LocalDate;

public record DiaCalendarioDTO(Long id, Long calendarioId, LocalDate fecha, Long plantillaId) {
    public static DiaCalendarioDTO of(DiaCalendario d) {
        return new DiaCalendarioDTO(
                d.getId(),
                d.getCalendario() != null ? d.getCalendario().getId() : null,
                d.getFecha(),
                d.getPlantillaRequerimiento() != null ? d.getPlantillaRequerimiento().getId() : null
        );
    }
}