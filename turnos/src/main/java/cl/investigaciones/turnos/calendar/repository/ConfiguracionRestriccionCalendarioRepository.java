package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.ConfiguracionRestriccionesCalendario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionRestriccionCalendarioRepository extends JpaRepository<ConfiguracionRestriccionesCalendario, Long> {
}
