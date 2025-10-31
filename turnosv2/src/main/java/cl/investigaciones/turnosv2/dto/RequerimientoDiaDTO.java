package cl.investigaciones.turnosv2.dto;

import cl.investigaciones.turnosv2.domain.RequerimientoDia;

public record RequerimientoDiaDTO(String rol, int cantidad, String tipoTurno) {
    public static RequerimientoDiaDTO of(RequerimientoDia r) {
        return new RequerimientoDiaDTO(r.getRol().name(), r.getCantidad(),
                r.getTipoTurno() != null ? r.getTipoTurno().name() : null);
    }
}
