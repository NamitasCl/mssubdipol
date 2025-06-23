package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.AporteUnidadTurno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AporteUnidadTurnoRepository extends JpaRepository<AporteUnidadTurno, Long> {

    List<AporteUnidadTurno> findByIdCalendario(Long idCalendario);

    Optional<AporteUnidadTurno> findByIdCalendarioAndIdUnidad(Long idCalendario, Long idUnidad);
}