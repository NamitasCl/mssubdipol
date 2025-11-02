package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaUnidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListaUnidadRepository extends JpaRepository<ListaUnidad, Long> {
    ListaUnidad findByNombreUnidad(String nombreUnidad);

    // Para caso "varias unidades" -> obtenemos IDs por nombre
    @Query("select u.id from ListaUnidad u where u.nombreUnidad in :nombres")
    List<Long> findIdsByNombreUnidadIn(@Param("nombres") List<String> nombres);

    // Opcional: por región (si decides usar el filtro region como fallback)
    @Query("select u.id from ListaUnidad u where u.nombreRegion = :region")
    List<Long> findIdsByNombreRegion(@Param("region") String region);

    @Query("""
            select u 
            from ListaUnidad u 
            where upper(trim(u.nombreUnidad)) = upper(trim(:nombre))
            """)
    ListaUnidad findOneByNombreUnidadNormalized(@Param("nombre") String nombre);

    @Query("select u.id from ListaUnidad u where u.idUnidad in :ids")
    List<Long> findIdsByIdUnidadIn(@Param("ids") List<Long> ids);
}
