package cl.investigaciones.formularios.repository.formulariodinamico;

import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormularioDefinicionRepository extends JpaRepository<FormularioDefinicion, Long> {
    List<FormularioDefinicion> findAllByIdCreador(Integer idCreador);
}
