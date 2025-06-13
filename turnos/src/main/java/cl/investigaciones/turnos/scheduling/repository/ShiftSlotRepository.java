package cl.investigaciones.turnos.scheduling.repository;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShiftSlotRepository extends JpaRepository<ShiftSlot, Long> {
    List<ShiftSlot> findByCalendarId(Long calendarId);
}