package cl.investigaciones.turnos.calendar.mapper;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.dto.CalendarioRequestDTO;
import cl.investigaciones.turnos.calendar.dto.CalendarioResponseDTO;

public class CalendarioMapper {

    public static Calendario toEntity(CalendarioRequestDTO dto) {
        Calendario calendario = new Calendario();
        calendario.setNombre(dto.getNombre());
        calendario.setMes(dto.getMes());
        calendario.setAnio(dto.getAnio());
        calendario.setTipo(dto.getTipo());
        calendario.setIdUnidad(dto.getIdUnidad());
        calendario.setSiglasUnidad(dto.getSiglasUnidad());
        calendario.setNombreComplejo(dto.getNombreComplejo());
        calendario.setNombreUnidad(dto.getNombreUnidad());
        calendario.setIdPlantillasUsadas(dto.getIdPlantillasUsadas());
        return calendario;
    }

    public static void updateEntity(Calendario c, CalendarioRequestDTO dto) {
        c.setNombre(dto.getNombre());
        c.setMes(dto.getMes());
        c.setAnio(dto.getAnio());
        c.setTipo(dto.getTipo());
        c.setIdUnidad(dto.getIdUnidad());
        c.setSiglasUnidad(dto.getSiglasUnidad());
        c.setNombreUnidad(dto.getNombreUnidad());
        c.setNombreComplejo(dto.getNombreComplejo());
        c.setIdPlantillasUsadas(dto.getIdPlantillasUsadas());
    }

    public static CalendarioResponseDTO toDto(Calendario c) {
        CalendarioResponseDTO dto = new CalendarioResponseDTO();
        dto.setId(c.getId());
        dto.setNombre(c.getNombre());
        dto.setMes(c.getMes());
        dto.setAnio(c.getAnio());
        dto.setTipo(c.getTipo());
        dto.setIdUnidad(c.getIdUnidad());
        dto.setSiglasUnidad(c.getSiglasUnidad());
        dto.setNombreUnidad(c.getNombreUnidad());
        dto.setNombreComplejo(c.getNombreComplejo());
        dto.setIdPlantillasUsadas(c.getIdPlantillasUsadas());
        dto.setEstado(c.getEstado());
        dto.setEliminado(c.isEliminado());
        // Set auditable fields
        dto.setCreadoPor(c.getCreadoPor());
        dto.setModificadoPor(c.getModificadoPor());
        dto.setFechaCreacion(c.getFechaCreacion().toString());
        dto.setFechaModificacion(c.getFechaModificacion() != null ? c.getFechaModificacion().toString() : null);
        return dto;
    }
}

