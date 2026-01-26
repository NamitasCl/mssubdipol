package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaTipoVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListaTipoVehiculoRepository extends JpaRepository<ListaTipoVehiculo, Long> {
    List<ListaTipoVehiculo> findAllByOrderByTipoVehiculoAsc();
}
