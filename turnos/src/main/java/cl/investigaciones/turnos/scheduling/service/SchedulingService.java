package cl.investigaciones.turnos.scheduling.service;

import cl.investigaciones.turnos.scheduling.dto.ScheduleResponseDTO;

public interface SchedulingService {
    ScheduleResponseDTO generate(Long calendarId);
}