package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Calendar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    Optional<Calendar> findByMonthAndYearAndType(int month, int year, cl.investigaciones.turnos.calendar.domain.CalendarType type);
}