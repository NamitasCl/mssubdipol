package cl.investigaciones.turnosv2.dto;

import cl.investigaciones.turnosv2.domain.PlantillaRequerimiento;

import java.util.List;

public record PlantillaRequerimientoDTO(Long id, String nombre,
                                        List<RequerimientoDiaDTO> requerimientos) {
    public static PlantillaRequerimientoDTO of(PlantillaRequerimiento p) {
        var reqs = p.getRequerimientos() == null ? List.<RequerimientoDiaDTO>of()
                : p.getRequerimientos().stream().map(RequerimientoDiaDTO::of).toList();
        return new PlantillaRequerimientoDTO(p.getId(), p.getNombre(), reqs);
    }
}
