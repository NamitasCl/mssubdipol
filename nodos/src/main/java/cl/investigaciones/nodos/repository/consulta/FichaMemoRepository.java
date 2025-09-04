package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<FichaMemo> findByFormularioAndCreatedAtBetweenAndUnidadIdIn(
            String formulario,
            OffsetDateTime desde,
            OffsetDateTime hasta,
            List<Long> unidadIds);

    @Query("SELECT DISTINCT m FROM FichaMemo m " +
           "LEFT JOIN FETCH m.fichaPersonas p " +
           "LEFT JOIN FETCH p.estados " +
           "WHERE m.id IN :ids")
    List<FichaMemo> findAllByIdWithPersonasAndEstados(@Param("ids") List<Long> ids);

}
