package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.dto.FuncionariosDisponiblesResponseDTO;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AsignacionFuncionarioRepository extends JpaRepository<AsignacionFuncionario, Long> {
    List<AsignacionFuncionario> findByMesAndAnioAndUnidad(int mes, int anio, String unidad);
    Optional<AsignacionFuncionario> findById(Long id);

    @Query("""
    SELECT new cl.investigaciones.turnos.dto.FuncionariosDisponiblesResponseDTO(
        af.id, af.idFuncionario, af.nombreCompleto, af.siglasCargo, af.antiguedad, af.unidad
    )
    FROM AsignacionFuncionario af
    WHERE af.mes = :mes AND af.anio = :anio
    """)
    List<FuncionariosDisponiblesResponseDTO> findFuncionariosDisponibles(@Param("mes") int mes, @Param("anio") int anio);

    Optional<AsignacionFuncionario> findByIdFuncionarioAndMesAndAnioAndUnidad(
            int idFuncionario, int mes, int anio, String unidad);


    Optional<AsignacionFuncionario> findByIdFuncionarioAndMesAndAnio(int idFuncionario, int mes, int anio);
    Optional<AsignacionFuncionario> findByIdAndMesAndAnio(Long id, int mes, int anio);

    Optional<AsignacionFuncionario> findByIdFuncionario(int idFuncionario);
}
