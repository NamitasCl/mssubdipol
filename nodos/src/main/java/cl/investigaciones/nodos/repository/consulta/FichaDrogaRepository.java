package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaDroga;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FichaDrogaRepository extends JpaRepository<FichaDroga, Long> {
}
