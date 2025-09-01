package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface FichaMemoRepository extends JpaRepository<FichaMemo, Long> {
    List<FichaMemo> findByFechaBetween(OffsetDateTime fechaInicio, OffsetDateTime fechaTermino);

    List<FichaMemo> findByFormularioAndFechaBetweenAndUnidadId(String formulario, OffsetDateTime fechaInicio, OffsetDateTime fechaTermino, Long idUnidad);

    // para varias unidades:
    List<FichaMemo> findByFormularioAndFechaBetweenAndUnidadIdIn(
            String formulario,
            OffsetDateTime desde,
            OffsetDateTime hasta,
            List<Long> unidadIds
    );

    // fallback sin unidad (todas las unidades):
    List<FichaMemo> findByFormularioAndFechaBetween(
            String formulario,
            OffsetDateTime desde,
            OffsetDateTime hasta
    );

}
