package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.AsignacionFuncionarioTurno;
import cl.investigaciones.turnos.model.DiaAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AsignacionFuncionarioTurnoRepository extends JpaRepository<AsignacionFuncionarioTurno, Long> {
    List<AsignacionFuncionarioTurno> findByDiaAsignacion(DiaAsignacion diaAsignacion);

    Optional<AsignacionFuncionarioTurno> findByDiaAsignacionAndNombreTurnoAndFuncionarioUnidad(DiaAsignacion dia, String nombreTurno, String unidad);

    Optional<AsignacionFuncionarioTurno> findByFuncionarioIdAndDiaAsignacion(Long funcionarioId, DiaAsignacion diaAsignacion);

}
