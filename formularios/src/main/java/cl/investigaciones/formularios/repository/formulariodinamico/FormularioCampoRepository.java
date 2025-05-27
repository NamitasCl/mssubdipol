package cl.investigaciones.formularios.repository.formulariodinamico;


import cl.investigaciones.formularios.model.formulariodinamico.FormularioCampo;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormularioCampoRepository extends JpaRepository<FormularioCampo, Long> {
    void deleteByFormulario(FormularioDefinicion entidad);
}
