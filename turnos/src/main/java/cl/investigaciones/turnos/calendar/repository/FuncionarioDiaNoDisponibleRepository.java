package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.DiaNoDisponibleGlobal;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FuncionarioDiaNoDisponibleRepository extends JpaRepository<DiaNoDisponibleGlobal, Long> {
    List<DiaNoDisponibleGlobalResponse> findByIdFuncionario(Integer idFuncionario);
    void deleteByIdFuncionario(Long idFuncionario);
    List<DiaNoDisponibleGlobal> findByIdFuncionarioAndFechaBetween(Integer idFuncionario, LocalDate from, LocalDate to);
}

