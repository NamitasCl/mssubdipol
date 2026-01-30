package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.plantilla.domain.TipoServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    int countSlotByIdCalendario(Long idCalendario);

    List<Slot> findAllByIdCalendario(Long idCalendario);

    List<Slot> findAllBySiglasUnidadFuncionario(String siglasUnidad);

    @Query("SELECT DISTINCT s FROM Slot s WHERE s.siglasUnidadFuncionario = :siglasUnidad AND s.cubierto = true")
    List<Slot> findFuncionariosAsignadosPorUnidad(@Param("siglasUnidad") String siglasUnidad);

    List<Slot> findAllBySiglasUnidadFuncionarioAndTipoServicio(String siglasUnidadFuncionario, TipoServicio tipoServicio);

    // -- MIS TURNOS --
    List<Slot> findAllByIdFuncionarioOrderByFechaAsc(Integer idFuncionario);

    @Query("SELECT s FROM Slot s JOIN Calendario c ON s.idCalendario = c.id " +
           "WHERE s.idFuncionario = :idFunc AND c.mes = :mes AND c.anio = :anio " +
           "ORDER BY s.fecha ASC")
    List<Slot> findByFuncionarioAndMesAnio(@Param("idFunc") Integer idFuncionario, 
                                           @Param("mes") int mes, 
                                           @Param("anio") int anio);

    // -- HISTORIAL 2 MESES PARA RESTRICCIONES --
    
    /**
     * Obtiene slots asignados a un funcionario en un rango de fechas.
     */
    @Query("SELECT s FROM Slot s WHERE s.idFuncionario = :idFunc AND s.fecha BETWEEN :desde AND :hasta ORDER BY s.fecha DESC")
    List<Slot> findByFuncionarioAndFechaBetween(@Param("idFunc") Integer idFuncionario,
                                                 @Param("desde") LocalDate desde,
                                                 @Param("hasta") LocalDate hasta);

    /**
     * Obtiene slots de fines de semana asignados a un funcionario en un rango de fechas.
     * Usa native query porque HQL no soporta EXTRACT(DOW FROM ...).
     * PostgreSQL: DOW 0 = Sunday, 6 = Saturday
     */
    @Query(value = "SELECT * FROM slot s WHERE s.id_funcionario = :idFunc " +
           "AND s.fecha BETWEEN :desde AND :hasta " +
           "AND EXTRACT(DOW FROM s.fecha) IN (0, 6) " +
           "ORDER BY s.fecha DESC", 
           nativeQuery = true)
    List<Slot> findFinDeSemanaByFuncionario(@Param("idFunc") Integer idFuncionario,
                                             @Param("desde") LocalDate desde,
                                             @Param("hasta") LocalDate hasta);
}



