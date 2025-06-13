package cl.investigaciones.turnos.scheduling.service;

import cl.investigaciones.turnos.scheduling.repository.*;
import cl.investigaciones.turnos.scheduling.domain.*;
import cl.investigaciones.turnos.scheduling.dto.*;
import cl.investigaciones.turnos.scheduling.algorithm.*;
import cl.investigaciones.turnos.scheduling.restriction.*;
import cl.investigaciones.turnos.scheduling.restriction.impl.*;
import cl.investigaciones.turnos.calendar.repository.CalendarRepository;
import cl.investigaciones.turnos.calendar.domain.Calendar;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SchedulingServiceImpl implements SchedulingService {

    private final ShiftSlotRepository slotRepo;
    private final AssignmentRepository assignRepo;
    private final CalendarRepository calendarRepo;
    // TODO: inyecta un FeignClient al microservicio Personal para obtener funcionarios por unidad

    @Override
    public ScheduleResponseDTO generate(Long calendarId) {
        Calendar cal = calendarRepo.findById(calendarId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendario no encontrado"));

        List<ShiftSlot> slots = slotRepo.findByCalendarId(calendarId);
        if (slots.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay turnos (ShiftSlot) para este calendario");
        }

        // (Demo) obtenemos lista de staffId dummy del tamaño adecuado
        // Reemplaza por llamada real a microservicio Personal
        List<Long> staffIds = dummyStaff(slots.size());

        // Aleatoriza
        FisherYatesShuffler.shuffle(staffIds);

        // Restricciones
        RestrictionEngine engine = new RestrictionEngine(List.of(new MinDaysBetweenRestriction(3)));
        Map<Long, List<ShiftSlot>> assignedSoFar = new HashMap<>();

        Iterator<Long> rotor = staffIds.iterator();
        List<AssignmentDTO> responseList = new ArrayList<>();

        for (ShiftSlot slot : slots) {
            Long staffId = rotor.next();
            // Si llega al final, vuelve a empezar
            if (!rotor.hasNext()) rotor = staffIds.iterator();

            // Busca primer staff que cumpla restricciones
            int tries = 0;
            while (!engine.isAllowed(slot, staffId, assignedSoFar) && tries < staffIds.size()) {
                staffId = rotor.next();
                if (!rotor.hasNext()) rotor = staffIds.iterator();
                tries++;
            }

            Assignment asg = new Assignment();
            asg.setShiftSlot(slot);
            asg.setStaffId(staffId);
            assignRepo.save(asg);

            slot.setAssignment(asg);
            assignedSoFar.computeIfAbsent(staffId, k -> new ArrayList<>()).add(slot);

            responseList.add(new AssignmentDTO(slot.getId(), staffId, slot.getDate(), slot.getRole()));
        }

        return new ScheduleResponseDTO(calendarId, responseList);
    }

    /* ---------------------------------- */
    private List<Long> dummyStaff(int n) {
        List<Long> list = new ArrayList<>();
        for (long i = 1; i <= n; i++) list.add(i);
        return list;
    }
}