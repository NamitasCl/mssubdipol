package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface FichaPersonaRepository extends JpaRepository<FichaPersona, Long> {

    List<FichaPersona> findByRut(String rut);

    List<FichaPersona> findByCreatedAtBetween(OffsetDateTime fechaInicio, OffsetDateTime fechaFin);


}