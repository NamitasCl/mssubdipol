package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.UnidadColaboradora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnidadColaboradoraRepository extends JpaRepository<UnidadColaboradora, Long> {

    List<UnidadColaboradora> findByTurnoAsignacion_MesAndTurnoAsignacion_Anio(int mes, int anio);

    Optional<UnidadColaboradora> findByNombreUnidadAndTurnoAsignacion_MesAndTurnoAsignacion_Anio(
            String nombreUnidad, int mes, int anio);

}