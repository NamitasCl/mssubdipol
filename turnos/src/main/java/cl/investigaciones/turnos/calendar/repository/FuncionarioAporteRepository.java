package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FuncionarioAporteRepository extends JpaRepository<FuncionarioAporte, Long> {

    List<FuncionarioAporte> findByIdCalendarioAndIdUnidadAndDisponibleTrue(Long idCalendario, Long idUnidad);

    List<FuncionarioAporte> findByIdCalendarioAndDisponibleTrue(Long idCalendario);

    Optional<FuncionarioAporte> findByIdCalendarioAndIdUnidadAndIdFuncionario(Long idCalendario, Long idUnidad, int idFuncionario);

}

