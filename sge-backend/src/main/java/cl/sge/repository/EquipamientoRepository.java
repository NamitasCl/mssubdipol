package cl.sge.repository;

import cl.sge.entity.Equipamiento;
import cl.sge.entity.Equipamiento.EstadoEquipamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipamientoRepository extends JpaRepository<Equipamiento, Long> {

    List<Equipamiento> findByEstado(EstadoEquipamiento estado);
    
    List<Equipamiento> findByUnidadPropietaria(String unidad);
    
    List<Equipamiento> findByRegionPropietaria(String region);
    
    Optional<Equipamiento> findByCodigoActivo(String codigoActivo);
    
    Optional<Equipamiento> findByNumeroSerie(String numeroSerie);
    
    // Find available equipment by type
    List<Equipamiento> findByTipoAndEstado(String tipo, EstadoEquipamiento estado);
}
