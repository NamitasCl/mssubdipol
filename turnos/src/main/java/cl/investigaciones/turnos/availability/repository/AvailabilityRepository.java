package cl.investigaciones.turnos.availability.repository;

import cl.investigaciones.turnos.availability.domain.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByCalendarId(Long calendarId);
    List<Availability> findByCalendarIdAndStaffId(Long calendarId, Long staffId);
}