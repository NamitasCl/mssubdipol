package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, Long> {
    List<Asignacion> findBySlot_Calendario_Id(Long calendarioId);
}
