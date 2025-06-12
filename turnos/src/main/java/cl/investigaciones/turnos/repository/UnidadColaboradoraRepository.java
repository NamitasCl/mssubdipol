package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.TurnoAsignacion;
import cl.investigaciones.turnos.model.UnidadColaboradora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnidadColaboradoraRepository extends JpaRepository<UnidadColaboradora, Long> {

    Optional<UnidadColaboradora> findByTurnoAsignacion(TurnoAsignacion turnoAsignacion);

    List<UnidadColaboradora> findByTurnoAsignacionId(Long turnoAsignacion);
}