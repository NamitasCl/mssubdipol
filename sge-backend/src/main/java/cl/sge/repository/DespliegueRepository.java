package cl.sge.repository;

import cl.sge.entity.Despliegue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DespliegueRepository extends JpaRepository<Despliegue, Long> {
    java.util.List<Despliegue> findByEventoId(Long eventoId);
}
