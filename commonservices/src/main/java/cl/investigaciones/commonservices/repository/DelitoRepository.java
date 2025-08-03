package cl.investigaciones.commonservices.repository;

import cl.investigaciones.commonservices.model.Delito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DelitoRepository extends JpaRepository<Delito, Long> {
    List<Delito> findByDelitoContainingIgnoreCase(String delito);
}
