package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.dto.*;
import java.util.List;

public interface CalendarService {
    CalendarResponseDTO create(CalendarRequestDTO dto);
    void addQuotas(Long calendarId, List<UnitQuotaDTO> quotas);

    List<CalendarResponseDTO> findAll();
}