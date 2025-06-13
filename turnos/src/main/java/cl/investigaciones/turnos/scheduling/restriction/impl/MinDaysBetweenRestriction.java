package cl.investigaciones.turnos.scheduling.restriction.impl;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import cl.investigaciones.turnos.scheduling.restriction.Restriction;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

public class MinDaysBetweenRestriction implements Restriction {

    private final int minDays;

    public MinDaysBetweenRestriction(int minDays) {
        this.minDays = minDays;
    }

    @Override
    public boolean isAllowed(ShiftSlot slot, Long staffId, Map<Long, List<ShiftSlot>> assigned) {
        List<ShiftSlot> prev = assigned.get(staffId);
        if (prev == null) return true;
        return prev.stream()
                .noneMatch(s -> ChronoUnit.DAYS.between(s.getDate(), slot.getDate()) < minDays);
    }

    @Override
    public String code() { return "MIN_DAYS_BETWEEN_" + minDays; }
}