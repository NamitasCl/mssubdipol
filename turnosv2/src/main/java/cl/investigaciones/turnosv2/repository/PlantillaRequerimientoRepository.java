package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.PlantillaRequerimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantillaRequerimientoRepository extends JpaRepository<PlantillaRequerimiento, Long> {
}
