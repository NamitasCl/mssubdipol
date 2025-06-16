package cl.investigaciones.turnos.plantilla.repository;

import cl.investigaciones.turnos.plantilla.domain.PlantillaTurno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlantillaTurnoRepository extends JpaRepository<PlantillaTurno, Long> {
    List<PlantillaTurno> findByActivoTrue();
}

