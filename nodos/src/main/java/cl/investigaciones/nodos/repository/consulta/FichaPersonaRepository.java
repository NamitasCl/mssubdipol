package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FichaPersonaRepository extends JpaRepository<FichaPersona, Long> {

    List<FichaPersona> findByRut(String rut);



}
