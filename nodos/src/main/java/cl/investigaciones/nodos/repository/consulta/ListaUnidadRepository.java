package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaUnidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListaUnidadRepository extends JpaRepository<ListaUnidad, Long> {
    ListaUnidad findByNombreUnidad(String nombreUnidad);
}
