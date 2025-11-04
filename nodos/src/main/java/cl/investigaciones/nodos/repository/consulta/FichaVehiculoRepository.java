package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FichaVehiculoRepository extends JpaRepository<FichaVehiculo, Long> {

    /**
     * Obtiene todos los vehículos con sus relaciones básicas (marca, modelo, memo)
     * utilizando fetch joins para evitar problemas de LazyInitialization.
     */
    @Query("""
            select distinct v
            from FichaVehiculo v
            left join fetch v.tipo t
            left join fetch v.marca m
            left join fetch v.modelo mo
            left join fetch v.memo me
            left join fetch me.unidad u
            """)
    List<FichaVehiculo> findAllWithRelations();

}
