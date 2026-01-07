package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.ConfiguracionReglas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionReglasRepository extends JpaRepository<ConfiguracionReglas, Long> {
    
    Optional<ConfiguracionReglas> findByNombre(String nombre);
    
    Optional<ConfiguracionReglas> findFirstByActivoTrueOrderByFechaCreacionDesc();
}
