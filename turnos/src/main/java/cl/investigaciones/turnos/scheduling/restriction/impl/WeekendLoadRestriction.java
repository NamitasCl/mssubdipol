package cl.investigaciones.turnos.scheduling.restriction.impl;

import cl.investigaciones.turnos.scheduling.domain.ShiftSlot;
import cl.investigaciones.turnos.scheduling.restriction.Restriction;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

public class WeekendLoadRestriction implements Restriction {
    @Override
    public boolean isAllowed(ShiftSlot slot, Long staffId, Map<Long, List<ShiftSlot>> assigned) {
        // Solo aplica a fines de semana
        DayOfWeek dow = slot.getDate().getDayOfWeek();
        if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) return true;
        List<ShiftSlot> prev = assigned.get(staffId);
        if (prev == null) return true;

        // Contar fines de semana ocupados
        long occupiedWeekends = prev.stream()
                .filter(s -> {
                    DayOfWeek d = s.getDate().getDayOfWeek();
                    return d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY;
                })
                .map(s -> s.getDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.SATURDAY)))
                .distinct()
                .count();

        long sameWeekendCount = prev.stream()
                .filter(s -> s.getDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.SATURDAY))
                        .equals(slot.getDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.SATURDAY))))
                .count();

        // Permitir máximo 2 fines de semana y máximo 1 día por fin de semana
        return occupiedWeekends < 2 && sameWeekendCount == 0;
    }
    @Override public String code() { return "WEEKEND_LOAD"; }
}