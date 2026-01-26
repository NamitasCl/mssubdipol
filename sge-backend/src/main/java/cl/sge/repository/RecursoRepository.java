package cl.sge.repository;

import cl.sge.entity.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecursoRepository extends JpaRepository<Recurso, Long> {
    List<Recurso> findByUnidadDueña(String unidadDueña);
    List<Recurso> findByRegisteredBy(String registeredBy);
}
