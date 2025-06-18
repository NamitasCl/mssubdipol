package cl.investigaciones.formularios.repository.formulariodinamico;

import cl.investigaciones.formularios.model.formulariodinamico.FormularioRegistro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FormularioRegistroRepository extends JpaRepository<FormularioRegistro, Long> {

    List<FormularioRegistro> findByFormularioId(Long formularioId);

    void deleteByFormularioId(Long formularioId);

    List<FormularioRegistro> findByFormularioIdAndIdFuncionario(Long formularioId, Integer idFuncionario);

    Collection<Object> findByFormularioIdAndIdUnidad(Long formularioId, Integer idUnidad);

    Optional<FormularioRegistro> findByIdAndIdFuncionario(Long registroId, Integer usuarioId);
}
