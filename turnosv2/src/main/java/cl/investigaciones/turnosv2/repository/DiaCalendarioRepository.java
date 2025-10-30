package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.DiaCalendario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaCalendarioRepository extends JpaRepository<DiaCalendario, Long> {
    List<DiaCalendario> findByCalendarioId(Long calendarioId);
}
