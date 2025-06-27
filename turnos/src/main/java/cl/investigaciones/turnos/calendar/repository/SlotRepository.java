package cl.investigaciones.turnos.calendar.repository;

import cl.investigaciones.turnos.calendar.domain.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    int countSlotByIdCalendario(Long idCalendario);

    List<Slot> findAllByIdCalendario(Long idCalendario);
}
