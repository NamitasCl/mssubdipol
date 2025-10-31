package cl.investigaciones.turnosv2.dto;

import cl.investigaciones.turnosv2.domain.UnidadParticipante;

public record UnidadParticipanteDTO(Long id, String nombre, String sigla) {
    public static UnidadParticipanteDTO of(UnidadParticipante u) {
        return new UnidadParticipanteDTO(u.getId(), u.getNombre(), u.getSigla());
    }
}
