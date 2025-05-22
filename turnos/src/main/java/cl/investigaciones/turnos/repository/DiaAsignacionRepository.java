package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.DiaAsignacion;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DiaAsignacionRepository extends JpaRepository<DiaAsignacion, Long> {

    Optional<DiaAsignacion> findByTurnoAsignacionAndDia(TurnoAsignacion turnoAsignacion, int dia);

    List<DiaAsignacion> findByTurnoAsignacion(TurnoAsignacion turnoAsignacion);

    Optional<DiaAsignacion> findByDia(int dia);
}