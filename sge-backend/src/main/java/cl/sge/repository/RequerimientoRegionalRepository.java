package cl.sge.repository;

import cl.sge.entity.RequerimientoRegional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequerimientoRegionalRepository extends JpaRepository<RequerimientoRegional, Long> {
    List<RequerimientoRegional> findByEventoId(Long eventoId);
}
