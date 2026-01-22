package cl.investigaciones.commonservices.repository;

import cl.investigaciones.commonservices.model.Unidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UnidadesRepository extends JpaRepository<Unidad, Long> {
    Optional<Unidad> findByIdUnidad(int idUnidad);

    Optional<Unidad> findFirstBySiglasUnidad(String siglasUnidad);

    List<Unidad> findByNombreUnidadContainingIgnoreCase(String nombre);

    @Query("SELECT DISTINCT u.nombreUnidad FROM Unidad u WHERE u.nombreUnidad IS NOT NULL")
    List<String> findDistinctRegionPolicial();

    @Query("select distinct u.nombreRegion from Unidad u where u.nombreRegion is not null order by u.nombreRegion asc")
    List<String> findDistinctNombreRegion();

    @Query("select u from Unidad u " +
            "where lower(u.nombreRegion) like lower(concat('%', :region, '%')) " +
            "and u.operativa = 1")
    List<Unidad> uniadesPorRegionOperativas(@Param("region") String region);

    @Query("select distinct u.nombreUnidadReporta from Unidad u where u.nombreUnidadReporta is not null order by u.nombreUnidadReporta asc")
    List<String> findDistinctNombreUnidadReporta();
}
