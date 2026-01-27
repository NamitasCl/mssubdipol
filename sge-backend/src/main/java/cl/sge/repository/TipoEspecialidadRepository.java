package cl.sge.repository;

import cl.sge.entity.TipoEspecialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoEspecialidadRepository extends JpaRepository<TipoEspecialidad, Long> {
}
