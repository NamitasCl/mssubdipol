package cl.investigaciones.formularios.repository.formulariodinamico;

import cl.investigaciones.formularios.model.formulariodinamico.AsignacionCuotaFormulario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsignacionCuotaFormularioRepository extends JpaRepository<AsignacionCuotaFormulario, Long> {
    List<AsignacionCuotaFormulario> findByFormularioId(Long formularioId);

    List<AsignacionCuotaFormulario> findByFormularioIdAndIdUnidad(Long formularioId, Integer idUnidad);

    List<AsignacionCuotaFormulario> findByIdUnidad(Integer idUnidad);

    List<AsignacionCuotaFormulario> findByIdFuncionario(Integer idFuncionario);

    List<AsignacionCuotaFormulario> findByCuotaPadreId(Long cuotaPadreId);

}
