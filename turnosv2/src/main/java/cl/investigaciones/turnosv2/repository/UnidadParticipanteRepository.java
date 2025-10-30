package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.UnidadParticipante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnidadParticipanteRepository extends JpaRepository<UnidadParticipante, Long> {
}
