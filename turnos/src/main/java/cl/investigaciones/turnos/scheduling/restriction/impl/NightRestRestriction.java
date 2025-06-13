package cl.investigaciones.turnos.scheduling.restriction.impl;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import cl.investigaciones.turnos.scheduling.restriction.Restriction;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class NightRestRestriction implements Restriction {
    @Override
    public boolean isAllowed(ShiftSlot slot, Long staffId, Map<Long, List<ShiftSlot>> assigned) {
        if (assigned.get(staffId) == null) return true;
        return assigned.get(staffId).stream()
                .noneMatch(s -> s.getRole().isNight() && ChronoUnit.DAYS.between(s.getDate(), slot.getDate()) < 2);
    }
    @Override public String code() { return "REST_AFTER_NIGHT"; }
}