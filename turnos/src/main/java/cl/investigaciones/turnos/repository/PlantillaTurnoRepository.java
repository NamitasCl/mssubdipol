package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.PlantillaTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantillaTurnoRepository extends JpaRepository<PlantillaTurno, Long> {
    // Puedes agregar métodos de búsqueda personalizados si necesitas
}
