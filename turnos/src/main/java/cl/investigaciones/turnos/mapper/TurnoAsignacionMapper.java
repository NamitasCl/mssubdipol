package cl.investigaciones.turnos.mapper;

import cl.investigaciones.turnos.dto.DiaAsignacionDTO;
import cl.investigaciones.turnos.dto.TurnoAsignacionDTO;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TurnoAsignacionMapper {

    public TurnoAsignacionDTO mapToResponseDTO(TurnoAsignacion entity) {
        TurnoAsignacionDTO dto = new TurnoAsignacionDTO();
        dto.setId(entity.getId());
        dto.setMes(entity.getMes());
        dto.setAnio(entity.getAnio());

        if (entity.getAsignaciones() != null) {
            List<DiaAsignacionDTO> diaDTOs = entity.getAsignaciones().stream()
                    .map(dia -> {
                        DiaAsignacionDTO diaDTO = new DiaAsignacionDTO();
                        diaDTO.setDia(dia.getDia());
                        diaDTO.setDiaSemana(dia.getDiaSemana());
                        return diaDTO;
                    })
                    .collect(Collectors.toList());

            dto.setAsignaciones(diaDTOs);
        }

        return dto;
    }
}