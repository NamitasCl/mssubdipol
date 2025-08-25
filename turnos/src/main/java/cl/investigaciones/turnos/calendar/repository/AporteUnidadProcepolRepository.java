package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.AporteUnidadProcepol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AporteUnidadProcepolRepository extends JpaRepository<AporteUnidadProcepol, Long> {
    Optional<AporteUnidadProcepol> findByIdCalendarioAndIdUnidad(Long idCalendario, Long idUnidad);
    List<AporteUnidadProcepol> findAllByIdCalendario(Long idCalendario);
    void deleteByIdCalendarioAndIdUnidad(Long idCalendario, Long idUnidad);
}
