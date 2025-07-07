package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.dto.SlotsResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.SlotMapper;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SlotService {

    private final SlotRepository slotRepository;

    public SlotService(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    public int getCantidadTotalSlotsByCalendar(Long calendarId) {
        return slotRepository.countSlotByIdCalendario(calendarId);
    }

    public List<Slot> getSlotsByCalendar(Long calendarId) {
        return slotRepository.findAllByIdCalendario(calendarId);
    }

    public List<SlotsResponseDTO> getSlotsResponseByCalendar(Long calendarId) {
        return slotRepository.findAllByIdCalendario(calendarId).stream()
                .map(SlotMapper::toDTO)
                .toList();
    }


    public void saveAll(List<Slot> slots) {
        slotRepository.saveAll(slots);
    }
}
