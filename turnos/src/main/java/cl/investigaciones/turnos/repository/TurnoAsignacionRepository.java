package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.dto.TurnoAsignacionDTO;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TurnoAsignacionRepository extends JpaRepository<TurnoAsignacion, Long> {

    Optional<TurnoAsignacion> findByMesAndAnio(int mes, int anio);

    @Query(value = "SELECT COUNT(*) " +
            "FROM dia_asignacion_unidades du " +
            "JOIN dia_asignacion d ON du.dia_asignacion_id = d.id " +
            "JOIN turno_asignacion t ON d.turno_asignacion_id = t.id " +
            "WHERE t.mes = :mes AND t.anio = :anio " +
            "AND REPLACE(du.unidad, ' ', '') = REPLACE(:unidad, ' ', '')",
            nativeQuery = true)
    int countTurnosForUnidad(
            @Param("unidad") String unidad,
            @Param("mes") int mes,
            @Param("anio") int anio
    );

    List<TurnoAsignacion> findByActivoTrue();

    Optional<TurnoAsignacion> findByMesAndAnioAndActivoTrue(int mes, int anio);

    List<TurnoAsignacion> findAllByIdFuncionario(Integer idFuncionario);

    Optional<TurnoAsignacion> findByMesAndAnioAndNombreCalendario(int mes, int anio, String nombreCalendario);

}