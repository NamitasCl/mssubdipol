package cl.investigaciones.nodos.repository.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaDelito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListaDelitoRepository extends JpaRepository<ListaDelito, Long> {

    List<ListaDelito> findByDelitoContainingIgnoreCase(String delito);
}
