package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAportadoDiasNoDisponible;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioAportadoDiasNoDisponibleRepository extends JpaRepository<FuncionarioAportadoDiasNoDisponible, Long> {
    void deleteByFuncionarioAporte(FuncionarioAporte entity);
}
