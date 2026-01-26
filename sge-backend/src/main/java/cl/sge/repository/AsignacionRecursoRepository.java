package cl.sge.repository;

import cl.sge.entity.AsignacionRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionRecursoRepository extends JpaRepository<AsignacionRecurso, Long> {

    // Find all assignments for a solicitud
    List<AsignacionRecurso> findBySolicitudId(Long solicitudId);
    
    // Find all assignments for a despliegue
    List<AsignacionRecurso> findByDespliegueId(Long despliegueId);
    
    // Count funcionarios assigned to a solicitud
    @Query("""
        SELECT COALESCE(SUM(SIZE(ar.funcionarios)), 0)
        FROM AsignacionRecurso ar
        WHERE ar.solicitud.id = :solicitudId
    """)
    Integer countFuncionariosBySolicitud(@Param("solicitudId") Long solicitudId);
    
    // Count vehicles assigned to a solicitud
    @Query("""
        SELECT COALESCE(SUM(SIZE(ar.vehiculos)), 0)
        FROM AsignacionRecurso ar
        WHERE ar.solicitud.id = :solicitudId
    """)
    Integer countVehiculosBySolicitud(@Param("solicitudId") Long solicitudId);
    
    // Check if a funcionario is currently deployed (avoid double assignment)
    @Query("""
        SELECT COUNT(ar) > 0 FROM AsignacionRecurso ar
        JOIN ar.funcionarios f
        JOIN ar.despliegue d
        WHERE f.rut = :rut
        AND (d.fechaTermino IS NULL OR d.fechaTermino > :now)
    """)
    boolean isFuncionarioDesplegado(@Param("rut") String rut, @Param("now") LocalDateTime now);
    
    // Check if a vehicle is currently deployed
    @Query("""
        SELECT COUNT(ar) > 0 FROM AsignacionRecurso ar
        JOIN ar.vehiculos v
        JOIN ar.despliegue d
        WHERE v.sigla = :sigla
        AND (d.fechaTermino IS NULL OR d.fechaTermino > :now)
    """)
    boolean isVehiculoDesplegado(@Param("sigla") String sigla, @Param("now") LocalDateTime now);
    
    // Get current deployment location for a funcionario
    @Query("""
        SELECT ar FROM AsignacionRecurso ar
        JOIN ar.funcionarios f
        JOIN ar.despliegue d
        WHERE f.rut = :rut
        AND (d.fechaTermino IS NULL OR d.fechaTermino > :now)
    """)
    Optional<AsignacionRecurso> findCurrentAssignmentByFuncionario(@Param("rut") String rut, @Param("now") LocalDateTime now);
}
