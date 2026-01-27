package cl.sge.repository;

import cl.sge.entity.DisponibilidadRecursos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisponibilidadRecursosRepository extends JpaRepository<DisponibilidadRecursos, Long> {
    
    // Find all availability reports for a specific region or jefatura
    List<DisponibilidadRecursos> findByRegionOJefatura(String regionOJefatura);
    
    // Find by specific unit
    List<DisponibilidadRecursos> findByUnidad(String unidad);
    
    // Find by estado
    List<DisponibilidadRecursos> findByEstado(DisponibilidadRecursos.EstadoDisponibilidad estado);
    
    // Find disponible resources by region
    List<DisponibilidadRecursos> findByRegionOJefaturaAndEstado(
        String regionOJefatura, 
        DisponibilidadRecursos.EstadoDisponibilidad estado
    );
    // Find available resources by event ID
    List<DisponibilidadRecursos> findByEventoIdAndEstado(Long eventoId, DisponibilidadRecursos.EstadoDisponibilidad estado);
}
