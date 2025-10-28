package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface FichaPersonaRepository extends JpaRepository<FichaPersona, Long> {

    List<FichaPersona> findByRut(String rut);

    List<FichaPersona> findByCreatedAtBetween(OffsetDateTime fechaInicio, OffsetDateTime fechaFin);

    @Query("select distinct f from FichaPersona f " +
            "left join fetch f.nacionalidad n " +
            "left join fetch f.estados e " +
            "left join fetch f.delitos d " +
            "where f.createdAt between :fechaInicio and :fechaFin")
    List<FichaPersona> findByCreatedAtBetweenWithRelations(@Param("fechaInicio") OffsetDateTime fechaInicio,
                                                           @Param("fechaFin") OffsetDateTime fechaFin);

    @Query("select distinct f from FichaPersona f " +
            "left join fetch f.memo m " +
            "left join fetch f.nacionalidad n " +
            "left join fetch f.estados e " +
            "left join fetch f.delitos d " +
            "where f.createdAt between :fechaInicio and :fechaFin")
    List<FichaPersona> findByCreatedAtBetweenWithAllRelations(@Param("fechaInicio") OffsetDateTime fechaInicio,
                                                              @Param("fechaFin") OffsetDateTime fechaFin);


    @Query("select distinct f from FichaPersona f " +
            "left join fetch f.nacionalidad n " +
            "left join fetch f.estados e " +
            "left join fetch f.delitos d " +
            "left join fetch f.memo m")
    List<FichaPersona> findAllWithRelations();

}