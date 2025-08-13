package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Feriado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeriadoRepository extends JpaRepository<Feriado, Long> {
}
