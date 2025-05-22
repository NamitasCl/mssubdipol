package cl.investigaciones.commonservices.repository;

import cl.investigaciones.commonservices.model.Unidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnidadesRepository extends JpaRepository<Unidad, Long> {
    Optional<Unidad> findByIdUnidad(int idUnidad);

    List<Unidad> findByNombreUnidadContainingIgnoreCase(String nombre);
}
