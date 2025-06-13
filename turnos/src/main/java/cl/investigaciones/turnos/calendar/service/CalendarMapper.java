package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Calendar;
import cl.investigaciones.turnos.calendar.dto.CalendarResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CalendarMapper {
    Calendar toEntity(CalendarResponseDTO dto);
    CalendarResponseDTO toDto(Calendar entity);
}
