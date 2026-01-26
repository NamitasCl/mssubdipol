package cl.sge.repository;

import cl.sge.entity.SolicitudRecurso;
import cl.sge.entity.SolicitudRecurso.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRecursoRepository extends JpaRepository<SolicitudRecurso, Long> {

    // Find all requests for a specific deployment
    List<SolicitudRecurso> findByDespliegueId(Long despliegueId);
    
    // Find requests directed to a specific region
    List<SolicitudRecurso> findByRegionDestino(String region);
    
    // Find requests directed to a specific unit
    List<SolicitudRecurso> findByUnidadDestino(String unidad);
    
    // Find requests by state
    List<SolicitudRecurso> findByEstado(EstadoSolicitud estado);
    
    // Find pending requests for a region (for PM-REG dashboard)
    @Query("SELECT s FROM SolicitudRecurso s WHERE s.regionDestino = :region AND s.estado IN ('PENDIENTE', 'PARCIAL')")
    List<SolicitudRecurso> findPendientesByRegion(@Param("region") String region);
    
    // Find pending requests for a unit (for Jefe dashboard)
    @Query("SELECT s FROM SolicitudRecurso s WHERE s.unidadDestino = :unidad AND s.estado IN ('PENDIENTE', 'DELEGADA', 'PARCIAL')")
    List<SolicitudRecurso> findPendientesByUnidad(@Param("unidad") String unidad);
    
    // Gap analysis: count pending requests by region for an event (via deployments)
    @Query("""
        SELECT s.regionDestino, 
               SUM(s.funcionariosRequeridos), 
               COUNT(s)
        FROM SolicitudRecurso s 
        WHERE s.despliegue.evento.id = :eventoId 
        GROUP BY s.regionDestino
    """)
    List<Object[]> getResumenByRegion(@Param("eventoId") Long eventoId);
}
