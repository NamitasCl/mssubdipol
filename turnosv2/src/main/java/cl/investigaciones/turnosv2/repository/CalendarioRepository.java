package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.Calendario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarioRepository extends JpaRepository<Calendario, Long> {
}
