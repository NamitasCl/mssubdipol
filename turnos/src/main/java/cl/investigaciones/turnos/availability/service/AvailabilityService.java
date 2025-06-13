package cl.investigaciones.turnos.availability.service;

import cl.investigaciones.turnos.availability.dto.*;
import java.util.List;

public interface AvailabilityService {
    AvailabilityResponseDTO register(AvailabilityRequestDTO dto);
    void registerBulk(List<AvailabilityRequestDTO> list);
    List<AvailabilityResponseDTO> listByCalendar(Long calendarId);
}