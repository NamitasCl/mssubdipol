package cl.investigaciones.turnos.scheduling.restriction;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import java.util.Map;

public interface Restriction {
    boolean isAllowed(ShiftSlot slot, Long staffId, Map<Long, java.util.List<ShiftSlot>> current);
    String code();
}