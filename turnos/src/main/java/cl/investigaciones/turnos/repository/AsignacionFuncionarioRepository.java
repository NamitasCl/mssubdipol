package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.dto.FuncionariosDisponiblesResponseDTO;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// AsignacionFuncionarioRepository.java
public interface AsignacionFuncionarioRepository extends JpaRepository<AsignacionFuncionario, Long> {
    // Buscar todos los asignados para un calendario
    List<AsignacionFuncionario> findByTurnoAsignacion_Id(Long turnoAsignacionId);

    // Buscar asignaciones por calendario y unidad (para admins)
    List<AsignacionFuncionario> findByTurnoAsignacion_IdAndUnidad(Long turnoAsignacionId, String unidad);

    // Único: un funcionario por unidad en un calendario
    Optional<AsignacionFuncionario> findByTurnoAsignacion_IdAndUnidadAndIdFuncionario(Long turnoAsignacionId, String unidad, int idFuncionario);

    List<AsignacionFuncionario> findByUnidad(String unidad);

    Optional<AsignacionFuncionario> findById(Long id);

    Optional<AsignacionFuncionario> findByIdFuncionario(int idFuncionario);
}

