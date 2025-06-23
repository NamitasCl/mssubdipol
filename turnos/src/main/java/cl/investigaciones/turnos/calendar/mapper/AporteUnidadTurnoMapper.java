package cl.investigaciones.turnos.calendar.mapper;

import cl.investigaciones.turnos.calendar.domain.AporteUnidadTurno;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadTurnoRequestDTO;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadTurnoResponseDTO;

public class AporteUnidadTurnoMapper {

    public static AporteUnidadTurno toEntity(AporteUnidadTurnoRequestDTO dto) {
        AporteUnidadTurno entity = new AporteUnidadTurno();
        entity.setIdCalendario(dto.getIdCalendario());
        entity.setIdUnidad(dto.getIdUnidad());
        entity.setSiglasUnidad(dto.getSiglasUnidad());
        entity.setNombreUnidad(dto.getNombreUnidad());
        entity.setCantidadFuncionarios(dto.getCantidadFuncionarios());
        entity.setFechaRegistro(java.time.LocalDateTime.now());
        entity.setRegistradoPor(dto.getRegistradoPor());
        return entity;
    }

    public static AporteUnidadTurnoResponseDTO toDto(AporteUnidadTurno entity) {
        AporteUnidadTurnoResponseDTO dto = new AporteUnidadTurnoResponseDTO();
        dto.setId(entity.getId());
        dto.setIdCalendario(entity.getIdCalendario());
        dto.setIdUnidad(entity.getIdUnidad());
        dto.setSiglasUnidad(entity.getSiglasUnidad());
        dto.setNombreUnidad(entity.getNombreUnidad());
        dto.setCantidadFuncionarios(entity.getCantidadFuncionarios());
        dto.setFechaRegistro(entity.getFechaRegistro());
        dto.setRegistradoPor(entity.getRegistradoPor());
        return dto;
    }
}
