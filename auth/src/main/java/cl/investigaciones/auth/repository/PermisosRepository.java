package cl.investigaciones.auth.repository;

import cl.investigaciones.auth.model.Permiso;
import cl.investigaciones.auth.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermisosRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByNombre(String nombre);

}
