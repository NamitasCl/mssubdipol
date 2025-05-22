package cl.investigaciones.auth.repository;

import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(String nombre);

    @Query("SELECT f FROM usuarios f JOIN f.roles r WHERE r.nombre = 'ROLE_SUBJEFE' AND LOWER(f.siglasUnidad) = LOWER(:unidad)")
    Optional<Usuario> findSubjefeByUnidad(@Param("unidad") String unidad);
}
