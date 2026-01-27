package cl.sge.repository;

import cl.sge.entity.TipoRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoRecursoRepository extends JpaRepository<TipoRecurso, Long> {
}
