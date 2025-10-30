package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByCalendarioId(Long calendarioId);
}
