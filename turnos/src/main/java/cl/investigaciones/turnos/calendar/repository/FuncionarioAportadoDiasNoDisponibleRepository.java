package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.DiaNoDisponibleGlobal;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAportadoDiasNoDisponible;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FuncionarioAportadoDiasNoDisponibleRepository extends JpaRepository<FuncionarioAportadoDiasNoDisponible, Long> {
    void deleteByFuncionarioAporte(FuncionarioAporte entity);

    List<FuncionarioAportadoDiasNoDisponible> findByFuncionarioAporte(FuncionarioAporte entity);
    boolean existsByFuncionarioAporte_IdAndFechaAndCalendario_IdAndMotivo(
            Long funcionarioAporteId,
            LocalDate fecha,
            Long calendarioId,
            String motivo
    );

    List<FuncionarioAportadoDiasNoDisponible> findAllByCalendarioIdAndMotivo(Long calendarioId, String motivo);

    @Modifying
    @Transactional
    @Query("DELETE FROM FuncionarioAportadoDiasNoDisponible f WHERE f.calendario.id = :calendarioId AND f.motivo = :motivo")
    void deleteAllByCalendarioIdAndMotivo(@Param("calendarioId") Long calendarioId, @Param("motivo") String motivo);


    List<FuncionarioAportadoDiasNoDisponible> findByFuncionarioAporte_Id(Long idFuncionario);
}
