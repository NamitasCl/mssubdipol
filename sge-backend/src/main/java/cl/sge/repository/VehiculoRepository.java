package cl.sge.repository;

import cl.sge.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, String> {
    long countByUnidad(String unidad);
    long countByEstado(Vehiculo.EstadoLogistico estado);
    long countByUnidadAndEstado(String unidad, Vehiculo.EstadoLogistico estado);
}
