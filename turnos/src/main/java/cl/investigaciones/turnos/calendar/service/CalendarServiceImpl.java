package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.*;
import cl.investigaciones.turnos.calendar.dto.*;
import cl.investigaciones.turnos.calendar.repository.CalendarRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarServiceImpl implements CalendarService {

    private final CalendarRepository repo;
    private final CalendarMapper mapper;

    @Override
    public CalendarResponseDTO create(CalendarRequestDTO dto) {
        // Regla simple: no duplicar mes/año para mismo tipo
        repo.findByMonthAndYearAndType(dto.getMonth(), dto.getYear(), dto.getType())
                .ifPresent(c -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un calendario para ese periodo");
                });

        Calendar cal = new Calendar();
        cal.setName(dto.getName());
        cal.setMonth(dto.getMonth());
        cal.setYear(dto.getYear());
        cal.setType(dto.getType());

        // quotas opcionales
        if (dto.getQuotas() != null && dto.getType() == CalendarType.COMPLEX) {
            dto.getQuotas().forEach(q -> {
                CalendarUnitQuota quota = new CalendarUnitQuota();
                quota.setUnitId(q.getUnitId());
                quota.setQuota(q.getQuota());
                cal.addQuota(quota);
            });
        }

        Calendar saved = repo.save(cal);
        return new CalendarResponseDTO(saved.getId(), saved.getName(), saved.getMonth(), saved.getYear(), saved.getType(), saved.getState());
    }

    @Override
    public void addQuotas(Long calendarId, List<UnitQuotaDTO> quotas) {
        Calendar cal = repo.findById(calendarId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendario no encontrado"));
        if (cal.getType() != CalendarType.COMPLEX) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo aplica a calendarios de tipo COMPLEX");
        }
        quotas.forEach(q -> {
            CalendarUnitQuota quota = new CalendarUnitQuota();
            quota.setUnitId(q.getUnitId());
            quota.setQuota(q.getQuota());
            cal.addQuota(quota);
        });
    }

    @Override
    public List<CalendarResponseDTO> findAll() {
        return repo.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}