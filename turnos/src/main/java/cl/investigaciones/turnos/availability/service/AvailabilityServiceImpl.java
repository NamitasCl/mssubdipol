package cl.investigaciones.turnos.availability.service;

import cl.investigaciones.turnos.availability.domain.Availability;
import cl.investigaciones.turnos.availability.dto.*;
import cl.investigaciones.turnos.availability.repository.AvailabilityRepository;
import cl.investigaciones.turnos.calendar.repository.CalendarRepository;
import cl.investigaciones.turnos.calendar.domain.Calendar;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository repo;
    private final CalendarRepository calendarRepo;

    @Override
    public AvailabilityResponseDTO register(AvailabilityRequestDTO dto) {
        Calendar cal = calendarRepo.findById(dto.getCalendarId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendario no encontrado"));

        Availability av = new Availability();
        av.setCalendar(cal);
        av.setStaffId(dto.getStaffId());
        av.setDate(dto.getDate());
        av.setReason(dto.getReason());

        Availability saved = repo.save(av);
        return map(saved);
    }

    @Override
    public void registerBulk(List<AvailabilityRequestDTO> list) {
        list.forEach(this::register);
    }

    @Override
    public List<AvailabilityResponseDTO> listByCalendar(Long calendarId) {
        return repo.findByCalendarId(calendarId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    private AvailabilityResponseDTO map(Availability av) {
        return new AvailabilityResponseDTO(av.getId(), av.getCalendar().getId(), av.getStaffId(), av.getDate(), av.getReason());
    }
}