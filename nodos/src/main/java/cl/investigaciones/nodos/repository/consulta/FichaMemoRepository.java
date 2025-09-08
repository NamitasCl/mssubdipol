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

    // NUEVOS: consultas por createdAt (fallback y por tipo)
    List<FichaMemo> findByCreatedAtBetween(
            OffsetDateTime desde,
            OffsetDateTime hasta
    );

    List<FichaMemo> findByFormularioAndCreatedAtBetween(
            String formulario,
            OffsetDateTime desde,
            OffsetDateTime hasta
    );

    @Query("SELECT DISTINCT m FROM FichaMemo m " +
           "LEFT JOIN FETCH m.fichaPersonas p " +
           "LEFT JOIN FETCH p.estados " +
           "WHERE m.id IN :ids")
    List<FichaMemo> findAllByIdWithPersonasAndEstados(@Param("ids") List<Long> ids);

    // Buscar memos por IDs específicos y unidades
    @Query("SELECT m FROM FichaMemo m WHERE m.id IN :memoIds AND m.unidad.id IN :unidadIds")
    List<FichaMemo> findByIdsAndUnidadIdIn(@Param("memoIds") List<Long> memoIds, @Param("unidadIds") List<Long> unidadIds);

    // Obtener IDs de memos que tienen personas con estados de detenido
    @Query(value = """
        SELECT DISTINCT fm.id
        FROM ficha_memo fm
        INNER JOIN ficha_persona fp ON fm.id = fp.memos_id
        INNER JOIN "ficha_persona_estadoP" fpe ON fp.id = fpe.persona_id
        INNER JOIN "listas_calidadpersona" lcp ON fpe.calidadpersona_id = lcp.id
        WHERE (
            UPPER(lcp."calidadP") = 'DETENIDO POR PDI'
            OR UPPER(lcp."calidadP") = 'ARRESTADO'
            OR UPPER(lcp."calidadP") LIKE '%DETE%'
        )
        AND (:campoFecha = 'fm.fecha' AND fm.fecha BETWEEN :fechaInicio AND :fechaTermino
             OR :campoFecha = 'fm.created_at' AND fm.created_at BETWEEN :fechaInicio AND :fechaTermino)
        """, nativeQuery = true)
    List<Long> findMemoIdsWithDetenidos(
        @Param("fechaInicio") OffsetDateTime fechaInicio, 
        @Param("fechaTermino") OffsetDateTime fechaTermino,
        @Param("campoFecha") String campoFecha
    );
}
