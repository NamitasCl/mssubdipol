package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class SlotService {

    private final SlotRepository slotRepository;

    public SlotService(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    public int getCantidadTotalSlotsByCalendar(Long calendarId) {
        return slotRepository.countSlotByIdCalendario(calendarId);
    }

}
