package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.CalendarState;
import cl.investigaciones.turnos.calendar.domain.Calendario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CalendarioRepository extends JpaRepository<Calendario, Long> {
    List<Calendario> findByIdUnidadAndEliminadoFalse(Long idUnidad);
    List<Calendario> findByEstadoAndEliminadoFalse(CalendarState estado);
    List<Calendario> findByEliminadoFalse();
    Optional<Calendario> findByMesAndAnioAndEliminadoFalse(Integer mes, Integer anio);
}