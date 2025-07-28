package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.DiaNoDisponibleGlobal;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAportadoDiasNoDisponible;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

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

    @Transactional
    void deleteByCalendarioAndMotivo(Calendario calendario, String motivo);

    List<DiaNoDisponibleGlobal> findByFuncionarioAporte_Id(Integer idFuncionario);
}
