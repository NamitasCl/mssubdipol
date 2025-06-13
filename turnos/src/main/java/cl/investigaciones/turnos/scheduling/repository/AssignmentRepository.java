package cl.investigaciones.turnos.scheduling.repository;

import cl.investigaciones.turnos.scheduling.domain.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> { }