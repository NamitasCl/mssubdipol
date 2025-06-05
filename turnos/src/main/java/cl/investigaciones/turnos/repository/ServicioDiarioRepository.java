package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.ServicioDiario;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioDiarioRepository extends JpaRepository<ServicioDiario, Long> {
    List<ServicioDiario> findByTurnoAsignacion(TurnoAsignacion turnoAsignacion);
}
