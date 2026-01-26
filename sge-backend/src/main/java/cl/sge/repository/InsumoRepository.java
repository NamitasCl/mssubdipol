package cl.sge.repository;

import cl.sge.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    List<Insumo> findByUnidadDueña(String unidadDueña);
    List<Insumo> findByRegisteredBy(String registeredBy);
}
