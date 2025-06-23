package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    int countSlotByIdCalendario(Long idCalendario);
}
