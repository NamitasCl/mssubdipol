package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.plantilla.domain.TipoServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    int countSlotByIdCalendario(Long idCalendario);

    List<Slot> findAllByIdCalendario(Long idCalendario);

    List<Slot> findAllBySiglasUnidadFuncionario(String siglasUnidad);

    @Query("SELECT DISTINCT s FROM Slot s WHERE s.siglasUnidadFuncionario = :siglasUnidad AND s.cubierto = true")
    List<Slot> findFuncionariosAsignadosPorUnidad(@Param("siglasUnidad") String siglasUnidad);

    List<Slot> findAllBySiglasUnidadFuncionarioAndTipoServicio(String siglasUnidadFuncionario, TipoServicio tipoServicio);
}
