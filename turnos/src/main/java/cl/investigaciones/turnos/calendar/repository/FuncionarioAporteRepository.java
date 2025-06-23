package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuncionarioAporteRepository extends JpaRepository<FuncionarioAporte, Long> {
    boolean existsByIdCalendarioAndIdUnidadAndIdFuncionario(Long idCalendario, Long idUnidad, Integer idFuncionario);
    List<FuncionarioAporte> findByIdCalendarioAndIdUnidadAndDisponibleTrue(Long idCalendario, Long idUnidad);
}

