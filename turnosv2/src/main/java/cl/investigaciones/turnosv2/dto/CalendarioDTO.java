package cl.investigaciones.turnosv2.dto;

import cl.investigaciones.turnosv2.domain.Calendario;
import cl.investigaciones.turnosv2.domain.UnidadParticipante;

import java.time.LocalDate;
import java.util.List;

public record CalendarioDTO(Long id, String nombre, LocalDate fechaInicio,
                            LocalDate fechaFin, String estado, List<Long> unidadParticipantes) {
    public static CalendarioDTO of(Calendario c) {
        var unidades = c.getUnidadParticipantes() == null ? List.<Long>of()
                : c.getUnidadParticipantes().stream().map(UnidadParticipante::getId).toList();
        return new CalendarioDTO(c.getId(), c.getNombre(), c.getFechaInicio(), c.getFechaFin(),
                c.getEstado().name(), unidades);
    }
}
