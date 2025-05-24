package cl.investigaciones.formularios.repository;

import cl.investigaciones.formularios.model.FormularioPermisos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FormularioPermisosRepository extends JpaRepository<FormularioPermisos, Long> {
    Optional<FormularioPermisos> findByFormularioId(Long formularioId);
}
